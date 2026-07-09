// Constantes de la primera pantalla del modulo SPR (formulario de carga mensual).
//
// IMPORTANTE — CAMPOS SIN RESPALDO EN BACKEND (gaps conocidos):
// Los valores marcados como MOCK/PLACEHOLDER no tienen fuente en la API actual
// (apps/api/src/modules/spr) ni contrato en @aurelia/contracts. Se muestran solo
// para respetar el diseno de Figma y quedan pendientes de definicion con backend.

// MOCK: el backend no modela un "ciclo activo" con fecha limite. Se usa un periodo
// fijo de referencia para consultar los registros mensuales del formulario.
export const SPR_ACTIVE_CYCLE = {
  periodYear: 2026,
  periodMonth: 5,
  label: 'Mayo 2026',
  rangeLabel: '01 mayo — 31 mayo',
  // MOCK: no existe deadline en el modelo de datos.
  deadlineLabel: '10-06-2026',
  deadlineHelper: '5 días restantes',
  cycleStatusLabel: 'En curso',
} as const;

// PLACEHOLDER: estado post-envio del formulario (Figma 1666:2149). Parte de los textos
// no tienen endpoint dedicado; se derivan del status de registros cuando es posible.
export const SPR_SUBMITTED_STATUS = {
  formStatusLabel: 'Aprobación pendiente',
  formStatusHelper: 'Pendiente por gerente del área',
  reportStatusLabel: 'Aún no disponible',
  // MOCK: fallback si submittedAt no viene en los registros.
  signDateFallbackLabel: '09-06-2026',
  processStepTitle: (cycleLabel: string) => `Formulario SPR ${cycleLabel} de tu área ha sido emitido`,
  processStepHelper: 'A la espera de la aprobación y firma de tu gerente de área',
} as const;

// PLACEHOLDER: estado post-reenvio tras correccion (Figma 1672:8557).
export const SPR_CORRECTED_STATUS = {
  correctedStepTitle: (cycleLabel: string) => `Formulario SPR ${cycleLabel} ha sido corregido`,
  correctedStepHelper: 'A la espera de la aprobación y firma de tu gerente de área.',
  emittedStepTitle: (cycleLabel: string) => `Formulario SPR ${cycleLabel} de tu área ha sido emitido`,
  emittedStepHelper: 'A la espera de la aprobación y firma de tu gerente de área.',
} as const;

// PLACEHOLDER: estado post-rechazo del formulario (Figma 1672:5810).
export const SPR_REJECTED_STATUS = {
  formStatusLabel: 'Correcciones pendientes',
  formStatusHelper: 'Pendiente por gerente del área',
  reportStatusLabel: 'Aún no disponible',
  rejectedStepTitle: (cycleLabel: string) => `Formulario SPR ${cycleLabel} ha sido rechazado por Gerente de área`,
  rejectedStepHelper: 'A la espera de tus correcciones.',
  rejectedBadgeLabel: 'Pendiente',
  emittedStepTitle: (cycleLabel: string) => `Formulario SPR ${cycleLabel} de tu área ha sido emitido`,
  emittedStepHelper: 'A la espera de la aprobación y firma de tu gerente de área.',
} as const;

// PLACEHOLDER: modo corrección post-rechazo (Figma 1672:6610).
export const SPR_CORRECTION_MODE = {
  approverFallbackLabel: 'Gerente de área',
  rejectedDateFallback: '05-06-2026',
  rejectedTimeFallback: '15:22',
  commentFallback:
    'El valor reportado requiere verificación. Por favor corregir el dato antes de reenviar.',
  statusLabel: 'Rechazado — pendiente corrección',
  bannerTitle: (approverLabel: string, dateLabel: string, timeLabel: string) =>
    `Formulario rechazado por ${approverLabel} · ${dateLabel} · ${timeLabel}`,
  statusHelper: (dateLabel: string, timeLabel: string) => `Rechazado el ${dateLabel} · ${timeLabel}`,
  footerReadyMessage: 'Todos los parámetros completados. Puedes firmar y enviar.',
} as const;

// Copy del modal de envio (Figma 1666:3035 / 1672:7702).
export const SPR_SUBMIT_MODAL = {
  title: 'Firmar y enviar formulario',
  initialDescription:
    'Al firmar confirmas que los datos ingresados son correctos y están respaldados por la documentación adjunta. El Gerente de Área recibirá una notificación para revisar y aprobar.',
  correctionDescription:
    'Al firmar confirmas que los datos han sido corregidos. El Gerente de Área recibirá una notificación para revisar y aprobar.',
  summaryTitle: 'Resumen del formulario',
} as const;

// PLACEHOLDER: "Fuente del dato" no existe como campo en spr_monthly_records.
// Se ofrece como selector visual; el valor no se persiste por ahora.
export const SPR_DATA_SOURCE_OPTIONS = [
  'Sistema Monitoreo de Extracciones DGEA',
  'Medición directa en terreno',
  'Estimación / cálculo interno',
  'Reporte de proveedor externo',
] as const;

// PLACEHOLDER: la documentacion adjunta requiere un record id y flujo de evidencias
// (GET/POST /spr/monthly-records/:id/evidences). Para la primera pantalla se listan
// archivos de ejemplo tomados del diseno, sin wiring real de carga/descarga.
export const SPR_MOCK_ATTACHMENTS = [
  { name: 'Registro_Mensual_Agua_MAY2026.xlsx', size: '284 KB', type: 'excel' as const },
  { name: 'Declaracion_DGEA_Mayo2026.pdf', size: '1,2 MB', type: 'pdf' as const },
] as const;

// PLACEHOLDER: promedios historicos de 6 meses para alertas de rango (Figma 1395:4462).
// La logica real vive en sprHistoricalRange.ts; se evalua por codigo de parametro.
