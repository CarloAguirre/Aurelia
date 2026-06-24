import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BotBubble } from '../../shared/components/chat/BotBubble';
import { UserBubble } from '../../shared/components/chat/UserBubble';
import { TypingIndicator } from '../../shared/components/chat/TypingIndicator';
import { ChipRow } from '../../shared/components/chat/ChipRow';
import { QuickOpts } from '../../shared/components/chat/QuickOpts';
import { AiProposalCard } from '../../shared/components/chat/AiProposalCard';
import { ChatHeader } from '../../shared/components/layout/ChatHeader';
import { ChatInput } from '../../shared/components/layout/ChatInput';
import { colors, spacing } from '../../shared/theme/tokens';
import { useInspectionFlow } from './useInspectionFlow';

// Static demo data — replaced by API calls in Mobile C
const DEMO_AREAS = ['Mina', 'Planta Procesos', 'Exploraciones', 'Mantención', 'Servicios Generales', 'Sustaining', 'Medio Ambiente'];

const DEMO_SECTORS: Record<string, string[]> = {
  'Mina': ['Sector Norte', 'Plataforma 2', 'Sector Sur', 'Acceso principal'],
  'Planta Procesos': ['Módulo C', 'Módulo A', 'Lixiviación', 'PTAS'],
  'Exploraciones': ['Campaña Norte', 'Campaña Este'],
  'Mantención': ['Talleres', 'Bodega repuestos'],
  'Servicios Generales': ['Campamento Antiguo', 'Comedor', 'Acceso faena'],
  'Sustaining': ['Sector Sustaining'],
  'Medio Ambiente': ['PTAS', 'Depósito relaves'],
};

const DEMO_TIPOS = [
  { value: 'HALLAZGO', label: 'Hallazgo', icon: '🔍' },
  { value: 'CHECKLIST_NORM', label: 'Checklist normativo', icon: '✅' },
  { value: 'RUTINA', label: 'Inspección de Rutina', icon: '📋' },
  { value: 'PREVENTIVA', label: 'Inspección Preventiva', icon: '🛡' },
];

const DEMO_EMPRESAS = ['SOMACOR', 'STRACON', 'GARDE CORPS', 'AGGREKO', 'RESITER', 'ATLAS COPCO'];

const DEMO_PERSONAL: Record<string, string[]> = {
  'SOMACOR': ['Miguel Pizarro', 'Roberto González', 'Carlos López', 'Patricia Soto'],
  'STRACON': ['Jorge Rojas', 'Ana Morales'],
  'GARDE CORPS': ['Rodrigo Méndez', 'Luis Vargas'],
  'AGGREKO': ['Carlos Rojas', 'María Fuentes'],
  'RESITER': ['Diego Pérez', 'Verónica Luna'],
  'ATLAS COPCO': [],
};

const PROBS = ['1 · Muy improbable', '2 · Improbable', '3 · Posible', '4 · Probable', '5 · Casi seguro'];
const CONS = ['1 · Insignificante', '2 · Menor', '3 · Moderado', '4 · Mayor', '5 · Catastrófico'];

type MessageItem =
  | { id: string; type: 'bot'; text: string }
  | { id: string; type: 'user'; text: string }
  | { id: string; type: 'typing' }
  | { id: string; type: 'chips'; chips: string[]; key: string }
  | { id: string; type: 'quick_opts'; opts: Array<{ value: string; label: string; icon?: string }>; key: string }
  | { id: string; type: 'prob_chips'; chips: string[]; key: string }
  | { id: string; type: 'cons_chips'; chips: string[]; key: string }
  | { id: string; type: 'ai_proposal'; key: string };

type MessageInput =
  | { type: 'bot'; text: string }
  | { type: 'user'; text: string }
  | { type: 'typing' }
  | { type: 'chips'; chips: string[]; key: string }
  | { type: 'quick_opts'; opts: Array<{ value: string; label: string; icon?: string }>; key: string }
  | { type: 'prob_chips'; chips: string[]; key: string }
  | { type: 'cons_chips'; chips: string[]; key: string }
  | { type: 'ai_proposal'; key: string };

let msgId = 0;
function nextId() { return String(++msgId); }

