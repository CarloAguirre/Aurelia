# Fase SPR - Reportabilidad mensual

SPR se adelanta como siguiente módulo por prioridad funcional, aunque en el roadmap formal aparece después de dashboard operacional y MUE.

## Objetivo

Implementar la base de datos, contratos compartidos y API operativa para reportabilidad mensual SPR, con parámetros, unidades, asignaciones por área, registros mensuales, revisiones y reglas de consolidación.

## SPR-A - Modelo de datos y contratos

### Estado

Completado.

### Incluido

- Grupos de medición.
- Unidades.
- Parámetros SPR.
- Indicadores SOX y obligatoriedad de evidencia.
- Asignación de parámetros a áreas, responsables y revisores.
- Registro mensual por parámetro, área, año y mes.
- Estados de registro mensual.
- Revisión de registro.
- Reglas base de consolidación.
- Contratos compartidos.

### Tablas

```txt
spr_measure_groups
spr_units
spr_parameters
spr_parameter_area_assignments
spr_monthly_records
spr_record_approvals
spr_consolidation_rules
```

### Decisiones

- Las evidencias SPR se vinculan mediante `evidence_links` con `entity_type = spr_monthly_record`.
- El seed inicial no carga los 51 parámetros definitivos; deja un catálogo mínimo para validar el modelo.
- Los parámetros SOX se marcan con `is_sox` y `requires_evidence`.
- La validación de evidencia obligatoria queda para la fase de API avanzada.
- `period_year` y `period_month` representan el periodo mensual.
- `numeric_value`, `text_value` y `boolean_value` soportan parámetros de distinto tipo.

### Criterios de salida

- `pnpm build --force` pasa.
- `pnpm lint --force` pasa.
- `pnpm migration:run` crea las tablas SPR.
- `pnpm migration:run` repetido queda sin migraciones pendientes.
- El seed de catálogo SPR es idempotente.

## SPR-B - API mínima de registros mensuales

### Estado

Implementado.

### Incluido

```txt
GET   /api/spr/groups
GET   /api/spr/measure-groups
GET   /api/spr/units
GET   /api/spr/parameters
GET   /api/spr/assignments
POST  /api/spr/monthly-records
GET   /api/spr/monthly-records
GET   /api/spr/monthly-records/:id
PATCH /api/spr/monthly-records/:id
PATCH /api/spr/monthly-records/:id/status
```

### Reglas

- `POST /api/spr/monthly-records` valida que el parámetro exista.
- Si viene `assignmentId`, valida que la asignación exista y pertenezca al parámetro.
- Un registro mensual no se puede duplicar por `parameterId + areaId + periodYear + periodMonth`.
- El listado soporta filtros por `parameterId`, `areaId`, `status`, `periodYear` y `periodMonth`.
- Al pasar a `submitted`, se registra `submittedAt`.
- Al pasar a `approved`, se registra `approvedAt`.

### Colección HTTP

```txt
docs/api/phase-spr.http
```

### Criterios de salida

- `pnpm build --force` pasa.
- `pnpm lint --force` pasa.
- `pnpm migration:run` queda sin pendientes.
- `pnpm test` cubre el happy path SPR.

## SPR-C - Evidencias y validación SOX

Pendiente.

- Validar respaldo obligatorio antes de envío o aprobación para parámetros que requieren evidencia.
- Listar evidencias por registro mensual.
- Vincular evidencias a `spr_monthly_record`.
- Integrar comentarios y auditoría.
- Definir revisión por responsable y gerencia.

## SPR-D - Dashboard y consolidación

Pendiente.

- Resumen mensual por estado.
- Parámetros pendientes por área.
- Parámetros sin evidencia requerida.
- Consolidado mensual básico.
- Export JSON/CSV inicial.

## SPR-E - Smoke tests y documentación final

Pendiente.

- Completar cobertura `pnpm test`.
- Completar `docs/api/phase-spr.http`.
- Checklist final de validación.
