# Roadmap de exportación periódica de inspecciones

Fecha: 2026-07-17
Rama: `feature/inspecciones/carlo`
Módulos: `packages/contracts`, `apps/api`, `apps/web`

## Objetivo

Implementar la exportación autenticada del informe periódico de inspecciones en PDF y Excel desde el modal **Exportar informe de inspecciones**, manteniendo una sola fuente de verdad para datos, reglas de agregación y control de acceso.

## Referencias Figma

- Página 1 — resumen ejecutivo: nodo `842:8548`
- Página 2 — listado representativo: nodo `842:8777`
- Página 3 — atención inmediata y empresas: nodo `842:9231`
- Menú de exportación: nodo `812:9901`
- Modal de exportación: nodo `812:9927`

## Decisiones funcionales

1. El PDF conserva la composición ejecutiva del diseño y muestra hasta 15 inspecciones representativas en la página de listado.
2. El Excel contiene el universo completo del período y estado seleccionados.
3. Los estados de observación del resumen son categorías mutuamente excluyentes:
   - cerradas;
   - SLA vencido;
   - ejecutadas pendientes de aprobación, dentro de plazo;
   - abiertas dentro de plazo.
4. La distribución por área cuenta inspecciones, no observaciones.
5. El alcance por empresa reutiliza `ReportScopeService`; ningún exportador puede ampliar el alcance autorizado del usuario.
6. PDF y Excel consumen el mismo `InspectionPeriodicReportResponse` producido por `InspectionPeriodicReportService`.
7. Las descargas web usan `httpDownload` y Bearer token; no se navega directamente a los endpoints.

## Endpoints objetivo

```text
GET /api/reports/inspections/periodic/data
GET /api/reports/inspections/periodic/pdf
GET /api/reports/inspections/periodic/xlsx
```

Parámetros comunes:

```text
year=<año>
period=year|q1|q2|q3|q4|m1..m12
inspectionState=all|open|closed
companyId=<opcional>
```

## Arquitectura

```text
InspectionExportReportModal
  -> periodic-inspection-reports.service.ts
     -> /reports/inspections/periodic/pdf|xlsx

InspectionPeriodicReportController
  -> InspectionPeriodicReportExportService
     -> InspectionPeriodicReportService
     -> InspectionPeriodicReportPdfService
     -> InspectionPeriodicReportXlsxService

ReportPdfBrandingService
  -> header, títulos, footer, márgenes y numeración comunes
```

## Roadmap de implementación

### Fase 1 — Contratos y datos

- [ ] Corregir distribución por área a inspecciones.
- [ ] Hacer excluyentes las categorías de observaciones.
- [ ] Filtrar en SQL por período, estado cancelado y alcance de empresa.
- [ ] Mantener tipos de respuesta compartidos en `@aurelia/contracts`.

### Fase 2 — Base PDF compartida

- [ ] Crear servicio reutilizable de branding PDF.
- [ ] Conservar el renderer individual sin regresiones.
- [ ] Reutilizar logo, Inter, márgenes de 42 pt laterales / 36 pt verticales y footer seguro.

### Fase 3 — PDF periódico

- [ ] Crear renderer de las tres páginas.
- [ ] Implementar KPI, barras, dona, tablas, chips y alertas con PDFKit.
- [ ] Agregar endpoint autenticado `/pdf`.
- [ ] Limitar la tabla del PDF a 15 filas y mantener totales reales.

### Fase 4 — Excel

- [ ] Generar `.xlsx` sin duplicar reglas de negocio.
- [ ] Hojas: `Resumen`, `Inspecciones`, `Atención inmediata`, `Empresas`.
- [ ] Autofiltro, panel congelado, fechas, porcentajes y estilos.
- [ ] Agregar endpoint autenticado `/xlsx`.

### Fase 5 — Frontend

- [ ] Cambiar botón incorrecto `Rechazar observación` por `Exportar PDF` o `Exportar Excel`.
- [ ] Conectar el modal con los endpoints autenticados.
- [ ] Mostrar spinner y estado `Generando PDF…` / `Generando Excel…`.
- [ ] Mantener el modal abierto en error y cerrarlo después de una descarga exitosa.

### Fase 6 — Validación

- [ ] `pnpm --filter @aurelia/contracts build`
- [ ] `pnpm --filter api lint`
- [ ] `pnpm --filter api build`
- [ ] `pnpm --filter web typecheck`
- [ ] `pnpm --filter web build`
- [ ] Validación visual contra los nodos Figma.
- [ ] Pruebas de año, trimestre, mes, todas, abiertas y cerradas.
- [ ] Pruebas de permisos para Gold Fields y empresas contratistas.

## Riesgos y controles

- No modificar el PDF individual al extraer elementos comunes sin comparar una exportación previa y posterior.
- No contar observaciones vencidas dos veces en el resumen.
- No usar la muestra de 15 filas para calcular KPI o rankings.
- No exponer información de empresas fuera del alcance autorizado.
- No abrir endpoints de descarga en una pestaña sin token.
- El Excel debe abrir sin advertencias de reparación en Excel o LibreOffice.

## Estado de continuidad

Este documento debe actualizarse al cerrar cada fase con commits, archivos modificados, validaciones ejecutadas y deuda pendiente.
