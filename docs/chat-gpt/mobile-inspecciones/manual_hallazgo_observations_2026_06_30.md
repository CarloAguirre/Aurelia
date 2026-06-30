# Manual hallazgo observations - 2026-06-30

## Objetivo

Permitir que el flujo manual seleccione `Hallazgo` en:

```txt
/inspection/manual/type
```

y continúe hacia:

```txt
/inspection/manual/observations
```

mostrando la vista de observaciones de hallazgo basada en Figma.

## Catálogo desde base de datos

Se agregó persistencia para los datos del Excel `Clasificación Hallazgos.xlsx`.

La hoja `Criterios` contenía:

```txt
Gravedades: Menor, Moderado, Grave
Tipos de hallazgo: 7 desviaciones ambientales
```

Se crearon tablas:

```txt
inspection_finding_types
inspection_finding_severities
```

Se crearon entidades:

```txt
apps/api/src/modules/inspections/entities/inspection-finding-type.entity.ts
apps/api/src/modules/inspections/entities/inspection-finding-severity.entity.ts
```

Se creó migración:

```txt
apps/api/src/database/migrations/1782880000000-CreateInspectionFindingClassifications.ts
```

Se creó seed:

```txt
apps/api/src/database/seeds/003-seed-finding-classifications.ts
```

Script:

```bash
pnpm --filter api seed:finding-classifications
```

## Endpoints

Se creó:

```txt
apps/api/src/modules/inspections/inspection-finding-catalog.controller.ts
apps/api/src/modules/inspections/inspection-finding-catalog.service.ts
```

Endpoints:

```txt
GET /api/inspections/finding-catalogs
GET /api/inspections/finding-catalogs/types
GET /api/inspections/finding-catalogs/severities
```

## Bootstrap mobile

El bootstrap offline ahora incluye:

```txt
catalogs.findingTypes
catalogs.findingSeverities
```

Esto permite que el selector mobile trabaje local-first y consuma base de datos cuando hay conexión.

## Frontend mobile

Se creó:

```txt
apps/mobile-inspecciones/src/shared/services/api/inspection-finding-catalogs.api.ts
```

La pantalla:

```txt
apps/mobile-inspecciones/src/modules/inspection/ManualFindingObservationsScreen.tsx
```

ya no usa opciones hardcodeadas para `Tipo de hallazgo`. Ahora carga:

```txt
fetchInspectionFindingTypesLocalFirst()
```

El selector guarda en el draft:

```txt
findingTypeId = id real de base de datos
findingTypeLabel = nombre visible del tipo
```

## Flujo visual implementado

```txt
manual/type
seleccionar Hallazgo
Continuar
manual/observations
presionar Tipo de hallazgo
modal con opciones desde base de datos/bootstrap
seleccionar tipo
Agregar observación habilitado
presionar Agregar observación
formulario de observación libre
```

## Validación recomendada

```bash
pnpm --filter api migration:run
pnpm --filter api seed:finding-classifications
pnpm --filter @aurelia/contracts build
pnpm --filter api dev
pnpm web -- --clear
```

Verificar API:

```bash
curl http://localhost:3000/api/inspections/finding-catalogs/types
curl http://localhost:3000/api/inspections/finding-catalogs/severities
curl http://localhost:3000/api/mobile/bootstrap
```

En `/inspection/manual/observations`, el modal de tipo de hallazgo debe listar los 7 tipos desde `catalogs.findingTypes`.

## Pendiente siguiente

La pantalla de Hallazgo todavía no guarda la inspección final ni genera operaciones offline.

Siguiente iteración recomendada:

```txt
1. Conectar Guardar observación con lista/resumen de observaciones guardadas.
2. Habilitar Continuar cuando exista al menos una observación guardada.
3. Crear hook de guardado para Hallazgo.
4. Generar CREATE_INSPECTION + CREATE_INSPECTION_FINDING.
5. Conectar resumen y success.
```
