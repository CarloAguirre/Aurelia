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

Estado: iniciada.

Avance:

- Se agregó servicio web `getInspectionExportPayload(inspectionId)`.
- Se agregó hook `useInspectionExport(inspectionId)` con React Query.
- La API de export ya entrega los grupos de evidencias necesarios para poblar el modal sin depender de mock data.

Pendiente próximo:

- Conectar `InspectionDetailModal` a `useInspectionExport`.
- Pasar `inspectionId` real desde la tabla al modal además del número visible `#xx`.
- Reemplazar gradualmente mocks del modal por payload real:
  - cabecera y metadata,
  - contadores ejecutadas / abiertas / cerradas / rechazadas,
  - tarjetas de observaciones,
  - seguimientos,
  - datos generales,
  - botón PDF apuntando a `/api/inspections/:id/export/pdf`.

### Etapa 4 - Acciones operativas desde modal

Estado: pendiente.

Pendiente:

- Ejecutar observación abierta.
- Subir evidencia después.
- Reasignar SLA.
- Aprobar cierre.
- Rechazar cierre.
- Reasignar responsable.

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

Conectar el modal de detalle al hook `useInspectionExport` y mantener fallback visual a mock solo mientras la carga está pendiente o falla. Esto permite avanzar sin romper la fidelidad visual actual y habilita reemplazos por sección.
