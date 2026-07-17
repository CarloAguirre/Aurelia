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

// PLACEHOLDER: estado post-aprobacion del responsable (Figma 1672:10996).
export const SPR_APPROVED_STATUS = {
  formStatusLabel: 'Completado ✓',
  formStatusHelper: 'Aprobado por tu Gerente',
  reportStatusLabel: 'Aún no disponible',
  // MOCK: fallback si approvedAt no viene en los registros.
  managerApprovalDateFallback: '05-06-2026',
  kpiPendingStepTitle: (cycleLabel: string) => `A la espera de Validación de KPIs — Reporte SPR ${cycleLabel}`,
  kpiPendingStepHelper:
    'Cuándo el reporte sea firmado por Especialistas de Sustentabilidad recibirás una notificación para validar tus datos',
  kpiPendingBadgeLabel: 'A la espera de firma de Especialistas de Sustentabilidad',
  approvedStepTitle: (cycleLabel: string) => `Formulario SPR ${cycleLabel} aprobado`,
  approvedStepHelper: (dateLabel: string) => `Tu Gerente de Área aprobó y firmó el formulario el ${dateLabel}`,
} as const;

// PLACEHOLDER: estado pendiente de revision del gerente (Figma 1672:4994).
export const SPR_MANAGER_PENDING_REVIEW_STATUS = {
  pendingStepTitle: (cycleLabel: string) => `Formulario SPR ${cycleLabel} pendiente de aprobación`,
  pendingStepHelper: 'A la espera de tu firma y aprobación',
  pendingBadgeLabel: 'Pendiente',
  deliveredStepTitle: (cycleLabel: string) => `Formulario SPR ${cycleLabel} entregado por el responsable del área`,
  deliveredStepHelper: 'El responsable de área ha emitido el formulario',
} as const;

// PLACEHOLDER: pantalla de revision del gerente (Figma 1395:12112 / 1399:13951).
export const SPR_AREA_REVIEW = {
  responsibleNameFallback: 'Responsable de área',
  dataSourcePlaceholder: 'Sin fuente declarada',
  submittedDateFallback: '08-06-2026',
  signedDateFallback: '05-06-2026',
  signedTimeFallback: '14:23',
  entryDateFallback: '05-06-2026 · 14:08',
  footerInfo:
    'Al aprobar, AurelIA generará automáticamente las evidencias SOX y notificará al Gerente MA.',
  rejectLabel: 'Rechazar',
  approveLabel: 'Aprobar y firmar',
  pendingReviewBadge: 'Pendiente tu revisión',
  areaStatusLabel: 'Esperando tu firma',
  processStatusLabel: 'Pendiente tu firma',
  formSentTitle: (responsibleLabel: string) => `Formulario enviado por ${responsibleLabel}`,
  readOnlyHint: 'Solo lectura · Selecciona un parámetro para revisar',
  pageSubtitle: (cycleLabel: string) =>
    `Ciclo ${cycleLabel} · Formulario recibido · Pendiente de tu revisión y firma`,
  parametersCompletedLabel: (completed: number, total: number) => `${completed} de ${total}`,
  attachmentsCountLabel: (count: number) => `${count} ${count === 1 ? 'archivo' : 'archivos'}`,
  historicalAlertTitle: 'Valor fuera del rango histórico — detectado por AurelIA',
  historicalAlertDescription:
    'Este parámetro presenta una desviación superior al 10% respecto al promedio de los últimos 6 meses. Revisa el valor y la nota explicativa del Responsable antes de aprobar o rechazar.',
  responsibleNoteSectionTitle: 'Nota del Responsable de Área',
  justificationHeader: 'Justificación del Responsable · En respuesta a la alerta detectada',
  soxApprovalNotice: (controlCode: string) =>
    `Al aprobar este formulario, AurelIA generará automáticamente la evidencia SOX ${controlCode} para firma del Gerente MA. Esta evidencia incluirá el valor reportado y la alerta de desviación como antecedente.`,
} as const;