export function InspectionChatScreen() {
  const flow = useInspectionFlow();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedChips, setSelectedChips] = useState<Record<string, string | null>>({});
  const [aiAccepted, setAiAccepted] = useState(false);
  const [waitingInput, setWaitingInput] = useState<'obs_desc' | 'medida_manual' | null>(null);

  function addMsg(input: MessageInput) {
    const item = { ...input, id: nextId() } as MessageItem;
    setMessages((prev) => [...prev, item]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }

  function removeTyping() {
    setMessages((prev) => prev.filter((m) => m.type !== 'typing'));
  }

  async function delay(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
  }

  // Init
  useEffect(() => {
    async function init() {
      await delay(500);
      addMsg({ type: 'typing' });
      await delay(1000);
      removeTyping();
      addMsg({ type: 'bot', text: '¡Hola, Karen Opazo! Soy AurelIA. Voy a ayudarte a registrar esta inspección. ¿En qué área estás hoy?' });
      addMsg({ type: 'chips', chips: DEMO_AREAS, key: 'area' });
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectChip(key: string, value: string) {
    setSelectedChips((prev) => ({ ...prev, [key]: value }));
  }

  async function handleAreaSelect(area: string) {
    selectChip('area', area);
    addMsg({ type: 'user', text: area });
    flow.setArea(area);
    await delay(300);
    addMsg({ type: 'typing' });
    await delay(800);
    removeTyping();
    addMsg({ type: 'bot', text: `${area} ✓ — ¿En qué sector?` });
    addMsg({ type: 'chips', chips: DEMO_SECTORS[area] ?? [], key: 'sector' });
  }

  async function handleSectorSelect(sector: string) {
    selectChip('sector', sector);
    addMsg({ type: 'user', text: sector });
    flow.setSector(sector);
    await delay(300);
    addMsg({ type: 'typing' });
    await delay(800);
    removeTyping();
    addMsg({ type: 'bot', text: `${flow.area} · ${sector} ✓ — ¿Tipo de inspección?` });
    addMsg({ type: 'quick_opts', opts: DEMO_TIPOS, key: 'tipo' });
  }

  async function handleTipoSelect(tipo: string) {
    selectChip('tipo', tipo);
    const label = DEMO_TIPOS.find((t) => t.value === tipo)?.label ?? tipo;
    addMsg({ type: 'user', text: label });
    flow.setTipo(tipo);
    await delay(300);
    addMsg({ type: 'typing' });
    await delay(800);
    removeTyping();
    addMsg({ type: 'bot', text: `Cuéntame la condición subestándar que detectaste en ${flow.area} · ${flow.sector}.` });
    setWaitingInput('obs_desc');
  }

  async function handleObsDesc(desc: string) {
    setWaitingInput(null);
    addMsg({ type: 'user', text: desc });
    flow.setObsDesc(desc);
    await delay(200);
    addMsg({ type: 'typing' });
    await delay(600);
    removeTyping();
    addMsg({ type: 'bot', text: 'Entendido. Para esta demo, simulo que adjuntaste la foto del hallazgo.' });
    // Simulate photo attachment
    flow.setObsFoto();
    await delay(300);
    addMsg({ type: 'typing' });
    await delay(1200);
    removeTyping();
    // Demo AI suggestion (static fallback for Mobile B)
    const suggestion = 'Corregir la condición identificada antes del próximo turno. Registrar evidencia fotográfica y notificar al supervisor de área.';
    flow.setAiSuggestion(suggestion);
    addMsg({ type: 'bot', text: `Foto recibida ✓. Analicé el historial de ${flow.area} — te propongo:` });
    addMsg({ type: 'ai_proposal', key: 'ai_proposal' });
    addMsg({ type: 'bot', text: 'O escribe tu propia medida en el campo de texto.' });
    setWaitingInput('medida_manual');
  }

  async function handleAiAccept() {
    if (aiAccepted) return;
    setAiAccepted(true);
    const medida = flow.aiSuggestion ?? '';
    flow.acceptMedida(medida, 'ia');
    addMsg({ type: 'user', text: '✓ Medida aceptada' });
    setWaitingInput(null);
    await delay(300);
    addMsg({ type: 'typing' });
    await delay(700);
    removeTyping();
    addMsg({ type: 'bot', text: 'Definamos la criticidad. Selecciona la Probabilidad:' });
    addMsg({ type: 'prob_chips', chips: PROBS, key: 'prob' });
  }

  async function handleAiEdit() {
    setAiAccepted(true);
    addMsg({ type: 'bot', text: 'Escribe tu medida correctiva:' });
    setWaitingInput('medida_manual');
  }

  async function handleMedidaManual(text: string) {
    setWaitingInput(null);
    flow.acceptMedida(text, 'manual');
    addMsg({ type: 'user', text });
    await delay(300);
    addMsg({ type: 'typing' });
    await delay(700);
    removeTyping();
    addMsg({ type: 'bot', text: 'Definamos la criticidad. Selecciona la Probabilidad:' });
    addMsg({ type: 'prob_chips', chips: PROBS, key: 'prob' });
  }

  async function handleProbSelect(label: string) {
    const val = parseInt(label[0]);
    selectChip('prob', label);
    flow.setProb(val);
    await delay(200);
    addMsg({ type: 'bot', text: '¿Qué tan grave sería el impacto? Selecciona la Consecuencia:' });
    addMsg({ type: 'cons_chips', chips: CONS, key: 'cons' });
  }

  async function handleConsSelect(label: string) {
    const val = parseInt(label[0]);
    selectChip('cons', label);
    flow.setCons(val);
    const nivel = flow.currentObs.nivel ?? 'Medio';
    const slaMap: Record<string, string> = { Bajo: '14 días', Medio: '7 días', Alto: '3 días', Crítico: '1 día' };
    await delay(500);
    addMsg({ type: 'bot', text: `Nivel de criticidad: ${nivel}. SLA sugerido: ${slaMap[nivel] ?? '7 días'}. Confirma o ajusta en el campo de texto (ej: "7").` });
    setWaitingInput(null);
    // For demo, auto-advance to empresa after 2s
    await delay(2000);
    addMsg({ type: 'bot', text: '¿Hay más observaciones que registrar?' });
    addMsg({
      type: 'quick_opts',
      opts: [
        { value: 'mas', label: 'Sí, agregar otra' },
        { value: 'empresa', label: 'No, pasar a empresa y personal' },
      ],
      key: 'more_obs',
    });
  }

  async function handleMoreObs(value: string) {
    selectChip('more_obs', value);
    if (value === 'mas') {
      flow.addMoreObs();
      addMsg({ type: 'user', text: 'Sí, agregar otra' });
      await delay(300);
      addMsg({ type: 'typing' });
      await delay(800);
      removeTyping();
      addMsg({ type: 'bot', text: `Cuéntame la siguiente condición subestándar en ${flow.area} · ${flow.sector}.` });
      setWaitingInput('obs_desc');
    } else {
      flow.finishObs();
      addMsg({ type: 'user', text: 'No, pasar a empresa y personal' });
      await delay(300);
      addMsg({ type: 'typing' });
      await delay(800);
      removeTyping();
      addMsg({ type: 'bot', text: '¿Qué empresa contratista está involucrada en esta inspección?' });
      addMsg({ type: 'chips', chips: DEMO_EMPRESAS, key: 'empresa' });
    }
  }

  async function handleEmpresaSelect(empresa: string) {
    selectChip('empresa', empresa);
    addMsg({ type: 'user', text: empresa });
    flow.setEmpresa(empresa);
    const personal = DEMO_PERSONAL[empresa] ?? [];
    await delay(300);
    addMsg({ type: 'typing' });
    await delay(800);
    removeTyping();
    if (personal.length > 0) {
      addMsg({ type: 'bot', text: `Selecciona el personal de ${empresa} presente en la inspección:` });
      addMsg({ type: 'chips', chips: personal, key: 'personal' });
    } else {
      addMsg({ type: 'bot', text: `No hay personal registrado para ${empresa}. Continuando al resumen.` });
      await delay(1000);
      flow.goToResumen();
      addMsg({ type: 'bot', text: 'Resumen de la inspección generado. ¡Todo listo para enviar! (Funcionalidad completa en Mobile C)' });
    }
  }

  function handleSend(text: string) {
    if (waitingInput === 'obs_desc') {
      handleObsDesc(text);
    } else if (waitingInput === 'medida_manual') {
      if (!aiAccepted) {
        handleMedidaManual(text);
      }
    }
  }

  function renderMessage(msg: MessageItem) {
    switch (msg.type) {
      case 'bot':
        return <BotBubble key={msg.id} text={msg.text} />;
      case 'user':
        return <UserBubble key={msg.id} text={msg.text} />;
      case 'typing':
        return <TypingIndicator key={msg.id} />;
      case 'chips': {
        const chipKey = msg.key;
        return (
          <ChipRow
            key={msg.id}
            chips={msg.chips}
            selected={selectedChips[chipKey] ?? null}
            onSelect={(val) => {
              if (selectedChips[chipKey]) return;
              if (chipKey === 'area') handleAreaSelect(val);
              else if (chipKey === 'sector') handleSectorSelect(val);
              else if (chipKey === 'empresa') handleEmpresaSelect(val);
              else if (chipKey === 'personal') {
                flow.togglePersonal(val);
                selectChip('personal_' + val, val);
              }
            }}
          />
        );
      }
      case 'quick_opts': {
        const optKey = msg.key;
        return (
          <QuickOpts
            key={msg.id}
            options={msg.opts}
            selected={selectedChips[optKey] ?? null}
            onSelect={(val) => {
              if (selectedChips[optKey]) return;
              if (optKey === 'tipo') handleTipoSelect(val);
              else if (optKey === 'more_obs') handleMoreObs(val);
            }}
          />
        );
      }
      case 'prob_chips':
        return (
          <ChipRow
            key={msg.id}
            chips={msg.chips}
            selected={selectedChips['prob'] ?? null}
            onSelect={(val) => {
              if (selectedChips['prob']) return;
              handleProbSelect(val);
            }}
          />
        );
      case 'cons_chips':
        return (
          <ChipRow
            key={msg.id}
            chips={msg.chips}
            selected={selectedChips['cons'] ?? null}
            onSelect={(val) => {
              if (selectedChips['cons']) return;
              handleConsSelect(val);
            }}
          />
        );
      case 'ai_proposal':
        return (
          <AiProposalCard
            key={msg.id}
            suggestion={flow.aiSuggestion ?? ''}
            accepted={aiAccepted}
            onAccept={handleAiAccept}
            onEdit={handleAiEdit}
          />
        );
      default:
        return null;
    }
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <ChatHeader currentStep={flow.progressStep} agentStatus={flow.aiLoading ? 'thinking' : 'active'} />
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
