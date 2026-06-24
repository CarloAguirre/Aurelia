# Fase 5 - Incidentes MVP

## Objetivo

Implementar el módulo de incidentes ambientales siguiendo el roadmap formal: registro, clasificación por nivel, Flash Report, acciones inmediatas, validación, investigación, planes de acción, cierre, exportación y dashboard.

## División propuesta

### Fase 5A - Modelo de datos y contratos

Alcance:

- Catálogos `incident_types` e `incident_levels`.
- Modelo principal `incidents`.
- Tablas de soporte para personas involucradas, acciones inmediatas, Flash Report, validaciones, investigación, equipo investigador, análisis PEEPO, línea de tiempo, 5 Por Qué, planes de acción, evidencias de acciones, historial de estado y difusión.
- Contratos compartidos en `@aurelia/contracts`.
- Migraciones y seed base.

No incluye API operativa completa.

### Fase 5B - API operativa mínima + Flash Report base

Alcance:

- `GET /api/incidents/types`
- `GET /api/incidents/levels`
- `POST /api/incidents`
- `GET /api/incidents`
- `GET /api/incidents/:id`
- `PATCH /api/incidents/:id`
- `PATCH /api/incidents/:id/status`
- `POST /api/incidents/:id/flash-report`
- `GET /api/incidents/:id/flash-report`

Objetivo:

- Crear y consultar incidentes.
- Exponer catálogos base para formularios.
- Calcular `sla_due_at` según nivel.
- Registrar historial de estado en cambios relevantes.
- Crear o actualizar un Flash Report base asociado 1:1 al incidente.

### Fase 5C - Acciones inmediatas

Alcance:

- `POST /api/incidents/:id/immediate-actions`
- `GET /api/incidents/:id/immediate-actions`
- `PATCH /api/incidents/immediate-actions/:actionId`

### Fase 5D - Validación, investigación y planes de acción

Alcance:

- Validación por Medio Ambiente.
- Investigación ICAM / 5 Por Qué / PEEPO.
- Línea de tiempo.
- Equipo investigador.
- Planes de acción.
- Evidencias de cierre de acciones.
- Cierre de incidente.

### Fase 5E - Dashboard, exportables y estabilización

Alcance:

- Dashboard summary de incidentes.
- Exportable básico de incidente y Flash Report.
- Integración transversal con evidencias, comentarios y auditoría.
- Colección HTTP completa.
- Auditoría de mapeos entidad/BD.

## Reglas principales

- El nivel del incidente define SLA.
- Nivel 0-1: 24 horas.
- Nivel 2: 12 horas.
- Nivel 3: 12 horas.
- Nivel 4: 6 horas.
- Nivel 5: 2 horas.
- Nivel >= 3 activa investigación obligatoria.
- El incidente no puede cerrarse si tiene planes de acción abiertos.
- Las evidencias se vinculan con `evidence_links`, salvo evidencias específicas de planes de acción, que usan `incident_action_evidences`.
- El historial de estado debe registrar cada transición relevante.

## Fuera de Fase 5 inicial

- Mobile offline.
- Notificaciones automáticas.
- Integración real con email.
- Dashboard visual frontend.
- IA de clasificación automática.
