# Validación · InspectionDetailResponse y freeze de Gestión

Fecha CI: 2026-07-23 22:34:31 UTC  
Commit validado: `8166b22e70f1c054eb20ee805f0efcafac76e41c`

## `pnpm --filter @aurelia/contracts build`

✅ Verde

## `pnpm --filter api build`

✅ Verde

## `pnpm --filter api lint`

✅ Verde

## `pnpm --filter web typecheck`

❌ Falló (exit 2)

```text

> web@0.1.0 typecheck /home/runner/work/Aurelia/Aurelia/apps/web
> tsc --noEmit

src/modules/inspections/components/InspectionAreaSectorFilterBridge.tsx(80,37): error TS2532: Object is possibly 'undefined'.
/home/runner/work/Aurelia/Aurelia/apps/web:
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  web@0.1.0 typecheck: `tsc --noEmit`
Exit status 2

```

## `pnpm --filter web lint`

✅ Verde

## `pnpm --filter mobile-inspecciones typecheck`

✅ Verde

## `pnpm --filter mobile-inspecciones lint`

✅ Verde

## `pnpm --filter mobile-inspecciones test:smoke`

✅ Verde

## Resultado global

❌ Existen gates fallidos; revisar evidencia anterior.
