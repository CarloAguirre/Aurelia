# 04 - DDL PostgreSQL Draft

Este archivo acompaña a `04-ddl-postgres-draft.sql` y explica la decisión de modelado aplicada.

## Decisión principal

Se utiliza un modelo híbrido:

- **FK estricta** para relaciones centrales del negocio.
- **Relación polimórfica controlada** para elementos transversales.

## FK estricta

Aplica en relaciones donde la integridad referencial es parte del dominio:

- `inspection -> inspection_findings -> inspection_followups`
- `incident -> incident_flash_reports -> incident_investigations -> incident_action_plans`
- `mue -> critical_controls -> control_verification_items`
- `spr_parameters -> spr_monthly_records`
- `emission_sources -> emission_activity_levels -> emission_calculations`

## Polimórfico controlado

Aplica en tablas reutilizables entre módulos:

- `evidence_links`
- `comments`
- `audit_logs`
- `workflow_instances`
- `notifications`

Estas tablas usan:

```sql
entity_type
entity_id
```

`entity_type` no es texto libre: referencia la tabla `entity_reference_types`.

## Motivo

Aurelia tendrá varios dominios que comparten evidencias, comentarios, auditoría, workflow y notificaciones. Si cada módulo tuviera sus propias tablas puente, aparecerían muchas tablas repetidas:

- `inspection_evidences`
- `incident_evidences`
- `spr_record_evidences`
- `control_evidences`
- `finding_comments`
- `incident_comments`
- etc.

El modelo híbrido evita esa duplicidad sin sacrificar la integridad del núcleo del negocio.

## Siguiente paso

Validar este DDL como borrador y luego generar:

- `05-typeorm-entities-plan.md`
- migración inicial TypeORM
- entidades por módulo NestJS
