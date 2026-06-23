# DEVELOPMENT_WORKFLOW

## Estado del proyecto (importante)

> **Desarrollo funcional en pausa intencional.** El modelo relacional, las entidades definitivas y las reglas de negocio **aún no están definidos**.
>
> - **No** crear entidades definitivas ni migraciones de dominio todavía.
> - Las entidades en `apps/api/src/modules/*/entities` son **placeholders marcados** (banner en cada archivo). No representan el esquema final.
> - Los módulos `inspections` e `incidents` son **referencias vivas** del patrón contracts↔DTO, no funcionalidad final.
> - Objetivo actual: dejar una base clara y consistente para que los equipos de API, Web y Mobile construyan sobre criterios comunes.

## Requisitos

- Node.js >= 20
- pnpm >= 9 (`npm install -g pnpm`)
- Docker (para PostgreSQL local)
- Expo Go o emulador (para móviles)

## Setup inicial

```bash
pnpm install
pnpm build:contracts          # compila @aurelia/contracts (requerido antes de dev)
docker compose up -d          # PostgreSQL local
cp apps/api/.env.example apps/api/.env
```

> `@aurelia/contracts` es un dual package (ESM + CJS). Debe compilarse antes de levantar las apps. Durante el desarrollo, mantenerlo en watch: `pnpm --filter @aurelia/contracts dev`.

## Comandos por app

| Acción | Comando |
| --- | --- |
| API (dev) | `pnpm dev:api` → http://localhost:3000/api |
| Web (dev) | `pnpm dev:web` → http://localhost:5173 |
| Mobile inspecciones | `pnpm dev:mobile-inspecciones` |
| Mobile incidentes | `pnpm dev:mobile-incidentes` |
| Contratos (watch) | `pnpm --filter @aurelia/contracts dev` |

## Comandos globales (Turborepo)

| Acción | Comando |
| --- | --- |
| Build de todo | `pnpm build` |
| Lint de todo | `pnpm lint` |
| Test de todo | `pnpm test` |
| Solo contratos | `pnpm build:contracts` |
| Levantar todo en paralelo | `pnpm dev` |
| Formatear | `pnpm format` |

## Estructura del monorepo

```txt
/apps        api, web, mobile-inspecciones, mobile-incidentes
/packages    contracts (@aurelia/contracts)
/docs        documentación de equipos
```

- Cada app tiene su propio `package.json` y se levanta de forma independiente.
- El `package.json` raíz **solo** coordina workspace, scripts globales y tooling compartido (turbo, eslint, prettier, typescript).

## Convenciones de código

- TypeScript estricto en todo el repo (`tsconfig.base.json`).
- Lint con ESLint + Prettier (config en la raíz).
- Imports de tipos compartidos siempre desde `@aurelia/contracts` (nunca rutas relativas a otra app).
- Reglas de desacople: ver [ARCHITECTURE.md](ARCHITECTURE.md) y [CONTRACTS_GUIDELINES.md](CONTRACTS_GUIDELINES.md).

## CI/CD por app afectada

Turborepo permite construir/probar **solo lo afectado** por un cambio:

```bash
pnpm turbo run build --filter='...[origin/main]'
pnpm turbo run lint test --filter='...[origin/main]'
```

- Un cambio en `@aurelia/contracts` marca como afectados a **todos** sus consumidores (api, web, móviles).
- Cada app puede desplegarse de forma independiente según los paquetes modificados.

## Flujo de trabajo sugerido

1. Crear rama por feature/fix.
2. Si tocas contratos: edita `@aurelia/contracts`, rebuild, y ajusta consumidores (DTOs que `implements`, services tipados).
3. `pnpm lint` y `pnpm build` antes de abrir PR.
4. PR revisado; CI corre solo lo afectado.

## Próximos pasos (cuando se reactive lo funcional)

1. Definir modelo relacional y reglas de negocio.
2. Reemplazar entidades placeholder por el modelo definitivo.
3. Primeras migraciones reales.
4. Auth (primero sin JWT real, luego JWT).
5. Construcción de módulos web/mobile sobre los criterios de `/docs`.
