import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { InspectionType } from '@aurelia/contracts';
import { BotBubble } from '../../shared/components/chat/BotBubble';
import { UserBubble } from '../../shared/components/chat/UserBubble';
import { TypingIndicator } from '../../shared/components/chat/TypingIndicator';
import { ChipRow } from '../../shared/components/chat/ChipRow';
import { QuickOpts } from '../../shared/components/chat/QuickOpts';
import { AiProposalCard } from '../../shared/components/chat/AiProposalCard';
import { PersonnelPicker } from '../../shared/components/chat/PersonnelPicker';
import { PhotoStepWidget } from '../../shared/components/chat/PhotoStepWidget';
import { ErrorBubble } from '../../shared/components/chat/ErrorBubble';
import { SubmitWidget } from '../../shared/components/chat/SubmitWidget';
import { ChatHeader } from '../../shared/components/layout/ChatHeader';
import { ChatInput } from '../../shared/components/layout/ChatInput';
import { colors, spacing } from '../../shared/theme/tokens';
import { fetchAreas, fetchSectors, fetchCompanies, type AreaResponse, type SectorResponse, type CompanyResponse } from '../../shared/services/api/organization.api';
import { fetchInspectionTypes, type InspectionTypeResponse } from '../../shared/services/api/inspection-types.api';
import { fetchUsers, type UserResponse } from '../../shared/services/api/users.api';
import { suggestCorrectiveMeasure, suggestCompany } from '../../shared/services/api/ai.api';
import { useInspectionFlow } from './useInspectionFlow';
import { useManualConnectivityStatus } from './useManualConnectivityStatus';
import { useSaveAssistantInspectionOffline } from './hooks/useSaveAssistantInspectionOffline';

const AREAS_KEY = ['areas'] as const;
const TYPES_KEY = ['inspection-types'] as const;
const COMPANIES_KEY = ['companies', 'contractors'] as const;
const sectorsKey = (areaId: string) => ['sectors', areaId] as const;
const personnelKey = (companyId: string) => ['personnel', companyId] as const;
const PROBS = ['1 · Muy improbable', '2 · Improbable', '3 · Posible', '4 · Probable', '5 · Casi seguro'];
const CONS = ['1 · Insignificante', '2 · Menor', '3 · Moderado', '4 · Mayor', '5 · Catastrófico'];
const SLA_LABEL: Record<string, string> = { Bajo: '14 días', Medio: '7 días', Alto: '3 días', Crítico: '1 día' };

type AssistantTypeOption = { value: InspectionType; label: string; icon: string; inspectionTypeId: string | null };
type MessageItem =
  | { id: string; type: 'bot'; text: string }
  | { id: string; type: 'user'; text: string }
  | { id: string; type: 'typing' }
  | { id: string; type: 'error'; message: string }
  | { id: string; type: 'area_chips'; areas: AreaResponse[] }
  | { id: string; type: 'sector_chips'; sectors: SectorResponse[] }
  | { id: string; type: 'tipo_opts'; tipos: AssistantTypeOption[] }
  | { id: string; type: 'prob_chips' }
  | { id: string; type: 'cons_chips' }
  | { id: string; type: 'more_obs_opts' }
  | { id: string; type: 'company_chips'; companies: CompanyResponse[] }
  | { id: string; type: 'personnel_picker'; users: UserResponse[] }
  | { id: string; type: 'ai_proposal' }
  | { id: string; type: 'photo_widget' }
  | { id: string; type: 'submit_btn'; obsCount: number; photoCount: number };

type MessageInput = Omit<MessageItem, 'id'>;
let msgId = 0;

