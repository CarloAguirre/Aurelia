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

Objetivo: habilitar la primera operación real del módulo sin incorporar todavía hallazgos, seguimientos, cierre, workflow ni dashboard avanzado.

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

Estado: cerrada.

## Fase 4C - Hallazgos, seguimientos y cierre

Objetivo: completar el flujo operativo de una inspección con desviaciones, acciones de seguimiento y reglas de cierre.

Endpoints incluidos:

```txt
GET    /api/inspections/dashboard/summary
GET    /api/inspections/:id/findings
POST   /api/inspections/:id/findings
PATCH  /api/inspections/findings/:findingId
POST   /api/inspections/findings/:findingId/followups
PATCH  /api/inspections/followups/:followupId
POST   /api/inspections/:id/close
```

Reglas:

- Una inspección puede tener múltiples hallazgos.
- Un hallazgo puede tener máximo tres seguimientos.
- Una inspección solo se puede cerrar si no tiene hallazgos abiertos.
- Al crear/cerrar hallazgos se recalculan `findings_count` y `open_findings_count`.

Estado: cerrada.

## Fase 4D - Integración transversal liviana

Objetivo: conectar inspecciones con la capa transversal sin bloquear el avance con PDF real, workflow avanzado ni frontend.

Endpoints incluidos:

```txt
GET    /api/inspections/:id/evidences
POST   /api/inspections/:id/evidences/:evidenceId/link
GET    /api/inspections/:id/comments
POST   /api/inspections/:id/comments
GET    /api/inspections/:id/export
```

Alcance:

- Vincular evidencias existentes vía `evidence_links` usando `entity_type = inspection`.
- Listar evidencias asociadas a una inspección.
- Crear y listar comentarios asociados a una inspección.
- Registrar auditoría explícita al vincular evidencias y crear comentarios.
- Entregar payload exportable en JSON con inspección, checklist, respuestas, hallazgos, seguimientos, evidencias y comentarios.

Queda fuera de 4D:

- PDF binario real.
- Workflow automático de revisión.
- Integración con notificaciones.
- Integración transversal específica a hallazgos y seguimientos.

## Fase 4E - Exportación PDF y dashboard inicial avanzado

Objetivo: agregar salidas operativas sin bloquear el flujo base.

Alcance:

```txt
GET /api/inspections/:id/export/pdf
GET /api/inspections/dashboard/summary avanzado
```

Queda fuera hasta fases posteriores:

- Mobile offline.
- Notificaciones.
- Auth real / guards.
- Dashboard web avanzado.
- Incidentes.
- SPR.
- MUE / controles críticos.
