import React, { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { InspectionAnswerValue, InspectionType, type InspectionChecklistItem, type InspectionChecklistTemplateResponse } from '@aurelia/contracts';
import { BotBubble } from '../../shared/components/chat/BotBubble';
import { UserBubble } from '../../shared/components/chat/UserBubble';
import { TypingIndicator } from '../../shared/components/chat/TypingIndicator';
import { ChipRow } from '../../shared/components/chat/ChipRow';
import { QuickOpts } from '../../shared/components/chat/QuickOpts';
import { CompanySuggestionCard } from '../../shared/components/chat/CompanySuggestionCard';
import { PersonnelPicker } from '../../shared/components/chat/PersonnelPicker';
import { PhotoStepWidget } from '../../shared/components/chat/PhotoStepWidget';
import { ErrorBubble } from '../../shared/components/chat/ErrorBubble';
import { ChatLocationWidget } from '../../shared/components/chat/ChatLocationWidget';
import { ChatHeader } from '../../shared/components/layout/ChatHeader';
import { ChatInput } from '../../shared/components/layout/ChatInput';
import { getMobileBootstrapLocalFirst } from '../../shared/offline/local-catalogs';
import { colors, fontSize, fontWeight, radius, spacing } from '../../shared/theme/tokens';
import { fetchAreas, fetchSectors, type AreaResponse, type SectorResponse, type CompanyResponse } from '../../shared/services/api/organization.api';
import { fetchInspectionTypes, type InspectionTypeResponse } from '../../shared/services/api/inspection-types.api';
import { fetchUsers, type UserResponse } from '../../shared/services/api/users.api';
import { useManualConnectivityStatus } from './useManualConnectivityStatus';
import { useManualInspectionDraft } from './manualInspection.store';
import { useManualInspectionLocation } from './useManualInspectionLocation';
import { useInspectionChecklistTemplates } from './hooks/useInspectionChecklistTemplates';
import { useManualInspectionCompanies } from './hooks/useManualInspectionCompanies';
import { useSaveManualInspectionOffline } from './hooks/useSaveManualInspectionOffline';

type Row = InspectionChecklistItem & { index: number; sectionTitle: string };
type Msg = { id: string; t: string; data?: any };
let seq = 0;
const areaKey = ['areas'] as const;
const typeKey = ['inspection-types'] as const;
const sectorKey = (id: string) => ['sectors', id] as const;
const peopleKey = (id: string) => ['personnel', id] as const;

function id() { seq += 1; return String(seq); }
function sleep(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }
function dateText(d: Date) { return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`; }
function dates() { return Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return dateText(d); }); }
function itemsOf(t: InspectionChecklistTemplateResponse | null): Row[] { if (!t) return []; return t.sections.slice().sort((a, b) => a.sortOrder - b.sortOrder).flatMap((s) => s.items.slice().sort((a, b) => a.sortOrder - b.sortOrder).map((x) => ({ ...x, sectionTitle: s.title, index: 0 }))).map((x, index) => ({ ...x, index })); }
function count(t: InspectionChecklistTemplateResponse) { return t.sections.reduce((n, s) => n + s.items.length, 0); }
function asset(uri: string, fallback: string) { const name = uri.split('/').pop(); return { uri, name: name && name.includes('.') ? name : fallback }; }
function ans(v?: InspectionAnswerValue) { if (v === InspectionAnswerValue.COMPLIANT) return 'SÍ'; if (v === InspectionAnswerValue.NOT_COMPLIANT) return 'NO'; if (v === InspectionAnswerValue.NOT_APPLICABLE) return 'N/A'; return 'Pendiente'; }
function typeId(rows: InspectionTypeResponse[]) { return rows.find((x) => x.code === InspectionType.REGULATORY)?.id ?? null; }
async function loadTemplates() { const bootstrap = await getMobileBootstrapLocalFirst(); return bootstrap.catalogs.inspectionTemplates; }
async function loadCompanies() { const bootstrap = await getMobileBootstrapLocalFirst(); return bootstrap.catalogs.companies.filter((company) => company.isContractor); }

export function InspectionChatScreenV2() {
  const draft = useManualInspectionDraft();
  const q = useQueryClient();
  const ref = useRef<ScrollView>(null);
  const retries = useRef<Map<string, () => void>>(new Map());
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [peopleDone, setPeopleDone] = useState<Set<string>>(new Set());
  const [waiting, setWaiting] = useState<string | null>(null);
  const { online, hasSession } = useManualConnectivityStatus();
  const { captureLocation, capturing, locationError } = useManualInspectionLocation();
  const templatesQuery = useInspectionChecklistTemplates();
  const companiesQuery = useManualInspectionCompanies();
  const save = useSaveManualInspectionOffline();
  const templates = templatesQuery.data ?? [];
  const companies = companiesQuery.data ?? [];
  const template = useMemo(() => templates.find((x) => x.id === draft.templateId) ?? null, [templates, draft.templateId]);
  const rows = useMemo(() => itemsOf(template), [template]);

  function push(t: string, data?: any) { const x = { id: id(), t, data }; setMsgs((m) => [...m, x]); setTimeout(() => ref.current?.scrollToEnd({ animated: true }), 80); return x.id; }
  function clearTyping() { setMsgs((m) => m.filter((x) => x.t !== 'typing')); }
  function resolve(x: string) { setDone((s) => new Set(s).add(x)); }
  function err(message: string, retry?: () => void) { const x = push('error', { message }); if (retry) retries.current.set(x, retry); }

  async function start() {
    useManualInspectionDraft.getState().reset();
    push('typing');
    try { const areas = await q.fetchQuery({ queryKey: areaKey, queryFn: fetchAreas, staleTime: 300000 }); clearTyping(); push('bot', 'Hola, soy AurelIA. Levantaremos un Checklist normativo equivalente al formulario manual. Selecciona el área.'); push('areas', areas); }
    catch { clearTyping(); err('No pude cargar catálogos.', start); }
  }
  useEffect(() => { const x = setTimeout(start, 400); return () => clearTimeout(x); }, []);

  async function area(a: AreaResponse, mid: string) { resolve(mid); draft.setArea(a.id, a.name); push('user', a.name); push('typing'); try { const ss = await q.fetchQuery({ queryKey: sectorKey(a.id), queryFn: () => fetchSectors(a.id), staleTime: 300000 }); clearTyping(); push('bot', 'Selecciona el sector.'); push('sectors', ss); } catch { clearTyping(); err('No pude cargar sectores.', () => area(a, mid)); } }
  async function sector(s: SectorResponse, mid: string) { resolve(mid); draft.setSector(s.id, s.name); push('user', s.name); push('typing'); try { const ts = await q.fetchQuery({ queryKey: typeKey, queryFn: fetchInspectionTypes, staleTime: 300000 }); clearTyping(); const regId = typeId(ts); push('bot', 'Selecciona el tipo de inspección.'); push('types', [{ value: InspectionType.ENVIRONMENTAL, label: 'Hallazgo', icon: 'search' }, { value: InspectionType.REGULATORY, label: 'Checklist normativo', icon: 'clipboard-check', inspectionTypeId: regId }]); } catch { clearTyping(); err('No pude resolver tipos.', () => sector(s, mid)); } }
  async function type(opt: any, mid: string) { resolve(mid); push('user', opt.label); if (opt.value !== InspectionType.REGULATORY) { err('Hallazgo asistido queda pendiente. Para esta iteración continuamos con Checklist normativo.'); return; } if (!opt.inspectionTypeId) { err('Falta Checklist normativo en bootstrap.'); return; } draft.setInspectionType(InspectionType.REGULATORY, 'Checklist normativo'); await sleep(200); push('bot', 'Selecciona la fecha de inspección.'); push('dates', dates()); }
  async function date(v: string, mid: string) { resolve(mid); draft.setInspectionDate(v); push('user', v); await sleep(200); push('bot', 'Capturemos la ubicación obligatoria.'); push('loc'); }
  async function loc(mid: string) { const ok = await captureLocation(); if (!ok) { err(locationError ?? 'No se pudo capturar ubicación.', () => loc(mid)); return; } resolve(mid); push('user', `Ubicación capturada · ${useManualInspectionDraft.getState().locationAccuracyLabel}`); await askTemplate(); }
  async function askTemplate() { push('typing'); try { const list = await loadTemplates(); clearTyping(); if (!list.length) { err('No hay plantillas disponibles.'); return; } push('bot', 'Te sugiero esta plantilla normativa.'); push('templatePick', { template: list[0], templates: list }); } catch { clearTyping(); err('No pude cargar plantillas normativas.', askTemplate); } }
  async function selectTemplate(t: InspectionChecklistTemplateResponse, mid: string) { resolve(mid); draft.setTemplate({ id: t.id, name: t.name, code: t.code, itemsCount: count(t) }); push('user', t.name); await sleep(200); push('bot', 'Adjunta la foto general obligatoria.'); push('generalPhoto'); }
  function otherTemplates(list: InspectionChecklistTemplateResponse[], mid: string) { resolve(mid); push('bot', 'Elige una plantilla.'); push('templates', list); }
  async function generalPhoto(uri: string, mid: string) { resolve(mid); draft.setGeneralPhoto(asset(uri, 'foto_general.jpg')); push('user', 'Foto general registrada'); await sleep(200); const currentTemplate = templates.find((x) => x.id === useManualInspectionDraft.getState().templateId) ?? template; const currentRows = itemsOf(currentTemplate); const first = currentRows[0]; if (!first) { err('La plantilla no tiene ítems.'); return; } push('bot', `Responderemos ${currentRows.length} ítems.`); push('question', first); }
  async function answer(row: Row, v: InspectionAnswerValue, mid: string) { resolve(mid); draft.setAnswer(row.id, v); push('user', `${row.code}: ${ans(v)}`); if (v === InspectionAnswerValue.NOT_COMPLIANT) { await sleep(200); push('bot', 'Describe la condición detectada.'); setWaiting(`cond:${row.id}`); return; } await next(row.index); }
  async function next(i: number) { await sleep(200); const n = rows[i + 1]; if (n) { push('question', n); return; } await finishItems(); }
  async function finishItems() { const st = useManualInspectionDraft.getState(); const has = rows.some((r) => st.answersByItemId[r.id] === InspectionAnswerValue.NOT_COMPLIANT); if (!has) { push('bot', 'Checklist completo sin hallazgos. Se cerrará automáticamente al guardar.'); await summary(); return; } push('typing'); try { const list = await loadCompanies(); clearTyping(); const c = list.find((x) => x.name.toUpperCase() === 'SOMACOR') ?? list[0]; if (!c) { err('No hay empresas disponibles.'); return; } push('bot', 'Hay ítems no conformes. Sugiero empresa responsable.'); push('companyPick', { company: c, companies: list }); } catch { clearTyping(); err('No pude cargar empresas.', finishItems); } }
  async function cond(text: string, itemId: string) { draft.setItemDetail(itemId, { detectedCondition: text }); push('user', text); await sleep(200); push('bot', 'Indica la medida correctiva propuesta.'); setWaiting(`measure:${itemId}`); }
  async function measure(text: string, itemId: string) { draft.setItemDetail(itemId, { correctiveAction: text }); push('user', text); const row = rows.find((x) => x.id === itemId); if (!row) return; await sleep(200); push('bot', 'Adjunta foto para este hallazgo.'); push('itemPhoto', row); setWaiting(null); }
  async function itemPhoto(uri: string, row: Row, mid: string) { resolve(mid); draft.setItemDetail(row.id, { evidence: asset(uri, `foto_obs${row.index + 1}.jpg`) }); push('user', `Foto registrada · ${row.code}`); await next(row.index); }
  function otherCompany(list: CompanyResponse[], mid: string) { resolve(mid); push('bot', 'Selecciona empresa responsable.'); push('companies', list); }
  async function company(c: CompanyResponse, mid: string) { resolve(mid); draft.setFindingCompany(c.id, c.name); push('user', `${c.name} confirmada`); push('typing'); try { const users = await q.fetchQuery({ queryKey: peopleKey(c.id), queryFn: () => fetchUsers({ companyId: c.id }), staleTime: 300000 }); clearTyping(); if (users.length) { push('bot', 'Selecciona responsables para seguimiento.'); push('people', users); } else { await summary('No hay personal registrado para esta empresa.'); } } catch { clearTyping(); err('No pude cargar personal.', () => company(c, mid)); } }
  async function people(selected: UserResponse[], mid: string) { setPeopleDone((s) => new Set(s).add(mid)); draft.setFindingResponsibles(selected.map((u) => u.id)); push('user', `Personal: ${selected.map((u) => u.fullName).join(', ') || 'Nadie seleccionado'}`); await summary(); }
  async function summary(intro?: string) { if (intro) push('bot', intro); await sleep(250); push('bot', 'Revisa el resumen antes de guardar.'); push('summary'); }
  async function submit(mid: string) { resolve(mid); const st = useManualInspectionDraft.getState(); let t = templates.find((x) => x.id === st.templateId); if (!t) { const fresh = await loadTemplates(); t = fresh.find((x) => x.id === st.templateId); } if (!t) { err('Falta plantilla.'); return; } push('typing'); try { const result = await save.mutateAsync({ draft: st, template: t, items: itemsOf(t), trySyncNow: online && hasSession }); useManualInspectionDraft.getState().setLastSavedResult(result); clearTyping(); router.replace({ pathname: '/inspection/success', params: { inspectionId: result.inspectionId, findingsCount: String(result.noCount), evidencesCount: String(1 + result.noCount), areaName: st.areaName ?? '', sectorName: st.sectorName ?? '', companyName: st.findingCompanyName ?? st.inspectorCompanyName, personnelNames: st.findingResponsibleIds.length ? `${st.findingResponsibleIds.length} responsables seleccionados` : '', criticalCount: '0' } }); } catch { clearTyping(); err('Error al guardar.', () => submit(mid)); } }
  function send(text: string) { if (!waiting) return; if (waiting.startsWith('cond:')) void cond(text, waiting.replace('cond:', '')); if (waiting.startsWith('measure:')) void measure(text, waiting.replace('measure:', '')); }

  function renderSummary(m: Msg) { const st = useManualInspectionDraft.getState(); const no = rows.filter((r) => st.answersByItemId[r.id] === InspectionAnswerValue.NOT_COMPLIANT).length; return <View key={m.id} style={styles.sum}><View style={styles.card}><View style={styles.head}><Text style={styles.headText}>Datos generales</Text><Text style={styles.pill}>Checklist normativo</Text></View><R l="Inspector" v={st.inspectorName} /><R l="Área · Sector" v={[st.areaName, st.sectorName].filter(Boolean).join(' · ')} /><R l="Fecha" v={st.inspectionDate} /><R l="Ubicación" v={st.locationLabel} /><R l="Plantilla" v={st.templateName ?? '—'} /><R l="Empresa EECC" v={st.findingCompanyName ?? (no ? 'Pendiente' : 'No aplica')} /></View><View style={styles.card}><View style={styles.head}><Text style={styles.headText}>{rows.length} Ítems · {no} hallazgos</Text></View><View style={styles.items}>{rows.map((r) => <View key={r.id} style={styles.ir}><Text style={styles.it}>{r.index + 1}. {r.code}</Text><Text style={styles.ia}>{ans(st.answersByItemId[r.id])}</Text></View>)}</View></View><TouchableOpacity onPress={() => submit(m.id)} disabled={save.isPending} style={styles.save}><Text style={styles.saveText}>{save.isPending ? 'Guardando…' : '✓ Guardar inspección'}</Text></TouchableOpacity></View>; }

  function render(m: Msg) { const r = done.has(m.id); if (m.t === 'bot') return <BotBubble key={m.id} text={m.data} />; if (m.t === 'user') return <UserBubble key={m.id} text={m.data} />; if (m.t === 'typing') return <TypingIndicator key={m.id} />; if (m.t === 'error') return <ErrorBubble key={m.id} message={m.data.message} onRetry={retries.current.get(m.id)} />; if (m.t === 'areas') return <ChipRow key={m.id} chips={m.data.map((x: AreaResponse) => x.name)} selected={r ? draft.areaName : null} onSelect={(name) => { const x = m.data.find((a: AreaResponse) => a.name === name); if (!r && x) void area(x, m.id); }} />; if (m.t === 'sectors') return <ChipRow key={m.id} chips={m.data.map((x: SectorResponse) => x.name)} selected={r ? draft.sectorName : null} onSelect={(name) => { const x = m.data.find((s: SectorResponse) => s.name === name); if (!r && x) void sector(x, m.id); }} />; if (m.t === 'types') return <QuickOpts key={m.id} options={m.data.map((x: any) => ({ value: x.value, label: x.label, icon: x.icon }))} selected={r ? InspectionType.REGULATORY : null} onSelect={(v) => { const x = m.data.find((o: any) => o.value === v); if (!r && x) void type(x, m.id); }} />; if (m.t === 'dates') return <QuickOpts key={m.id} options={m.data.map((x: string) => ({ value: x, label: x }))} selected={r ? draft.inspectionDate : null} onSelect={(v) => { if (!r) void date(v, m.id); }} />; if (m.t === 'loc') return <ChatLocationWidget key={m.id} captured={draft.locationCaptured} label={draft.locationLabel} accuracy={draft.locationAccuracyLabel} capturing={capturing} resolved={r} onCapture={() => loc(m.id)} />; if (m.t === 'templatePick') return <QuickOpts key={m.id} options={[{ value: 'ok', label: `Confirmar ${m.data.template.name}`, icon: 'check' }, { value: 'other', label: 'Elegir otra', icon: 'list' }]} selected={r ? 'ok' : null} onSelect={(v) => { if (v === 'ok') void selectTemplate(m.data.template, m.id); if (v === 'other') otherTemplates(m.data.templates, m.id); }} />; if (m.t === 'templates') return <ChipRow key={m.id} chips={m.data.map((x: InspectionChecklistTemplateResponse) => x.name)} selected={r ? draft.templateName : null} onSelect={(name) => { const x = m.data.find((t: InspectionChecklistTemplateResponse) => t.name === name); if (!r && x) void selectTemplate(x, m.id); }} />; if (m.t === 'generalPhoto') return <PhotoStepWidget key={m.id} resolved={r} onSkip={() => err('La foto general es obligatoria.')} onCapture={(uri) => generalPhoto(uri, m.id)} />; if (m.t === 'question') return <QuickOpts key={m.id} options={[{ value: InspectionAnswerValue.COMPLIANT, label: `SÍ · ${m.data.code}` }, { value: InspectionAnswerValue.NOT_COMPLIANT, label: `NO · ${m.data.code}` }, { value: InspectionAnswerValue.NOT_APPLICABLE, label: `N/A · ${m.data.code}` }]} selected={r ? draft.answersByItemId[m.data.id] ?? null : null} onSelect={(v) => { if (!r) void answer(m.data, v as InspectionAnswerValue, m.id); }} />; if (m.t === 'itemPhoto') return <PhotoStepWidget key={m.id} resolved={r} onSkip={() => err('La foto del hallazgo es obligatoria.')} onCapture={(uri) => itemPhoto(uri, m.data, m.id)} />; if (m.t === 'companyPick') return <CompanySuggestionCard key={m.id} company={m.data.company} reason="Empresa sugerida para gestionar los hallazgos." disabled={r} onChooseOther={() => otherCompany(m.data.companies, m.id)} onConfirm={() => company(m.data.company, m.id)} />; if (m.t === 'companies') return <ChipRow key={m.id} chips={m.data.map((x: CompanyResponse) => x.name)} selected={r ? draft.findingCompanyName : null} onSelect={(name) => { const x = m.data.find((c: CompanyResponse) => c.name === name); if (!r && x) void company(x, m.id); }} />; if (m.t === 'people') return <PersonnelPicker key={m.id} users={m.data} confirmed={peopleDone.has(m.id)} onConfirm={(xs) => people(xs, m.id)} />; if (m.t === 'summary') return renderSummary(m); return null; }

  return <SafeAreaProvider><View style={styles.screen}><ChatHeader currentStep={5} agentStatus={save.isPending ? 'thinking' : 'active'} /><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView ref={ref} style={styles.flex} contentContainerStyle={styles.chat} showsVerticalScrollIndicator={false}>{msgs.map(render)}</ScrollView><ChatInput onSend={send} disabled={waiting === null} /></KeyboardAvoidingView></View></SafeAreaProvider>;
}

function R({ l, v }: { l: string; v: string }) { return <View style={styles.row}><Text style={styles.label}>{l}</Text><Text style={styles.value}>{v || '—'}</Text></View>; }

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.surface }, flex: { flex: 1 }, chat: { padding: spacing.md, gap: spacing.sm + 2, paddingBottom: spacing.xl }, sum: { gap: spacing.sm }, card: { backgroundColor: colors.white, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, overflow: 'hidden' }, head: { alignItems: 'center', backgroundColor: colors.navy, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: 7 }, headText: { color: colors.white, fontSize: fontSize.sm, fontWeight: fontWeight.bold }, pill: { backgroundColor: colors.tealSurf, borderRadius: 4, color: colors.tealTxt, fontSize: 9, fontWeight: fontWeight.bold, paddingHorizontal: 6, paddingVertical: 2 }, row: { borderBottomColor: colors.border, borderBottomWidth: 1, flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: 8 }, label: { color: colors.muted, fontSize: fontSize.xs, width: 92 }, value: { color: colors.primary, flex: 1, fontSize: fontSize.sm, fontWeight: fontWeight.bold }, items: { gap: 6, padding: spacing.md }, ir: { flexDirection: 'row', justifyContent: 'space-between' }, it: { color: colors.primary, flex: 1, fontSize: fontSize.xs }, ia: { color: colors.navy, fontSize: fontSize.xs, fontWeight: fontWeight.bold, marginLeft: spacing.sm }, save: { alignItems: 'center', backgroundColor: colors.ok, borderRadius: radius.md + 4, height: 48, justifyContent: 'center', marginTop: spacing.sm }, saveText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.bold } });
