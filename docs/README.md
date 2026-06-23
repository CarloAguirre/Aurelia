# Documentación de Aurelia

Base documental y técnica para los equipos de API, Web y Mobile. El objetivo es que cada equipo construya su parte con criterios consistentes, sin acoplarse entre sí, compartiendo contratos a través de `@aurelia/contracts`.

## Índice

| Documento | Para qué sirve |
| --- | --- |
| [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) | Qué es Aurelia, dominio funcional, roles, módulos y motivo del monorepo. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Estructura del monorepo, apps, packages, stack y flujo de datos. |
| [CONTRACTS_GUIDELINES.md](CONTRACTS_GUIDELINES.md) | Cómo se usa y se extiende `@aurelia/contracts` (la fuente de verdad de tipos). |
| [API_GUIDELINES.md](API_GUIDELINES.md) | Convenciones del backend NestJS: módulos, DTOs, validación, migraciones. |
| [FRONTEND_GUIDELINES.md](FRONTEND_GUIDELINES.md) | Convenciones de la web React + Vite. |
| [UI_UX_GUIDELINES.md](UI_UX_GUIDELINES.md) | Principios de diseño, estados de UI, accesibilidad, formularios. |
| [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) | Estrategia de estado: TanStack Query (server) + Zustand (cliente/UI). |
| [MOBILE_OFFLINE_STRATEGY.md](MOBILE_OFFLINE_STRATEGY.md) | Estrategia offline-first futura para las apps móviles. |
| [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md) | Setup, comandos, CI/CD por app afectada y estado actual del proyecto. |

## Estado actual del proyecto

> El desarrollo funcional está **en pausa intencional**. El modelo relacional, las entidades definitivas y las reglas de negocio **aún no están definidos**. Las entidades existentes en `apps/api` son **placeholders marcados** y no deben tratarse como esquema final ni usarse para generar migraciones de dominio. Ver [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md).
