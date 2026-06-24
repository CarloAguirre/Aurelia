import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { BotBubble } from '../../shared/components/chat/BotBubble';
import { UserBubble } from '../../shared/components/chat/UserBubble';
import { TypingIndicator } from '../../shared/components/chat/TypingIndicator';
import { ChipRow } from '../../shared/components/chat/ChipRow';
import { QuickOpts } from '../../shared/components/chat/QuickOpts';
import { AiProposalCard } from '../../shared/components/chat/AiProposalCard';
import { PersonnelPicker } from '../../shared/components/chat/PersonnelPicker';
import { PhotoStepWidget } from '../../shared/components/chat/PhotoStepWidget';
import { ErrorBubble } from '../../shared/components/chat/ErrorBubble';
import { ChatHeader } from '../../shared/components/layout/ChatHeader';
import { ChatInput } from '../../shared/components/layout/ChatInput';
import { colors, spacing } from '../../shared/theme/tokens';
import { useInspectionFlow } from './useInspectionFlow';

import {
  fetchAreas,
  fetchSectors,
  fetchCompanies,
  type AreaResponse,
  type SectorResponse,
  type CompanyResponse,
} from '../../shared/services/api/organization.api';
import {
  fetchInspectionTypes,
  type InspectionTypeResponse,
} from '../../shared/services/api/inspection-types.api';
import { fetchUsers, type UserResponse } from '../../shared/services/api/users.api';
import {
  suggestCorrectiveMeasure,
  suggestCompany,
} from '../../shared/services/api/ai.api';

// ── Query keys ─────────────────────────────────────────────────────────────
const AREAS_KEY = ['areas'] as const;
const TYPES_KEY = ['inspection-types'] as const;
const COMPANIES_KEY = ['companies', 'contractors'] as const;
const sectorsKey = (areaId: string) => ['sectors', areaId] as const;
const personnelKey = (companyId: string) => ['personnel', companyId] as const;

// ── Criticidad helpers ──────────────────────────────────────────────────────
const PROBS = ['1 · Muy improbable', '2 · Improbable', '3 · Posible', '4 · Probable', '5 · Casi seguro'];
const CONS = ['1 · Insignificante', '2 · Menor', '3 · Moderado', '4 · Mayor', '5 · Catastrófico'];

function calcNivel(p: number, c: number): string {
  const s = (p - 1) + (c - 1);
  if (s <= 1) return 'Bajo';
  if (s <= 3) return 'Medio';
  if (s <= 5) return 'Alto';
  return 'Crítico';
}

const SLA_LABEL: Record<string, string> = { Bajo: '14 días', Medio: '7 días', Alto: '3 días', Crítico: '1 día' };

// ── Message types ───────────────────────────────────────────────────────────
type MessageItem =
  | { id: string; type: 'bot'; text: string }
  | { id: string; type: 'user'; text: string }
  | { id: string; type: 'typing' }
  | { id: string; type: 'error'; message: string }
  | { id: string; type: 'area_chips'; areas: AreaResponse[] }
  | { id: string; type: 'sector_chips'; sectors: SectorResponse[] }
  | { id: string; type: 'tipo_opts'; tipos: InspectionTypeResponse[] }
  | { id: string; type: 'prob_chips' }
  | { id: string; type: 'cons_chips' }
  | { id: string; type: 'more_obs_opts' }
  | { id: string; type: 'company_chips'; companies: CompanyResponse[] }
  | { id: string; type: 'personnel_picker'; users: UserResponse[] }
  | { id: string; type: 'ai_proposal' }
  | { id: string; type: 'photo_widget' };

type MessageInput =
  | { type: 'bot'; text: string }
  | { type: 'user'; text: string }
  | { type: 'typing' }
  | { type: 'error'; message: string }
  | { type: 'area_chips'; areas: AreaResponse[] }
  | { type: 'sector_chips'; sectors: SectorResponse[] }
  | { type: 'tipo_opts'; tipos: InspectionTypeResponse[] }
  | { type: 'prob_chips' }
  | { type: 'cons_chips' }
  | { type: 'more_obs_opts' }
  | { type: 'company_chips'; companies: CompanyResponse[] }
  | { type: 'personnel_picker'; users: UserResponse[] }
  | { type: 'ai_proposal' }
  | { type: 'photo_widget' };

let _msgId = 0;
const nextId = () => String(++_msgId);