function nextId() {
  msgId += 1;
  return String(msgId);
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function calcNivel(p: number, c: number): string {
  const score = (p - 1) + (c - 1);
  if (score <= 1) return 'Bajo';
  if (score <= 3) return 'Medio';
  if (score <= 5) return 'Alto';
  return 'Crítico';
}

function typeId(records: InspectionTypeResponse[], code: InspectionType): string | null {
  return records.find((item) => item.code === code)?.id ?? null;
}

function buildTypeOptions(records: InspectionTypeResponse[]): AssistantTypeOption[] {
  return [
    { value: InspectionType.ENVIRONMENTAL, label: 'Hallazgo', icon: 'search', inspectionTypeId: typeId(records, InspectionType.ENVIRONMENTAL) },
    { value: InspectionType.REGULATORY, label: 'Checklist normativo', icon: 'clipboard-check', inspectionTypeId: typeId(records, InspectionType.REGULATORY) },
  ];
}

export function InspectionAssistantChatScreen() {
  const flow = useInspectionFlow();
  const queryClient = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);
  const retryCallbacks = useRef<Map<string, () => void>>(new Map());
  const pendingDescRef = useRef('');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [confirmedPickerIds, setConfirmedPickerIds] = useState<Set<string>>(new Set());
  const [waitingInput, setWaitingInput] = useState<'obs_desc' | 'medida_manual' | null>(null);
  const [aiAccepted, setAiAccepted] = useState(false);
  const { online, hasSession } = useManualConnectivityStatus();
  const saveAssistantInspection = useSaveAssistantInspectionOffline();

  function addMsg(input: MessageInput): string {
    const id = nextId();
    setMessages((current) => [...current, { ...input, id } as MessageItem]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return id;
  }

  function removeTyping() {
    setMessages((current) => current.filter((message) => message.type !== 'typing'));
  }

  function resolveWidget(id: string) {
    setResolvedIds((current) => new Set(current).add(id));
  }

  function addErrorMsg(message: string, onRetry?: () => void) {
    const id = addMsg({ type: 'error', message });
    if (onRetry) retryCallbacks.current.set(id, onRetry);
  }

  async function doInit() {
    addMsg({ type: 'typing' });
    try {
      const areas = await queryClient.fetchQuery({ queryKey: AREAS_KEY, queryFn: fetchAreas, staleTime: 5 * 60 * 1000 });
      removeTyping();
      addMsg({ type: 'bot', text: '¡Hola, Karen Opazo! Soy AurelIA. Voy a ayudarte a registrar esta inspección. ¿En qué área estás hoy?' });
      addMsg({ type: 'area_chips', areas });
    } catch {
      removeTyping();
      addMsg({ type: 'bot', text: '¡Hola! Soy AurelIA. Tuve un problema al cargar las áreas.' });
      addErrorMsg('Debe sincronizar catálogos antes de operar offline.', doInit);
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(doInit, 500);
    return () => clearTimeout(timeoutId);
  }, []);

  async function handleAreaSelect(area: AreaResponse, widgetId: string) {
    resolveWidget(widgetId);
    flow.setArea(area.id, area.name);
    addMsg({ type: 'user', text: area.name });
    addMsg({ type: 'typing' });
    try {
      const sectors = await queryClient.fetchQuery({ queryKey: sectorsKey(area.id), queryFn: () => fetchSectors(area.id), staleTime: 5 * 60 * 1000 });
      removeTyping();
      addMsg({ type: 'bot', text: `${area.name} ✓ — ¿En qué sector?` });
      addMsg({ type: 'sector_chips', sectors });
    } catch {
      removeTyping();
      addErrorMsg('Error al cargar sectores desde catálogos locales.', () => handleAreaSelect(area, widgetId));
    }
  }

  async function handleSectorSelect(sector: SectorResponse, widgetId: string) {
    resolveWidget(widgetId);
    flow.setSector(sector.id, sector.name);
    addMsg({ type: 'user', text: sector.name });
    addMsg({ type: 'typing' });
    await delay(500);
    try {
      const records = await queryClient.fetchQuery({ queryKey: TYPES_KEY, queryFn: fetchInspectionTypes, staleTime: 5 * 60 * 1000 });
      removeTyping();
      addMsg({ type: 'bot', text: `${flow.areaName} · ${sector.name} ✓ — ¿Tipo de inspección?` });
      addMsg({ type: 'tipo_opts', tipos: buildTypeOptions(records) });
    } catch {
      removeTyping();
      addErrorMsg('Error al resolver tipos de inspección desde catálogos locales.', () => handleSectorSelect(sector, widgetId));
    }
  }

  async function handleTipoSelect(tipo: AssistantTypeOption, widgetId: string) {
    resolveWidget(widgetId);
    if (!tipo.inspectionTypeId) {
      addErrorMsg(`No existe el tipo ${tipo.label} en el catálogo bootstrap.`);
      return;
    }
    flow.setInspectionType(tipo.inspectionTypeId, tipo.label);
    addMsg({ type: 'user', text: tipo.label });
    addMsg({ type: 'typing' });
    await delay(500);
    removeTyping();
    addMsg({ type: 'bot', text: `Perfecto, continuemos con ${tipo.label}. Cuéntame la condición detectada en ${flow.areaName} · ${flow.sectorName}.` });
    setWaitingInput('obs_desc');
  }

  async function handleObsDesc(desc: string) {
    setWaitingInput(null);
    addMsg({ type: 'user', text: desc });
    flow.setObsDesc(desc);
    pendingDescRef.current = desc;
    await delay(200);
    addMsg({ type: 'typing' });
    await delay(600);
    removeTyping();
    addMsg({ type: 'bot', text: 'Adjunta una foto del hallazgo o continúa sin foto:' });
    addMsg({ type: 'photo_widget' });
  }

  async function handlePhotoSkip(widgetId: string) {
    resolveWidget(widgetId);
    flow.markFotoSkipped();
    addMsg({ type: 'bot', text: 'Sin foto. Analizando el hallazgo con IA…' });
    await askAiSuggestion(pendingDescRef.current);
  }

  async function handlePhotoCapture(uri: string, widgetId: string) {
    resolveWidget(widgetId);
    flow.setFotoUri(uri);
    flow.markFotoSkipped();
    addMsg({ type: 'bot', text: '📷 Foto guardada localmente. Analizando hallazgo con IA…' });
    await askAiSuggestion(pendingDescRef.current);
  }

  async function askAiSuggestion(desc: string) {
    addMsg({ type: 'typing' });
    let suggestion = 'Corregir la condición identificada antes del próximo turno. Registrar evidencia fotográfica y notificar al supervisor de área.';
    let fallback = true;
    if (online && hasSession) {
      try {
        const result = await suggestCorrectiveMeasure({ area: flow.areaName ?? '', sector: flow.sectorName ?? '', description: desc });
        suggestion = result.suggestion;
        fallback = result.fallback;
      } catch {
        fallback = true;
      }
    }
    removeTyping();
    flow.setAiSuggestion(suggestion, fallback);
    addMsg({ type: 'bot', text: `Analicé el historial de ${flow.areaName} — te propongo:` });
    addMsg({ type: 'ai_proposal' });
    addMsg({ type: 'bot', text: 'O escribe tu propia medida en el campo de texto.' });
    setWaitingInput('medida_manual');
    setAiAccepted(false);
  }

  async function handleAiAccept() {
    if (aiAccepted) return;
    setAiAccepted(true);
    setWaitingInput(null);
    flow.acceptMedida(flow.aiSuggestion ?? '', 'ia');
    addMsg({ type: 'user', text: '✓ Medida aceptada' });
    await delay(300);
    addMsg({ type: 'bot', text: 'Definamos la criticidad. Selecciona la Probabilidad:' });
    addMsg({ type: 'prob_chips' });
  }

  function handleAiEdit() {
    if (aiAccepted) return;
    setAiAccepted(true);
    setWaitingInput('medida_manual');
    addMsg({ type: 'bot', text: 'Escribe tu medida correctiva:' });
  }

  async function handleMedidaManual(text: string) {
    setWaitingInput(null);
    setAiAccepted(true);
    flow.acceptMedida(text, 'manual');
    addMsg({ type: 'user', text });
    await delay(300);
    addMsg({ type: 'bot', text: 'Definamos la criticidad. Selecciona la Probabilidad:' });
    addMsg({ type: 'prob_chips' });
  }

  async function handleProbSelect(label: string, widgetId: string) {
    resolveWidget(widgetId);
    flow.setProb(parseInt(label[0]));
    addMsg({ type: 'user', text: label });
    await delay(200);
    addMsg({ type: 'bot', text: '¿Qué tan grave sería el impacto? Selecciona la Consecuencia:' });
    addMsg({ type: 'cons_chips' });
  }

  async function handleConsSelect(label: string, widgetId: string) {
    resolveWidget(widgetId);
    const cons = parseInt(label[0]);
    flow.setCons(cons);
    addMsg({ type: 'user', text: label });
    const nivel = calcNivel(flow.currentObs.prob ?? 1, cons);
    await delay(500);
    addMsg({ type: 'bot', text: `Criticidad: ${nivel}. SLA sugerido: ${SLA_LABEL[nivel] ?? '7 días'}.` });
    await delay(700);
    addMsg({ type: 'bot', text: '¿Hay más observaciones que registrar?' });
    addMsg({ type: 'more_obs_opts' });
  }

  async function handleMoreObs(value: string, widgetId: string) {
    resolveWidget(widgetId);
    if (value === 'mas') {
      flow.addMoreObs();
      setAiAccepted(false);
      addMsg({ type: 'user', text: 'Sí, agregar otra' });
      await delay(300);
      addMsg({ type: 'bot', text: `Cuéntame la siguiente condición detectada en ${flow.areaName} · ${flow.sectorName}.` });
      setWaitingInput('obs_desc');
      return;
    }
    flow.finishObs();
    addMsg({ type: 'user', text: 'No, pasar a empresa y personal' });
    addMsg({ type: 'typing' });
    try {
      const companies = await queryClient.fetchQuery({ queryKey: COMPANIES_KEY, queryFn: () => fetchCompanies(true), staleTime: 5 * 60 * 1000 });
      let aiHint = '';
      if (online && hasSession) {
        try {
          const result = await suggestCompany({ area: flow.areaName ?? '', sector: flow.sectorName ?? '', availableCompanies: companies.map((company) => company.name) });
          if (!result.fallback) aiHint = result.suggestion;
        } catch {
          aiHint = '';
        }
      }
      removeTyping();
      if (aiHint) addMsg({ type: 'bot', text: `✦ ${aiHint}` });
      addMsg({ type: 'bot', text: '¿Qué empresa contratista está involucrada en esta inspección?' });
      addMsg({ type: 'company_chips', companies });
    } catch {
      removeTyping();
      addErrorMsg('Error al cargar empresas desde catálogos locales.', () => handleMoreObs(value, widgetId));
    }
  }

  async function handleCompanySelect(company: CompanyResponse, widgetId: string) {
    resolveWidget(widgetId);
    flow.setCompany(company.id, company.name);
    addMsg({ type: 'user', text: company.name });
    addMsg({ type: 'typing' });
    try {
      const users = await queryClient.fetchQuery({ queryKey: personnelKey(company.id), queryFn: () => fetchUsers({ companyId: company.id }), staleTime: 5 * 60 * 1000 });
      removeTyping();
      if (users.length > 0) {
        addMsg({ type: 'bot', text: `Selecciona el personal de ${company.name} presente en la inspección:` });
        addMsg({ type: 'personnel_picker', users });
      } else {
        await showSubmitSummary('No hay personal registrado para esta empresa. Continuando al resumen.');
      }
    } catch {
      removeTyping();
      addErrorMsg(`Error al cargar personal de ${company.name} desde catálogos locales.`, () => handleCompanySelect(company, widgetId));
    }
  }

  async function showSubmitSummary(intro?: string) {
    if (intro) addMsg({ type: 'bot', text: intro });
    await delay(400);
    flow.goToResumen();
    const obsCount = flow.observaciones.length;
    const photoCount = flow.observaciones.filter((observation) => Boolean(observation.fileId || observation.fotoUri)).length;
    addMsg({ type: 'bot', text: '¿Todo listo? Revisa el resumen y envía la inspección.' });
    addMsg({ type: 'submit_btn', obsCount, photoCount });
  }

  async function handlePersonnelConfirm(selected: UserResponse[], widgetId: string) {
    setConfirmedPickerIds((current) => new Set(current).add(widgetId));
    const ids = selected.map((user) => user.id);
    const names = selected.map((user) => user.fullName);
    flow.setPersonnel(ids, names);
    addMsg({ type: 'user', text: `Personal: ${names.length > 0 ? names.join(', ') : 'Nadie seleccionado'}` });
    await showSubmitSummary();
  }

  async function handleSubmit(widgetId: string) {
    resolveWidget(widgetId);
    if (!flow.inspectionTypeId || !flow.inspectionTypeName) {
      addErrorMsg('No se pudo enviar: falta el tipo de inspección.');
      return;
    }
    addMsg({ type: 'typing' });
    try {
      const result = await saveAssistantInspection.mutateAsync({ inspectionTypeId: flow.inspectionTypeId, inspectionTypeName: flow.inspectionTypeName, areaId: flow.areaId, areaName: flow.areaName, sectorId: flow.sectorId, sectorName: flow.sectorName, companyId: flow.companyId, observations: flow.observaciones, ownerUserId: flow.personnelIds[0] ?? null, trySyncNow: online && hasSession });
      removeTyping();
      router.replace({ pathname: '/inspection/success', params: { inspectionId: result.inspectionId, findingsCount: String(result.findingsCount), evidencesCount: String(result.evidencesCount) } });
    } catch {
      removeTyping();
      addErrorMsg('Error al guardar la inspección en la cola local.', () => handleSubmit(widgetId));
    }
  }

  function handleSend(text: string) {
    if (waitingInput === 'obs_desc') void handleObsDesc(text);
    if (waitingInput === 'medida_manual') void handleMedidaManual(text);
  }

  function renderMessage(msg: MessageItem) {
    const isResolved = resolvedIds.has(msg.id);
    switch (msg.type) {
      case 'bot': return <BotBubble key={msg.id} text={msg.text} />;
      case 'user': return <UserBubble key={msg.id} text={msg.text} />;
      case 'typing': return <TypingIndicator key={msg.id} />;
      case 'error': return <ErrorBubble key={msg.id} message={msg.message} onRetry={retryCallbacks.current.get(msg.id)} />;
      case 'photo_widget': return <PhotoStepWidget key={msg.id} onSkip={() => handlePhotoSkip(msg.id)} onCapture={(uri) => handlePhotoCapture(uri, msg.id)} resolved={isResolved} />;
      case 'area_chips': return <ChipRow key={msg.id} chips={msg.areas.map((area) => area.name)} selected={isResolved ? flow.areaName : null} onSelect={(name) => { if (!isResolved) { const area = msg.areas.find((item) => item.name === name); if (area) void handleAreaSelect(area, msg.id); } }} />;
      case 'sector_chips': return <ChipRow key={msg.id} chips={msg.sectors.map((sector) => sector.name)} selected={isResolved ? flow.sectorName : null} onSelect={(name) => { if (!isResolved) { const sector = msg.sectors.find((item) => item.name === name); if (sector) void handleSectorSelect(sector, msg.id); } }} />;
      case 'tipo_opts': {
        const selected = msg.tipos.find((tipo) => tipo.label === flow.inspectionTypeName)?.value ?? null;
        return <QuickOpts key={msg.id} options={msg.tipos.map((tipo) => ({ value: tipo.value, label: tipo.label, icon: tipo.icon }))} selected={isResolved ? selected : null} onSelect={(value) => { if (!isResolved) { const tipo = msg.tipos.find((item) => item.value === value); if (tipo) void handleTipoSelect(tipo, msg.id); } }} />;
      }
      case 'ai_proposal': return <AiProposalCard key={msg.id} suggestion={flow.aiSuggestion ?? ''} fallback={flow.aiFallback} accepted={aiAccepted} onAccept={handleAiAccept} onEdit={handleAiEdit} />;
      case 'prob_chips': return <ChipRow key={msg.id} chips={PROBS} selected={isResolved && flow.currentObs.prob ? PROBS[flow.currentObs.prob - 1] : null} onSelect={(label) => { if (!isResolved) void handleProbSelect(label, msg.id); }} />;
      case 'cons_chips': return <ChipRow key={msg.id} chips={CONS} selected={isResolved && flow.currentObs.cons ? CONS[flow.currentObs.cons - 1] : null} onSelect={(label) => { if (!isResolved) void handleConsSelect(label, msg.id); }} />;
      case 'more_obs_opts': return <QuickOpts key={msg.id} options={[{ value: 'mas', label: 'Sí, agregar otra' }, { value: 'empresa', label: 'No, pasar a empresa y personal' }]} selected={isResolved ? 'empresa' : null} onSelect={(value) => { if (!isResolved) void handleMoreObs(value, msg.id); }} />;
      case 'company_chips': return <ChipRow key={msg.id} chips={msg.companies.map((company) => company.name)} selected={isResolved ? flow.companyName : null} onSelect={(name) => { if (!isResolved) { const company = msg.companies.find((item) => item.name === name); if (company) void handleCompanySelect(company, msg.id); } }} />;
      case 'personnel_picker': return <PersonnelPicker key={msg.id} users={msg.users} confirmed={confirmedPickerIds.has(msg.id)} onConfirm={(selected) => handlePersonnelConfirm(selected, msg.id)} />;
      case 'submit_btn': return <SubmitWidget key={msg.id} obsCount={msg.obsCount} photoCount={msg.photoCount} submitted={isResolved || saveAssistantInspection.isPending} onSubmit={() => handleSubmit(msg.id)} />;
      default: return null;
    }
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <ChatHeader currentStep={flow.progressStep} agentStatus={flow.aiLoading || saveAssistantInspection.isPending ? 'thinking' : 'active'} />
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView ref={scrollRef} style={styles.chat} contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>{messages.map(renderMessage)}</ScrollView>
          <ChatInput onSend={handleSend} disabled={waitingInput === null} />
        </KeyboardAvoidingView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  chat: { flex: 1 },
  chatContent: { padding: spacing.md, gap: spacing.sm + 2, paddingBottom: spacing.xl },
});
