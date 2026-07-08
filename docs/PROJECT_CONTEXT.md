# PROJECT_CONTEXT

## Qué es Aurelia

Aurelia es una **plataforma ambiental centralizada** para la gestión de controles críticos, inspecciones, incidentes, evidencias, flujos de aprobación, reportabilidad, alertas y asistencia con IA.

La plataforma se compone de:

- **Una web central por roles** — operación, supervisión, aprobación, administración y visualización.
- **Dos apps móviles** para registro en terreno: una de **inspecciones** y otra de **incidentes**.
- **Una API central** conectada a una base de datos común.

## Dominio funcional

Conceptos transversales del negocio (compartidos entre apps):

- **MUE** — unidad mayor (mina, planta, depósito, instalación, puerto).
- **Áreas** — subdivisiones operativas dentro de una MUE.
- **Controles críticos** — controles asociados a un área.
- **Inspecciones** — registros de verificación en terreno, con estados y flujo de aprobación.
- **Incidentes** — eventos ambientales con tipo, nivel de riesgo y seguimiento.
- **Evidencias** — fotos, documentos, GPS y formularios asociados a inspecciones/incidentes.
- **Flujos de aprobación** — registrar → revisar → validar → aprobar / devolver.
- **Reportabilidad** — segmentada por área, MUE, estado, responsable y criticidad.

> El modelo de datos definitivo y las reglas de negocio están **pendientes de definición**. Este documento describe el dominio a alto nivel, no el esquema final.

## Roles

Roles iniciales (ver `Role` en `@aurelia/contracts`):

| Rol | Descripción |
| --- | --- |
| `ADMIN` | Administración de usuarios, catálogos y configuración. |
| `SUPERVISOR` | Supervisión y revisión de registros. |
| `INSPECTOR` | Registro de inspecciones/incidentes en terreno. |
| `APPROVER` | Validación y aprobación de registros. |
| `VIEWER` | Solo lectura / reportabilidad. |

La matriz de permisos por rol se definirá junto con las reglas de negocio.

## Módulos

| Módulo | Web | Mobile | API |
| --- | --- | --- | --- |
| Dashboard | ✓ | | |
| Inspecciones | ✓ | ✓ (app inspecciones) | ✓ |
| Incidentes | Parcial / placeholder | Parcial / placeholder (app incidentes) | ✓ |
| Controles críticos | ✓ | | ✓ |
| Evidencias | ✓ | ✓ | ✓ |
| Workflows / aprobaciones | ✓ | | ✓ |
| Reportes | ✓ | | ✓ |
| Administración (usuarios, roles, MUE, áreas) | ✓ | | ✓ |
| Notificaciones / IA | (futuro) | | (futuro) |

Nota de estado actual (2026-07): el desarrollo funcional activo está concentrado en inspecciones (web + mobile-inspecciones). El módulo de incidentes no está en foco funcional de implementación en esta etapa.

## Motivo del monorepo

Web, móviles y API comparten conceptos transversales: MUE, áreas, roles, estados, tipos de inspección/incidente, niveles de riesgo, evidencias, observaciones, flujos de aprobación y **los contratos HTTP** entre frontend, móviles y backend.

El monorepo permite **compartir esos contratos (enums, types, interfaces y request/response) en tiempo de desarrollo/build** mediante `@aurelia/contracts`, evitando duplicar definiciones entre apps.

Regla central: **el frontend y las móviles NO se acoplan a NestJS, TypeORM ni `class-validator`.** Solo consumen tipos agnósticos. Ver [CONTRACTS_GUIDELINES.md](CONTRACTS_GUIDELINES.md).

Aunque cada app se despliega de forma independiente, comparte la misma fuente de verdad de tipos. Detalle técnico en [ARCHITECTURE.md](ARCHITECTURE.md).
