# Manual checklist template step - 2026-06-25

## Figma reference

```txt
https://www.figma.com/design/DymqBWIjfxvuU6UK9wNI3p/Medio-Ambiente-Core?node-id=633-15088&m=dev
```

Nodo:

```txt
633:15088
```

`get_design_context` funcionó para este nodo y entregó el body de la vista:

- título `Checklist normativo`, 18px;
- subtítulo, 12px;
- card blanca con borde `#e3e3e3`, radio 12px;
- label `Seleccione la plantilla *`, 13px;
- selector `#f6faff`, borde `#d1d1d1`, radio 10px;
- metadata inferior con código e ítems en 11px.

## Ruta creada

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

## Catálogo de plantillas

Se confirmó que las plantillas no son un mock aislado del Figma. El backend ya tiene endpoint real:

```txt
GET /api/inspections/templates
```

Y contrato compartido:

```txt
InspectionChecklistTemplateResponse
```

Importado desde:

```txt
@aurelia/contracts
```

Servicio mobile:

```txt
apps/mobile-inspecciones/src/shared/services/api/inspection-templates.api.ts
```

Hook TanStack Query:

```txt
apps/mobile-inspecciones/src/modules/inspection/hooks/useInspectionChecklistTemplates.ts
```

## Qué son estas plantillas

Desde documentación funcional y de base de datos, los checklists específicos corresponden a formularios normativos ambientales reutilizables. Las fuentes mencionan:

- Almacenamiento SUSPEL General y Bodegas.
- Cianuro.
- Mercurio.
- Equipos Nucleares.
- RESPEL.
- PTAS.

La documentación indica que estos deben modelarse como catálogos/tablas administrables, no enums rígidos.

## Cambios de estado

Se extendió:

```txt
apps/mobile-inspecciones/src/modules/inspection/manualInspection.store.ts
```

Nuevos campos:

```txt
templateId
templateName
templateCode
templateItemsCount
```

Nueva acción:

```txt
setTemplate()
```

Se extendió:

```txt
apps/mobile-inspecciones/src/modules/inspection/manualInspectionFlow.store.ts
```

El picker activo ahora acepta:

```txt
template
```

## Fixes relacionados

### Mapa NaN

Se corrigió el cálculo de coordenadas para evitar `NaN` cuando React Native Web no entrega `locationX/locationY`.

Archivos:

```txt
apps/mobile-inspecciones/src/shared/utils/geo.utils.ts
apps/mobile-inspecciones/src/shared/components/form/ManualFormUi.tsx
```

Ahora:

- valida lat/lon finitos;
- valida dimensiones del mapa;
- ignora taps sin coordenada local válida;
- no construye tile URL si lat/lon no son válidos.

### Selector de fecha

El selector ahora muestra:

- hoy;
- ayer;
- días previos.

Antes mostraba días futuros, lo que no calzaba con una inspección que ocurre u ocurrió.

## Pendientes

1. Validar si los seeds actuales del backend contienen las plantillas completas esperadas por Gold Fields.
2. Definir códigos oficiales: ejemplo Figma `FR-00007`.
3. Crear pantalla siguiente para responder ítems del checklist.
4. Decidir si el paso 3 debe listar primero plantilla y después ítems, o si al seleccionar plantilla debe expandirse automáticamente.
5. Evaluar arrastre continuo del pin si tap-to-adjust no es suficiente.

## Comandos de prueba

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

1. En `/inspection/manual/identification`, capturar ubicación y tocar el mapa; no debe aparecer `NaN`.
2. Tocar fecha; debe mostrar hoy y días anteriores.
3. Completar paso 1 y continuar.
4. En paso 2, elegir `Checklist normativo`.
5. Continuar a `/inspection/manual/observations`.
6. Confirmar loading/success/error/empty del selector de plantilla.
7. Seleccionar una plantilla; debe habilitarse `Continuar`.
