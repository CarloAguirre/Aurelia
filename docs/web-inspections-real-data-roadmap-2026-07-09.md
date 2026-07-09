# Web Inspections - Roadmap de datos reales

Fecha: 2026-07-09
Rama: `feature/inspecciones/carlo`

## Objetivo

Conectar el flujo web de inspecciones con datos reales sin perder la paridad visual ya construida contra Figma/mobile.

## Estado actual

### Etapa 1 - Modelo de hallazgos y evidencias

Estado: implementada.

Decisión aplicada:

- La inspección puede mantener evidencia general (`entity_type = inspection`).
- Cada hallazgo debe poder mantener evidencia propia (`entity_type = inspection_finding`), especialmente la foto/evidencia de `antes`.
- Los seguimientos pueden mantener evidencia propia (`entity_type = inspection_followup`), especialmente la foto/evidencia de `después`.
- El export de inspección debe devolver evidencia agregada de la inspección, hallazgos y seguimientos para que PDF/modal/reporting no pierdan archivos vinculados a observaciones específicas.

Cambios relacionados:

- El flujo de creación web ya enlaza evidencia de observaciones contra `inspection_finding`.
- El export backend ahora agrega evidencias por inspección, hallazgo y seguimiento.
- `GET /api/inspections/:id/evidences` ahora devuelve el conjunto completo relacionado a la inspección, no solo evidencia general.

### Etapa 2 - Creación web manual / asistente

Estado: implementada con hardening reciente.

Cambios cerrados:

- El usuario autenticado queda registrado como `inspectorId` al crear la inspección.
- La tabla de gestión deja de mostrar `Sin inspector` para inspecciones nuevas creadas desde sesión válida.
- El selector de fecha del filtro de gestión fue restaurado desde el componente previo con popup calendario.
- El selector de responsables usa endpoint interno de inspecciones para evitar depender de permisos generales de administración de usuarios.

Pendiente:

- Backfill opcional para inspecciones antiguas que ya quedaron con `inspector_id = null`.
- QA de guardado con usuario real, contratista real, hallazgos múltiples y checklist con respuestas NO.

### Etapa 3 - Modal detalle con datos reales

Estado: implementada para lectura real.

Avance:

- Se agregó contrato compartido `InspectionDetailResponse`.
- Se agregó `GET /api/inspections/:id/detail`.
- El endpoint de detalle devuelve cabecera, contadores por estado, hallazgos agrupados, seguimientos, datos generales, responsables y evidencias por hallazgo.
- Se agregó servicio web `getInspectionDetail(inspectionId)`.
- Se agregó hook `useInspectionDetail(inspectionId)` con React Query.
- La tabla de gestión pasa `inspectionId` real al modal además del número visible.
- Se agregó `InspectionDetailModalDataBridge` para hidratar cabecera, metadata, progreso y contadores reales sin romper el modal visual existente.
- Se agregó `InspectionDetailRealDataModal` para renderizar tarjetas reales por estado usando `InspectionDetailResponse.findings`.
- Seguimientos, datos generales y botón PDF ya leen del payload real en la vista de detalle real.
- El bridge dejó de ocultar errores con el mock: si `/api/inspections/:id/detail` falla, muestra un estado de error visible.
- Las evidencias de observación y generales se renderizan con previsualización de imagen usando contenido binario real del archivo.
- Datos generales vuelve a mostrar responsables reales y botón visual de reasignación.
- Se mantiene `getInspectionExportPayload(inspectionId)` para PDF/reporting y compatibilidad con export.

### Etapa 4 - Acciones operativas desde modal

Estado: iniciada.

Implementado:

- Cliente HTTP `PATCH`.
- Servicio web `updateInspectionFinding`.
- Hook `useInspectionFindingActions`.
- Ejecutar observación abierta o rechazada actualizando estado a `in_progress`.
- Aprobar cierre actualizando estado a `closed`.
- Rechazar cierre actualizando estado a `rejected` y guardando motivo.
- Reasignar SLA actualizando `dueAt`.
- Invalidación de queries de detalle, gestión y dashboard tras cada acción.

Pendiente:

- Subir evidencia después como `inspection_finding/after_photo` durante ejecución.
- Reasignar responsable real modificando responsables asociados al hallazgo.
- Reemplazar prompts nativos por modales visuales fieles a Figma si QA lo requiere.

### Etapa 5 - QA / cierre MVP web inspecciones

Estado: pendiente.

Checks mínimos:

- `pnpm --filter @aurelia/contracts build`
- `pnpm --filter api build`
- `pnpm --filter web typecheck`
- `pnpm --filter web build`
- Prueba manual de creación Hallazgo.
- Prueba manual de creación Checklist normativo.
- Prueba manual de apertura de modal detalle desde tabla.
- Prueba manual de export PDF.

## Próxima iteración recomendada

Implementar carga de evidencia `after_photo` desde el modal al ejecutar una observación, usando el mismo patrón de subida y vinculación ya aplicado en creación de inspecciones.
