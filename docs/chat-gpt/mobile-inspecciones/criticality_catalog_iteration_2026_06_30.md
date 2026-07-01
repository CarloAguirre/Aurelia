# Criticality catalog iteration - 2026-06-30

## Objetivo

Sacar `Probabilidad` y `Consecuencia` del código del formulario manual de Hallazgo y dejarlas disponibles desde base de datos.

## Backend agregado

Tablas nuevas:

```txt
inspection_risk_probabilities
inspection_risk_consequences
```

Migración:

```txt
apps/api/src/database/migrations/1782890000000-CreateInspectionRiskCatalogs.ts
```

Entidades:

```txt
apps/api/src/modules/inspections/entities/inspection-risk-probability.entity.ts
apps/api/src/modules/inspections/entities/inspection-risk-consequence.entity.ts
```

Controller nuevo:

```txt
apps/api/src/modules/inspections/inspection-criticality-catalog.controller.ts
```

Endpoints:

```txt
GET /api/inspections/finding-catalogs/risk-probabilities
GET /api/inspections/finding-catalogs/risk-consequences
```

Seed actualizado:

```txt
apps/api/src/database/seeds/003-seed-finding-classifications.ts
```

Script:

```bash
pnpm --filter api seed:finding-classifications
```

## Frontend agregado

Servicio mobile:

```txt
apps/mobile-inspecciones/src/shared/services/api/inspection-finding-catalogs.api.ts
```

Funciones:

```txt
fetchInspectionRiskProbabilities()
fetchInspectionRiskConsequences()
```

Helper adicional:

```txt
apps/mobile-inspecciones/src/modules/inspection/catalog-selectors.ts
```

## Pendiente visual

Queda pendiente reemplazar el comportamiento actual de los selects de `Probabilidad` y `Consecuencia`, que hoy ciclan valores por click, por un bottom sheet/lista de opciones como Figma.

También queda pendiente reemplazar la carga directa de galería por un selector previo:

```txt
Tomar foto
Cargar desde galería
```

## Validación backend

```bash
pnpm --filter @aurelia/contracts build
pnpm --filter api migration:run
pnpm --filter api seed:finding-classifications
pnpm --filter api dev
```

Probar:

```bash
curl http://localhost:3000/api/inspections/finding-catalogs/risk-probabilities
curl http://localhost:3000/api/inspections/finding-catalogs/risk-consequences
```