// ── Component ───────────────────────────────────────────────────────────────
export function InspectionChatScreen() {
  const flow = useInspectionFlow();
  const qc = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);

  // Track which interactive widgets have been resolved (by id)
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  // Track which personnel pickers have been confirmed (by id)
  const [confirmedPickerIds, setConfirmedPickerIds] = useState<Set<string>>(new Set());

  const [waitingInput, setWaitingInput] = useState<'obs_desc' | 'medida_manual' | null>(null);
  const [aiAccepted, setAiAccepted] = useState(false);

  // Retry callbacks keyed by error message id
  const retryCallbacks = useRef<Map<string, () => void>>(new Map());
  // Holds current obs description so photo skip can pass it to AI
  const pendingDescRef = useRef<string>('');

  // ── Helpers ─────────────────────────────────────────────────────────────
  function addMsg(input: MessageInput): string {
    const id = nextId();
    const item = { ...input, id } as MessageItem;
    setMessages((prev) => [...prev, item]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return id;
  }

  function addErrorMsg(message: string, onRetry?: () => void): string {
    const id = addMsg({ type: 'error', message });
    if (onRetry) retryCallbacks.current.set(id, onRetry);
    return id;
  }

  function removeTyping() {
    setMessages((prev) => prev.filter((m) => m.type !== 'typing'));
  }

  function resolveWidget(id: string) {
    setResolvedIds((prev) => new Set(prev).add(id));
  }

  const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  // ── Init: load areas ────────────────────────────────────────────────────
  async function doInit() {
    addMsg({ type: 'typing' });
    let areas: AreaResponse[];
    try {
      areas = await qc.fetchQuery({ queryKey: AREAS_KEY, queryFn: fetchAreas, staleTime: 5 * 60 * 1000 });
    } catch {
      removeTyping();
      addMsg({ type: 'bot', text: '¡Hola! Soy AurelIA. Tuve un problema al cargar las áreas.' });
      addErrorMsg('No se pudieron cargar las áreas. ¿Está el servidor activo?', doInit);
      return;
    }
    removeTyping();
    addMsg({ type: 'bot', text: '¡Hola, Karen Opazo! Soy AurelIA. Voy a ayudarte a registrar esta inspección. ¿En qué área estás hoy?' });
    addMsg({ type: 'area_chips', areas });
  }

  useEffect(() => {
    const t = setTimeout(doInit, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Area selected ────────────────────────────────────────────────────────
  async function handleAreaSelect(area: AreaResponse, widgetId: string) {
    resolveWidget(widgetId);
    flow.setArea(area.id, area.name);
    addMsg({ type: 'user', text: area.name });

    async function fetchAreaDeps() {
      addMsg({ type: 'typing' });
      let sectors: SectorResponse[];
      let tipos: InspectionTypeResponse[];
      try {
        [sectors, tipos] = await Promise.all([
          qc.fetchQuery({ queryKey: sectorsKey(area.id), queryFn: () => fetchSectors(area.id), staleTime: 5 * 60 * 1000 }),
          qc.fetchQuery({ queryKey: TYPES_KEY, queryFn: fetchInspectionTypes, staleTime: 5 * 60 * 1000 }),
        ]);
      } catch {
        removeTyping();
        addErrorMsg('Error al cargar sectores. Verifica la conexión.', fetchAreaDeps);
        return;
      }
      removeTyping();
      addMsg({ type: 'bot', text: `${area.name} ✓ — ¿En qué sector?` });
      addMsg({ type: 'sector_chips', sectors });
      qc.setQueryData(TYPES_KEY, tipos);
    }

    await fetchAreaDeps();
  }

  // ── Sector selected ──────────────────────────────────────────────────────
  async function handleSectorSelect(sector: SectorResponse, widgetId: string) {
    resolveWidget(widgetId);
    flow.setSector(sector.id, sector.name);
    addMsg({ type: 'user', text: sector.name });

    async function fetchSectorDeps() {
      addMsg({ type: 'typing' });
      await delay(700);
      let tipos: InspectionTypeResponse[];
      try {
        tipos = await qc.fetchQuery({ queryKey: TYPES_KEY, queryFn: fetchInspectionTypes, staleTime: 5 * 60 * 1000 });
      } catch {
        removeTyping();
        addErrorMsg('Error al cargar tipos de inspección.', fetchSectorDeps);
        return;
      }
      removeTyping();
      addMsg({ type: 'bot', text: `${flow.areaName} · ${sector.name} ✓ — ¿Tipo de inspección?` });
      addMsg({ type: 'tipo_opts', tipos });
    }

    await fetchSectorDeps();
  }

  // ── Tipo selected ────────────────────────────────────────────────────────
  async function handleTipoSelect(tipo: InspectionTypeResponse, widgetId: string) {
    resolveWidget(widgetId);
    flow.setInspectionType(tipo.id, tipo.name);
    addMsg({ type: 'user', text: tipo.name });
    addMsg({ type: 'typing' });
    await delay(700);
    removeTyping();
    addMsg({ type: 'bot', text: `Cuéntame la condición subestándar que detectaste en ${flow.areaName} · ${flow.sectorName}.` });
    setWaitingInput('obs_desc');
  }

  // ── Observation description ──────────────────────────────────────────────
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
    // Flow waits for explicit user decision via handlePhotoSkip
  }

  // ── Photo step — explicit user choice ────────────────────────────────────
  async function handlePhotoSkip(widgetId: string) {
    resolveWidget(widgetId);
    flow.markFotoSkipped();
    addMsg({ type: 'bot', text: 'Sin foto. Analizando el hallazgo con IA…' });
    await askAiSuggestion(pendingDescRef.current);
  }

  // ── AI suggestion ────────────────────────────────────────────────────────
  async function askAiSuggestion(desc: string) {
    addMsg({ type: 'typing' });

    let suggestion: string;
    let fallback = false;

    try {
      const res = await suggestCorrectiveMeasure({
        area: flow.areaName ?? '',
        sector: flow.sectorName ?? '',
        description: desc,
      });
      suggestion = res.suggestion;
      fallback = res.fallback;
    } catch {
      suggestion = 'Corregir la condición identificada antes del próximo turno. Registrar evidencia fotográfica y notificar al supervisor de área.';
      fallback = true;
    }

    removeTyping();
    flow.setAiSuggestion(suggestion, fallback);
    addMsg({ type: 'bot', text: `Analicé el historial de ${flow.areaName} — te propongo:` });
    addMsg({ type: 'ai_proposal' });
    addMsg({ type: 'bot', text: 'O escribe tu propia medida en el campo de texto.' });
    setWaitingInput('medida_manual');
    setAiAccepted(false);
  }

  // ── AI accept/edit ───────────────────────────────────────────────────────
  async function handleAiAccept() {
    if (aiAccepted) return;
    setAiAccepted(true);
    setWaitingInput(null);
    flow.acceptMedida(flow.aiSuggestion ?? '', 'ia');
    addMsg({ type: 'user', text: '✓ Medida aceptada' });
    await delay(300);
    addMsg({ type: 'typing' });
    await delay(700);
    removeTyping();
    addMsg({ type: 'bot', text: 'Definamos la criticidad. Selecciona la Probabilidad:' });
    addMsg({ type: 'prob_chips' });
  }

  async function handleAiEdit() {
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
    addMsg({ type: 'typing' });
    await delay(700);
    removeTyping();
    addMsg({ type: 'bot', text: 'Definamos la criticidad. Selecciona la Probabilidad:' });
    addMsg({ type: 'prob_chips' });
  }

  // ── Criticidad ───────────────────────────────────────────────────────────
  async function handleProbSelect(label: string, widgetId: string) {
    resolveWidget(widgetId);
    const val = parseInt(label[0]);
    flow.setProb(val);
    addMsg({ type: 'user', text: label });
    await delay(200);
    addMsg({ type: 'bot', text: '¿Qué tan grave sería el impacto? Selecciona la Consecuencia:' });
    addMsg({ type: 'cons_chips' });
  }

  async function handleConsSelect(label: string, widgetId: string) {
    resolveWidget(widgetId);
    const val = parseInt(label[0]);
    flow.setCons(val);
    addMsg({ type: 'user', text: label });

    const prob = flow.currentObs.prob ?? 1;
    const nivel = calcNivel(prob, val);
    const slaStr = SLA_LABEL[nivel] ?? '7 días';

    await delay(500);
    addMsg({ type: 'bot', text: `Criticidad: ${nivel}. SLA sugerido: ${slaStr}.` });
    await delay(2000);

    addMsg({ type: 'bot', text: '¿Hay más observaciones que registrar?' });
    addMsg({ type: 'more_obs_opts' });
  }

  // ── More obs ─────────────────────────────────────────────────────────────
  async function handleMoreObs(value: string, widgetId: string) {
    resolveWidget(widgetId);
    if (value === 'mas') {
      flow.addMoreObs();
      setAiAccepted(false);
      addMsg({ type: 'user', text: 'Sí, agregar otra' });
      await delay(300);
      addMsg({ type: 'typing' });
      await delay(800);
      removeTyping();
      addMsg({ type: 'bot', text: `Cuéntame la siguiente condición subestándar en ${flow.areaName} · ${flow.sectorName}.` });
      setWaitingInput('obs_desc');
    } else {
      flow.finishObs();
      addMsg({ type: 'user', text: 'No, pasar a empresa y personal' });
      await delay(300);

      async function fetchAndShowCompanies() {
        addMsg({ type: 'typing' });
        let companies: CompanyResponse[];
        try {
          companies = await qc.fetchQuery({
            queryKey: COMPANIES_KEY,
            queryFn: () => fetchCompanies(true),
            staleTime: 5 * 60 * 1000,
          });
        } catch {
          removeTyping();
          addErrorMsg('Error al cargar empresas contratistas.', fetchAndShowCompanies);
          return;
        }

        // Ask AI to suggest a company (non-blocking — silently skip on failure)
        let aiHint = '';
        try {
          const res = await suggestCompany({
            area: flow.areaName ?? '',
            sector: flow.sectorName ?? '',
            availableCompanies: companies.map((c) => c.name),
          });
          if (!res.fallback) aiHint = res.suggestion;
        } catch {
          // ignore
        }

        removeTyping();
        if (aiHint) {
          addMsg({ type: 'bot', text: `✦ ${aiHint}` });
        }
        addMsg({ type: 'bot', text: '¿Qué empresa contratista está involucrada en esta inspección?' });
        addMsg({ type: 'company_chips', companies });
      }

      await fetchAndShowCompanies();
    }
  }

  // ── Company selected ─────────────────────────────────────────────────────
  async function handleCompanySelect(company: CompanyResponse, widgetId: string) {
    resolveWidget(widgetId);
    flow.setCompany(company.id, company.name);
    addMsg({ type: 'user', text: company.name });

    async function fetchPersonnel() {
      addMsg({ type: 'typing' });
      let users: UserResponse[];
      try {
        users = await qc.fetchQuery({
          queryKey: personnelKey(company.id),
          queryFn: () => fetchUsers({ companyId: company.id }),
          staleTime: 5 * 60 * 1000,
        });
      } catch {
        removeTyping();
        addErrorMsg(`Error al cargar personal de ${company.name}.`, fetchPersonnel);
        return;
      }
      removeTyping();
      if (users.length > 0) {
        addMsg({ type: 'bot', text: `Selecciona el personal de ${company.name} presente en la inspección:` });
        addMsg({ type: 'personnel_picker', users });
      } else {
        addMsg({ type: 'bot', text: `No hay personal registrado para ${company.name}. Continuando al resumen.` });
        await delay(800);
        flow.goToResumen();
        addMsg({ type: 'bot', text: 'Resumen listo. El envío final de la inspección estará disponible en Mobile D.' });
      }
    }

    await fetchPersonnel();
  }

  // ── Personnel confirmed ──────────────────────────────────────────────────
  async function handlePersonnelConfirm(selected: UserResponse[], widgetId: string) {
    setConfirmedPickerIds((prev) => new Set(prev).add(widgetId));
    const ids = selected.map((u) => u.id);
    const names = selected.map((u) => u.fullName);
    flow.setPersonnel(ids, names);
    const label = names.length > 0 ? names.join(', ') : 'Nadie seleccionado';
    addMsg({ type: 'user', text: `Personal: ${label}` });
    await delay(400);
    flow.goToResumen();
    addMsg({ type: 'bot', text: 'Inspección registrada. El envío y creación de hallazgos formales estarán disponibles en Mobile D.' });
  }

  // ── Chat input ───────────────────────────────────────────────────────────
  function handleSend(text: string) {
    if (waitingInput === 'obs_desc') {
      handleObsDesc(text);
    } else if (waitingInput === 'medida_manual') {
      handleMedidaManual(text);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  function renderMessage(msg: MessageItem) {
    const isResolved = resolvedIds.has(msg.id);

    switch (msg.type) {
      case 'bot':
        return <BotBubble key={msg.id} text={msg.text} />;
      case 'user':
        return <UserBubble key={msg.id} text={msg.text} />;
      case 'typing':
        return <TypingIndicator key={msg.id} />;
      case 'error':
        return (
          <ErrorBubble
            key={msg.id}
            message={msg.message}
            onRetry={retryCallbacks.current.get(msg.id)}
          />
        );

      case 'photo_widget':
        return (
          <PhotoStepWidget
            key={msg.id}
            onSkip={() => handlePhotoSkip(msg.id)}
            resolved={isResolved}
          />
        );

      case 'area_chips':
        return (
          <ChipRow
            key={msg.id}
            chips={msg.areas.map((a) => a.name)}
            selected={isResolved ? (flow.areaName ?? null) : null}
            onSelect={(name) => {
              if (isResolved) return;
              const area = msg.areas.find((a) => a.name === name);
              if (area) handleAreaSelect(area, msg.id);
            }}
          />
        );

      case 'sector_chips':
        return (
          <ChipRow
            key={msg.id}
            chips={msg.sectors.map((s) => s.name)}
            selected={isResolved ? (flow.sectorName ?? null) : null}
            onSelect={(name) => {
              if (isResolved) return;
              const sector = msg.sectors.find((s) => s.name === name);
              if (sector) handleSectorSelect(sector, msg.id);
            }}
          />
        );

      case 'tipo_opts':
        return (
          <QuickOpts
            key={msg.id}
            options={msg.tipos.map((t) => ({ value: t.id, label: t.name }))}
            selected={isResolved ? (flow.inspectionTypeId ?? null) : null}
            onSelect={(id) => {
              if (isResolved) return;
              const tipo = msg.tipos.find((t) => t.id === id);
              if (tipo) handleTipoSelect(tipo, msg.id);
            }}
          />
        );

      case 'ai_proposal':
        return (
          <AiProposalCard
            key={msg.id}
            suggestion={flow.aiSuggestion ?? ''}
            fallback={flow.aiFallback}
            accepted={aiAccepted}
            onAccept={handleAiAccept}
            onEdit={handleAiEdit}
          />
        );

      case 'prob_chips':
        return (
          <ChipRow
            key={msg.id}
            chips={PROBS}
            selected={isResolved ? (flow.currentObs.prob !== null ? PROBS[flow.currentObs.prob - 1] : null) : null}
            onSelect={(label) => {
              if (isResolved) return;
              handleProbSelect(label, msg.id);
            }}
          />
        );

      case 'cons_chips':
        return (
          <ChipRow
            key={msg.id}
            chips={CONS}
            selected={isResolved ? (flow.currentObs.cons !== null ? CONS[flow.currentObs.cons - 1] : null) : null}
            onSelect={(label) => {
              if (isResolved) return;
              handleConsSelect(label, msg.id);
            }}
          />
        );

      case 'more_obs_opts':
        return (
          <QuickOpts
            key={msg.id}
            options={[
              { value: 'mas', label: 'Sí, agregar otra' },
              { value: 'empresa', label: 'No, pasar a empresa y personal' },
            ]}
            selected={isResolved ? (flow.step === 'empresa' || flow.step === 'personal' || flow.step === 'resumen' ? 'empresa' : 'mas') : null}
            onSelect={(val) => {
              if (isResolved) return;
              handleMoreObs(val, msg.id);
            }}
          />
        );

      case 'company_chips':
        return (
          <ChipRow
            key={msg.id}
            chips={msg.companies.map((c) => c.name)}
            selected={isResolved ? (flow.companyName ?? null) : null}
            onSelect={(name) => {
              if (isResolved) return;
              const company = msg.companies.find((c) => c.name === name);
              if (company) handleCompanySelect(company, msg.id);
            }}
          />
        );

      case 'personnel_picker': {
        const isConfirmed = confirmedPickerIds.has(msg.id);
        return (
          <PersonnelPicker
            key={msg.id}
            users={msg.users}
            confirmed={isConfirmed}
            onConfirm={(selected) => handlePersonnelConfirm(selected, msg.id)}
          />
        );
      }

      default:
        return null;
    }
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <ChatHeader
          currentStep={flow.progressStep}
          agentStatus={flow.aiLoading ? 'thinking' : 'active'}
        />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.chat}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(renderMessage)}
          </ScrollView>
          <ChatInput
            onSend={handleSend}
            disabled={waitingInput === null}
          />
        </KeyboardAvoidingView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  chat: { flex: 1 },
  chatContent: {
    padding: spacing.md,
    gap: spacing.sm + 2,
    paddingBottom: spacing.xl,
  },
});
