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

Estado: cerrada.

## Fase 4B - API operativa mínima

Objetivo: habilitar la primera operación real del módulo sin incorporar todavía hallazgos, seguimientos, cierre, workflow ni dashboard.

Endpoints incluidos:

```txt
GET    /api/inspections/types
GET    /api/inspections/templates
POST   /api/inspections
GET    /api/inspections
GET    /api/inspections/:id
PATCH  /api/inspections/:id
PATCH  /api/inspections/:id/status
POST   /api/inspections/:id/answers
```

Entregables:

```txt
apps/api/src/modules/inspections/inspections.controller.ts
apps/api/src/modules/inspections/inspections.service.ts
apps/api/src/modules/inspections/dto/update-inspection.dto.ts
apps/api/src/modules/inspections/dto/upsert-inspection-answer.dto.ts
packages/contracts/src/dtos/inspections/update-inspection.request.ts
packages/contracts/src/dtos/inspections/upsert-inspection-answer.request.ts
docs/api/phase4.http
```

Criterios de salida:

- Se listan tipos de inspección.
- Se listan templates con secciones e ítems.
- Se puede crear una inspección desde un tipo y template válidos.
- Se puede listar y consultar una inspección por ID.
- Se puede actualizar una inspección y registrar historial cuando cambia el estado.
- Se pueden registrar/actualizar respuestas de checklist.
- `pnpm build --force`, `pnpm lint --force` y `pnpm migration:run` pasan.

Queda fuera de 4B:

- Crear/editar templates por API.
- Crear hallazgos.
- Seguimientos de hallazgos.
- Cierre de inspección.
- Dashboard de inspecciones.
- Integración formal con evidencias, comentarios, auditoría y workflow.

## Fase 4C - Hallazgos, seguimientos y cierre

Objetivo: completar el flujo operativo de una inspección con desviaciones, acciones de seguimiento y reglas de cierre.

Endpoints propuestos:

```txt
POST   /api/inspections/:id/findings
PATCH  /api/inspections/findings/:findingId
POST   /api/inspections/findings/:findingId/followups
POST   /api/inspections/:id/close
```

Reglas:

- Una inspección puede tener múltiples hallazgos.
- Un hallazgo puede tener máximo tres seguimientos.
- Una inspección solo se puede cerrar si no tiene hallazgos abiertos.
- Al crear/cerrar hallazgos se deben recalcular `findings_count` y `open_findings_count`.

## Fase 4D - Integración transversal

Objetivo: conectar inspecciones con evidencias, comentarios, auditoría y workflow.

Alcance:

- Vincular evidencias vía `evidence_links` usando `inspection`, `inspection_finding` e `inspection_followup`.
- Listar comentarios por inspección/hallazgo/seguimiento.
- Registrar auditoría explícita en acciones relevantes.
- Iniciar workflow de validación cuando una inspección se envía a revisión.

## Fase 4E - Exportación y dashboard inicial

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
