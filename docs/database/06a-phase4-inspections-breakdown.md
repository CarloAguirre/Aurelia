# Aurelia - Desglose Fase 4 Inspecciones MVP

Este documento complementa `06-implementation-roadmap.md` y deja documentada la división operativa acordada para implementar inspecciones sin inflar una sola entrega.

## Fase 4A - Modelo de datos y contratos

Objetivo: dejar lista la base persistente y los contratos compartidos del módulo de inspecciones, sin activar todavía la API funcional completa.

Alcance:

```txt
inspection_types
inspection_checklist_templates
inspection_checklist_sections
inspection_checklist_items
inspections
inspection_checklist_answers
inspection_findings
inspection_followups
inspection_status_history
```

Entregables:

```txt
apps/api/src/modules/inspections/entities/*
apps/api/src/database/migrations/*Phase4AInspectionsDataModel.ts
packages/contracts/src/enums/inspection-*.ts
packages/contracts/src/interfaces/inspection.interface.ts
packages/contracts/src/dtos/inspections/*
apps/api/src/database/seeds/001-seed-phase1.ts
```

Criterios de salida:

- Migración ejecuta sobre una BD con Fase 1 y Fase 2 aplicadas.
- Seed sigue siendo idempotente.
- Existen tipos de inspección iniciales.
- Existe al menos un template de checklist ambiental básico con secciones e ítems.
- Las entidades TypeORM compilan.
- `@aurelia/contracts` expone enums, interfaces y DTOs de inspecciones.
- No se implementan controllers funcionales todavía.

## Fase 4B - API operativa mínima

Objetivo: habilitar CRUD y lectura funcional del módulo.

Endpoints propuestos:

```txt
GET    /api/inspections/types
GET    /api/inspections/templates
POST   /api/inspections/templates
POST   /api/inspections
GET    /api/inspections
GET    /api/inspections/:id
PATCH  /api/inspections/:id
POST   /api/inspections/:id/answers
POST   /api/inspections/:id/findings
PATCH  /api/inspections/findings/:findingId
POST   /api/inspections/findings/:findingId/followups
POST   /api/inspections/:id/close
GET    /api/inspections/dashboard/summary
```

Criterios de salida:

- Se puede crear una inspección desde un template.
- Se pueden registrar respuestas de checklist.
- Se pueden crear hallazgos.
- Se pueden crear hasta tres seguimientos por hallazgo.
- Se puede cerrar una inspección solo si no tiene hallazgos abiertos.
- Se registra auditoría explícita en acciones relevantes.

## Fase 4C - Integración transversal

Objetivo: conectar inspecciones con evidencias, comentarios, auditoría y workflow.

Alcance:

- Vincular evidencias vía `evidence_links` usando `inspection`, `inspection_finding` e `inspection_followup`.
- Listar comentarios por inspección/hallazgo/seguimiento.
- Iniciar workflow de validación cuando una inspección se envía a revisión.
- Registrar `inspection_status_history` en cambios de estado.

## Fase 4D - Exportación y dashboard inicial

Objetivo: agregar salidas operativas sin bloquear el flujo base.

Alcance:

```txt
inspection_exports
GET /api/inspections/:id/export/pdf
GET /api/inspections/dashboard/summary
```

Queda fuera hasta fases posteriores:

- Mobile offline.
- Notificaciones.
- Auth real / guards.
- Dashboard web avanzado.
- Incidentes.
- SPR.
- MUE / controles críticos.
