# Manual checklist step - 2026-06-25

## Figma references

- Selector de plantilla: `633:15088`
- Plantilla seleccionada con ítems: `633:15370`

Ambos nodos entregaron `get_design_context`.

## Ruta

```txt
/inspection/manual/observations
```

Archivo Expo Router:

```txt
apps/mobile-inspecciones/app/inspection/manual/observations.tsx
```

Pantalla:

```txt
apps/mobile-inspecciones/src/modules/inspection/ManualChecklistTemplateScreen.tsx
```

## Datos reales usados

El catálogo de plantillas se carga desde el backend:

```txt
GET /api/inspections/templates
```

Servicio mobile:

```txt
apps/mobile-inspecciones/src/shared/services/api/inspection-templates.api.ts
```

Hook TanStack Query:

```txt
apps/mobile-inspecciones/src/modules/inspection/hooks/useInspectionChecklistTemplates.ts
```

Contrato compartido:

```txt
InspectionChecklistTemplateResponse
```

## Cambios implementados

- El texto de `/inspection/manual/type` ya no usa `8 plantillas disponibles` en duro.
- Ahora muestra el conteo real desde `useInspectionChecklistTemplates()`.
- Al seleccionar una plantilla en paso 3 se despliega:
  - progreso `respondidos / total`;
  - placeholder de foto referencial;
  - lista real de ítems de la plantilla;
  - botones `SÍ`, `NO`, `N/A` por ítem.
- Las respuestas quedan temporalmente en Zustand usando `answersByItemId`.
- El botón continuar queda deshabilitado hasta responder todos los ítems.

## Estado local agregado

Archivo:

```txt
apps/mobile-inspecciones/src/modules/inspection/manualInspection.store.ts
```

Campos:

```txt
templateId
templateName
templateCode
templateItemsCount
answersByItemId
```

Acciones:

```txt
setTemplate()
setAnswer()
```

Enum usado desde contracts:

```txt
InspectionAnswerValue
```

Mapeo UI:

```txt
SÍ  -> COMPLIANT
NO  -> NOT_COMPLIANT
N/A -> NOT_APPLICABLE
```

## Evaluación API vs flujo

La API soporta bien la lectura de plantillas, secciones e ítems.

Para guardar respuestas, la API ya tiene un endpoint por inspección. La parte pendiente es que el flujo mobile todavía no crea la inspección antes de responder; por eso las respuestas quedan primero como borrador local y deben sincronizarse cuando se implemente creación/resumen.

## Pendientes

1. Confirmar que los seeds tengan todas las plantillas esperadas por Gold Fields.
2. Implementar captura real de foto referencial.
3. Crear/sincronizar inspección antes de persistir respuestas.
4. Crear paso 4 / resumen.
5. Evaluar arrastre continuo del pin si tap-to-adjust no basta.

## Prueba local

```powershell
cd C:\Users\carlo\Desktop\aurelia\Aurelia
git pull origin main
pnpm install
pnpm --filter api start:dev
```

En otro terminal:

```powershell
cd C:\Users\carlo\Desktop\aurelia\Aurelia\apps\mobile-inspecciones
pnpm web -- --clear
```

Validar:

1. Paso 2 muestra conteo real de plantillas.
2. Paso 3 carga plantillas desde API.
3. Al seleccionar plantilla aparecen progreso, foto e ítems.
4. Al responder ítems sube el progreso.
5. Continuar se habilita al responder todo.
