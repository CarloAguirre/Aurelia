import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AssistantChatStep as AssistantChatStepV9 } from './AssistantChatStepV9';
import { ChatAureliaIcon } from '../icons/AssistantChatIcons';
import { useNewInspectionDraftStore, type NewInspectionDraft } from '../state/newInspectionDraft.store';

type AssistantChatStepProps = ComponentProps<typeof AssistantChatStepV9>;

function cleanText(value: string | null | undefined) {
  return (value ?? '').replace(/\s+/g, ' ').trim();
}

function panel() {
  return document.querySelector('.new-inspection-modal-panel') as HTMLElement | null;
}

function suggestionCardFromButton(label: string, required: string) {
  const root = panel();
  if (!root) return null;
  const button = Array.from(root.querySelectorAll('button')).find((item) => cleanText(item.textContent) === label) as HTMLElement | undefined;
  const actions = button?.parentElement as HTMLElement | null | undefined;
  const card = actions?.parentElement as HTMLElement | null | undefined;
  if (!card || !cleanText(card.textContent).includes(required)) return null;
  return card;
}

function removeSuggestionClasses() {
  const root = panel();
  if (!root) return;
  root.querySelectorAll('.assistant-checklist-company-suggestion, .assistant-checklist-ai-suggestion').forEach((item) => {
    item.classList.remove('assistant-checklist-company-suggestion', 'assistant-checklist-ai-suggestion');
  });
}

function applySuggestionClasses() {
  removeSuggestionClasses();
  const companyCard = suggestionCardFromButton('Confirmar empresa', 'Empresa responsable sugerida');
  const measureCard = suggestionCardFromButton('Aceptar medida', 'Medida correctiva sugerida');
  if (companyCard) {
    companyCard.classList.add('assistant-checklist-company-suggestion');
    companyCard.style.width = '';
    companyCard.style.maxWidth = '';
  }
  if (measureCard) {
    measureCard.classList.add('assistant-checklist-ai-suggestion');
    measureCard.style.width = '';
    measureCard.style.maxWidth = '';
  }
}

function scheduleSuggestionPatch() {
  window.setTimeout(applySuggestionClasses, 0);
  window.setTimeout(applySuggestionClasses, 80);
  window.setTimeout(applySuggestionClasses, 180);
  window.setTimeout(applySuggestionClasses, 360);
}