// Modal de rechazo del gerente (Figma 1399:14360).
export const SPR_AREA_REJECT_MODAL = {
  title: 'Rechazar formulario',
  description:
    'El Responsable de Área recibirá una notificación con tu motivo y podrá corregir el formulario desde AurelIA antes del plazo de cierre.',
  reasonLabel: 'Motivo del rechazo',
  reasonPlaceholder: (responsibleLabel: string) =>
    `Describe qué debe corregir ${responsibleLabel}. Sé específico para facilitar la corrección...`,
  cancelLabel: 'Cancelar',
  submitLabel: 'Enviar rechazo',
} as const;

// Modal de aprobación/firma del gerente (Figma 1672:10058 overlay + 1672:10110).
export const SPR_AREA_APPROVE_MODAL = {
  title: 'Aprobar y firmar formulario',
  description: (responsibleLabel: string) =>
    `Al firmar confirmas que revisaste los datos reportados por ${responsibleLabel} y la documentación de respaldo.`,
  summaryTitle: 'Resumen del formulario',
  digitalSignatureLabel: 'Firma digital',
  signCtaLabel: 'Haz clic para firmar digitalmente',
  signedLabel: 'Firmado digitalmente',
  roleLabel: 'Gerente de Área',
  cancelLabel: 'Cancelar',
  confirmLabel: 'Confirmar aprobación',
  soxNotice: (soxEvidenceCount: number) =>
    soxEvidenceCount === 1
      ? 'Al aprobar, AurelIA generará automáticamente 1 evidencia SOX y notificará al Gerente MA para su firma.'
      : `Al aprobar, AurelIA generará automáticamente ${soxEvidenceCount} evidencias SOX y notificará al Gerente MA para su firma.`,
} as const;

// PLACEHOLDER: estado pre-envio del gerente de area (Figma 1672:4446).
export const SPR_MANAGER_WAITING_STATUS = {
  formStatusLabel: 'A la espera',
  formStatusHelper: 'Pendiente por responsable del área',
  reportStatusLabel: 'Aún no disponible',
  unavailableStepTitle: (cycleLabel: string) => `Formulario SPR ${cycleLabel} de tu área todavía no está disponible`,
  unavailableStepHelper: 'A la espera de emisión por el responsable de área',
  pendingBadgeLabel: 'Pendiente',
} as const;

// PROVISIONAL: Figma 1672:5531 cableado; copy KPI pendiente de confirmar con Alexis (pregunta C1).
// Espejo gerente de 1672:5810. Layout/timeline razonables; el helper "Pendiente por gerente del área" puede ser incorrecto.
export const SPR_MANAGER_REJECTED_WAITING_STATUS = {
  formStatusLabel: 'Correcciones pendientes',
  formStatusHelper: 'Pendiente por gerente del área',
  reportStatusLabel: 'Aún no disponible',
  rejectedStepTitle: (cycleLabel: string) => `Formulario SPR ${cycleLabel} ha sido rechazado por tí`,
  rejectedStepHelper: 'A la espera de correcciones del responsable del área',
  rejectedBadgeLabel: 'Pendiente',
  deliveredStepTitle: (cycleLabel: string) => `Formulario SPR ${cycleLabel} entregado por el responsable del área`,
  deliveredStepHelper: 'El responsable de área ha emitido el formulario',
} as const;

// Gerente re-revision tras reenvio corregido (Figma 1672:8268; conexion con 1672:8557).
// PROVISIONAL: implementado sin confirmar con Alexis si esta vista debe navegar a review UI (pregunta G2 pendiente).
export const SPR_MANAGER_PENDING_RE_REVIEW_STATUS = {
  pendingStepTitle: (cycleLabel: string) => `Formulario SPR ${cycleLabel} con correcciones pendiente de aprobación`,
  pendingStepHelper: 'A la espera de tu firma y aprobación',
  pendingBadgeLabel: 'Pendiente',
  rejectedStepTitle: (cycleLabel: string) => `Formulario SPR ${cycleLabel} ha sido rechazado por tí`,
  rejectedStepHelper: 'A la espera de correcciones del responsable del área',
  deliveredStepTitle: (cycleLabel: string) => `Formulario SPR ${cycleLabel} entregado por el responsable del área`,
  deliveredStepHelper: 'El responsable de área ha emitido el formulario',
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
  nonEditableRecordMessage: 'Este parámetro ya fue aprobado y no se puede editar.',
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
