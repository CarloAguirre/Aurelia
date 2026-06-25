# Design to Code

Este documento se crea como bitacora viva del flujo de diseno a codigo para Aurelia.

## Estado actual

El archivo no existia en `main` al iniciar esta iteracion. El foco actual esta en `apps/mobile-inspecciones`, pantalla `InspectionsHomeFigmaScreen`.

La pantalla ya tenia una base visual proveniente de Figma. En esta iteracion se mantuvo esa direccion visual y se conecto a la arquitectura real del repo.

## Cambios aplicados

- Se creo `apps/mobile-inspecciones/src/modules/inspection/hooks/useInspectionHomeData.ts`.
- Se conecto `InspectionsHomeFigmaScreen` a TanStack Query.
- Se usan los services existentes `fetchInspectionHomeSummary` y `fetchInspections`.
- Se usan contratos desde `@aurelia/contracts`.
- Se agregaron estados de carga, error, vacio y exito.
- Se mantiene `useInspectionFlow` solo para estado local del borrador.

## Endpoints usados

```txt
GET /api/inspections/dashboard/summary
GET /api/inspections
```

## Reglas para continuar

- No llamar `fetch` directo desde pantallas.
- No inventar estilos si ya existe una referencia Figma.
- No redefinir tipos de dominio en mobile o web.
- No acoplar mobile/web a entidades NestJS o TypeORM.
- Contrastar siempre los documentos con el codigo actual.

## Proximos pasos

1. Ejecutar localmente:

```bash
git fetch origin
git checkout design-to-code-home
pnpm install
pnpm build:contracts
pnpm --filter mobile-inspecciones lint
pnpm dev:api
pnpm dev:mobile-inspecciones
```

2. Validar visualmente contra Figma.

3. Si existe un enlace de nodo Figma, mapearlo al componente:

```txt
apps/mobile-inspecciones/src/modules/inspection/InspectionsHomeFigmaScreen.tsx
```

4. Extraer el mapeo visual de `InspectionStatus` a un util compartido.

5. Conectar el boton de filtros cuando el backend soporte filtros mobile.