function currentTime() {
  return new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function displayDate(value: string) {
  return value ? value.replaceAll('-', '/') : '';
}

function BotMark() {
  return <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[#C8A064] text-[#001E39]"><ChatAureliaIcon className="h-[18px] w-[20px]" /></div>;
}

function BotBubble({ children }: { children: ReactNode }) {
  return <div className="mb-[10px] flex w-full items-end gap-[7px]"><BotMark /><div className="max-w-[286px] rounded-[16px] border border-[#E3E3E3] bg-white px-[13px] py-[11px] shadow-[0_1px_3px_rgba(0,0,0,0.12)]"><div className="text-[15px] leading-[22px] text-[#131313] [&_strong]:font-bold [&_strong]:text-[#131313]">{children}</div><p className="mt-[7px] text-[12px] leading-none text-[#ACACAC]">{currentTime()}</p></div></div>;
}

function UserBubble({ children }: { children: ReactNode }) {
  return <div className="mb-[10px] ml-auto max-w-[78%] rounded-[16px] bg-[#002659] px-[13px] py-[10px] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"><div className="text-[13px] font-semibold leading-[18px] text-white">{children}</div><p className="mt-[6px] text-[11px] leading-none text-[rgba(255,255,255,0.55)]">{currentTime()}</p></div>;
}

function findChatScroller() {
  const root = panel();
  return Array.from(root?.querySelectorAll('div') ?? []).find((node) => {
    const className = node.className.toString();
    return className.includes('flex-1') && className.includes('overflow-y-auto') && className.includes('bg-[#F4F6F9]');
  }) as HTMLElement | undefined;
}

function ReconstructedTranscript({ draft }: { draft: NewInspectionDraft }) {
  const currentObservation = draft.findingObservations.find((item) => !item.saved) ?? draft.findingObservations[draft.findingObservations.length - 1] ?? null;
  const savedCount = draft.findingObservations.filter((item) => item.saved).length;
  return (
    <div data-aurelia-reconstructed-chat="true">
      {draft.areaName ? <BotBubble>¡Hola, <strong>{draft.inspectorName}</strong>! 👋 Soy AurelIA. Voy a ayudarte a registrar esta inspección de forma rápida. ¿En qué <strong>área</strong> estás hoy?</BotBubble> : null}
      {draft.areaName ? <UserBubble>{draft.areaName}</UserBubble> : null}
      {draft.areaName && draft.sectorName ? <BotBubble>Perfecto, <strong>{draft.areaName}</strong> ✓. Ahora el sector — ¿en cuál específicamente?</BotBubble> : null}
      {draft.sectorName ? <UserBubble>{draft.sectorName}</UserBubble> : null}
      {draft.areaName && draft.sectorName && draft.inspectionTypeSelected ? <BotBubble><strong>{draft.areaName} · {draft.sectorName} ✓</strong>. ¿Qué tipo de inspección es?</BotBubble> : null}
      {draft.inspectionTypeSelected ? <UserBubble>{draft.inspectionTypeLabel || 'Hallazgo'}</UserBubble> : null}
      {draft.inspectionTypeSelected && draft.inspectionDateSelected ? <BotBubble>Selecciona la <strong>fecha de inspección</strong>.</BotBubble> : null}
      {draft.inspectionDateSelected ? <UserBubble>{displayDate(draft.inspectionDate)}</UserBubble> : null}
      {draft.inspectionDateSelected && draft.locationCaptured ? <BotBubble>Capturemos la <strong>ubicación obligatoria</strong>.</BotBubble> : null}
      {draft.locationCaptured ? <UserBubble>Ubicación capturada · {draft.locationAccuracyLabel}</UserBubble> : null}
      {draft.locationCaptured && draft.findingTypeLabel ? <BotBubble>Selecciona el <strong>tipo de hallazgo</strong>.</BotBubble> : null}
      {draft.findingTypeLabel ? <UserBubble>{draft.findingTypeLabel}</UserBubble> : null}
      {draft.findingTypeLabel && currentObservation?.detectedCondition ? <BotBubble>Cuéntame la condición subestándar que detectaste en <strong>{draft.areaName} · {draft.sectorName}</strong>.</BotBubble> : null}
      {currentObservation?.detectedCondition ? <UserBubble>{currentObservation.detectedCondition}</UserBubble> : null}
      {currentObservation?.evidence ? <BotBubble>Entendido. Adjunta una foto del hallazgo:</BotBubble> : null}
      {currentObservation?.evidence ? <BotBubble>Foto recibida ✓. Analicé el historial de <strong>{draft.areaName}</strong> y te propongo una medida correctiva.</BotBubble> : null}
      {currentObservation?.correctiveAction ? <UserBubble>{currentObservation.correctiveActionSource === 'ai' ? '✓ Medida aceptada' : currentObservation.correctiveAction}</UserBubble> : null}
      {currentObservation?.severityLabel ? <BotBubble>Definamos la criticidad del hallazgo.</BotBubble> : null}
      {currentObservation?.severityLabel ? <UserBubble>{currentObservation.severityLabel}</UserBubble> : null}
      {savedCount > 0 ? <BotBubble>Llevas <strong>{savedCount} observación</strong>. Revisa antes de continuar.</BotBubble> : null}
      {draft.findingCompanyName ? <UserBubble>✓ {draft.findingCompanyName} confirmada</UserBubble> : null}
    </div>
  );
}

function TranscriptPortal() {
  const draft = useNewInspectionDraftStore();
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    function syncHost() {
      const scroller = findChatScroller();
      if (!scroller) return;
      let nextHost = scroller.querySelector('[data-aurelia-transcript-host="true"]') as HTMLElement | null;
      if (!nextHost) {
        nextHost = document.createElement('div');
        nextHost.dataset.aureliaTranscriptHost = 'true';
        scroller.insertBefore(nextHost, scroller.firstChild);
      }
      setHost(nextHost);
    }
    syncHost();
    const interval = window.setInterval(syncHost, 150);
    return () => window.clearInterval(interval);
  }, []);

  if (!host) return null;
  return createPortal(<ReconstructedTranscript draft={draft} />, host);
}

export function AssistantChatStep(props: AssistantChatStepProps) {
  useEffect(() => {
    scheduleSuggestionPatch();
    const observer = new MutationObserver(scheduleSuggestionPatch);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'style'] });
    const interval = window.setInterval(applySuggestionClasses, 120);
    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  return <><AssistantChatStepV9 {...props} />{props.resumeFromDraft ? <TranscriptPortal /> : null}</>;
}
