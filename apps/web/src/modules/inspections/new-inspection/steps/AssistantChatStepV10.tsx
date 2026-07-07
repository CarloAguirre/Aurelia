import { useEffect, type ComponentProps } from 'react';
import { AssistantChatStep as AssistantChatStepV9 } from './AssistantChatStepV9';

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

  return <AssistantChatStepV9 {...props} />;
}
