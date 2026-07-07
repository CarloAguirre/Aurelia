import { useEffect, useRef, type ComponentProps } from 'react';
import { AssistantChatStep as BaseAssistantChatStep } from './AssistantChatStepV3';

type AssistantChatStepProps = ComponentProps<typeof BaseAssistantChatStep>;

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function checkIcon() {
  return '<span style="font-weight:700;color:#131313">✓</span>';
}

function richBotCopy(value: string) {
  const text = value.replace(/\s+/g, ' ').trim();
  let match = text.match(/^¡Hola,\s+(.+?)!\s+Soy AurelIA\. ¿En qué área estás hoy\?$/);
  if (match?.[1]) {
    const name = escapeHtml(match[1]);
    return `¡Hola, <strong>${name}</strong>! 👋 Soy AurelIA. Voy a ayudarte a registrar esta inspección de forma rápida. ¿En qué <strong>área</strong> estás hoy?`;
  }

  match = text.match(/^Perfecto,\s+(.+?)\. Ahora el sector\.$/);
  if (match?.[1]) {
    const area = escapeHtml(match[1]);
    return `Perfecto, <strong>${area}</strong> ${checkIcon()}. Ahora el sector — ¿en cuál específicamente?`;
  }

  match = text.match(/^(.+?) · (.+?)\. ¿Qué tipo de inspección es\?$/);
  if (match?.[1] && match?.[2]) {
    const area = escapeHtml(match[1]);
    const sector = escapeHtml(match[2]);
    return `<strong>${area} · ${sector} ${checkIcon()}</strong>. ¿Qué tipo de inspección es?`;
  }

  match = text.match(/^Cuéntame la condición subestándar que detectaste en (.+?) · (.+?)\.$/);
  if (match?.[1] && match?.[2]) {
    const area = escapeHtml(match[1]);
    const sector = escapeHtml(match[2]);
    return `Cuéntame la condición subestándar que detectaste en <strong>${area} · ${sector}</strong>.`;
  }

  match = text.match(/^Foto recibida\. Analicé el historial de (.+?) y te propongo:$/);
  if (match?.[1]) {
    const context = escapeHtml(match[1]);
    return `Foto recibida ${checkIcon()}. Analicé el historial de <strong>${context}</strong> y te propongo:`;
  }

  match = text.match(/^Llevas (\d+) observación\. Revisa antes de continuar:$/);
  if (match?.[1]) {
    return `Llevas <strong>${escapeHtml(match[1])} observación</strong>. Revisa antes de continuar:`;
  }

  match = text.match(/^Basándome en el historial de (.+?) · (.+?), te propongo:$/);
  if (match?.[1] && match?.[2]) {
    const area = escapeHtml(match[1]);
    const sector = escapeHtml(match[2]);
    return `Basándome en el historial de <strong>${area} · ${sector}</strong>, te propongo:`;
  }

  match = text.match(/^Para (.+?), sugiero este personal\. Selecciona uno o más:$/);
  if (match?.[1]) {
    return `Para <strong>${escapeHtml(match[1])}</strong>, sugiero este personal. Selecciona uno o más:`;
  }

  match = text.match(/^¡Listo! Revisa el resumen antes de guardar:$/);
  if (match) {
    return `¡Listo! Revisa el <strong>resumen</strong> antes de guardar:`;
  }

  match = text.match(/^Capturemos la ubicación obligatoria\.$/);
  if (match) {
    return 'Capturemos la <strong>ubicación obligatoria</strong>.';
  }

  match = text.match(/^Selecciona la fecha de inspección\.$/);
  if (match) {
    return 'Selecciona la <strong>fecha de inspección</strong>.';
  }

  match = text.match(/^Selecciona el tipo de hallazgo\.$/);
  if (match) {
    return 'Selecciona el <strong>tipo de hallazgo</strong>.';
  }

  return null;
}

function applyRichBotCopy(root: HTMLElement) {
  root.querySelectorAll('p').forEach((element) => {
    const currentText = element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const rich = richBotCopy(currentText);
    if (!rich || element.dataset.aureliaRichCopy === rich) return;
    element.innerHTML = rich;
    element.dataset.aureliaRichCopy = rich;
  });
}

export function AssistantChatStep(props: AssistantChatStepProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const render = () => applyRichBotCopy(root);
    const observer = new MutationObserver(render);
    render();
    observer.observe(root, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return <div ref={rootRef} className="contents"><BaseAssistantChatStep {...props} /></div>;
}
