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

mostrando la vista de observaciones de hallazgo basada en el nodo Figma:

```txt
Medio Ambiente Core · node 1330:1641
```

## Cambios aplicados

### 1. Tipo de inspección

Se actualizó:

```txt
apps/mobile-inspecciones/src/modules/inspection/ManualInspectionTypeScreen.tsx
```

Antes `Continuar` solo se habilitaba para `Checklist normativo`.

Ahora `Continuar` se habilita cuando existe `draft.inspectionType`, por lo que `Hallazgo` también puede avanzar a observaciones.

### 2. Estado del draft

Se actualizó:

```txt
apps/mobile-inspecciones/src/modules/inspection/manualInspection.store.ts
```

Se agregaron campos:

```txt
findingTypeId
findingTypeLabel
```

Y acción:

```txt
setFindingType(id, label)
```

Esto permite que la vista de observaciones de hallazgo registre el tipo de hallazgo seleccionado.

### 3. Picker de tipo de hallazgo

Se actualizó:

```txt
apps/mobile-inspecciones/src/modules/inspection/manualInspectionFlow.store.ts
```

Se agregó el picker:

```txt
findingType
```

### 4. Vista nueva de observaciones de hallazgo

Se creó:

```txt
apps/mobile-inspecciones/src/modules/inspection/ManualFindingObservationsScreen.tsx
```

Incluye:

```txt
Título: Tipo de hallazgo
Texto: Seleccione el tipo de hallazgo antes de continuar con las observaciones para esta inspección.
Select: Seleccione
Título: Observaciones
Texto: Registra cada condición detectada en esta visita · una a una
Card azul: Sin observaciones aún
Botón dashed: Agregar observación
```

El diseño replica el contenido interior del nodo Figma, dejando header, stepper y footer con los componentes existentes del flujo manual.

### 5. Router de observaciones

Se creó:

```txt
apps/mobile-inspecciones/src/modules/inspection/ManualObservationsRouter.tsx
```

Este decide qué pantalla renderizar:

```txt
InspectionType.ENVIRONMENTAL -> ManualFindingObservationsScreen
InspectionType.REGULATORY -> ManualChecklistTemplateScreen
```

### 6. Ruta Expo

Se actualizó:

```txt
apps/mobile-inspecciones/app/inspection/manual/observations.tsx
```

Ahora exporta `ManualObservationsRouter`.

## Estado actual

La navegación inicial de Hallazgo queda lista:

```txt
manual/type
seleccionar Hallazgo
Continuar
manual/observations
vista de tipo de hallazgo + empty state
```

## Pendiente siguiente

La pantalla de Hallazgo todavía no permite crear observaciones reales.

Siguiente iteración recomendada:

```txt
1. Habilitar Agregar observación cuando exista findingTypeId.
2. Crear card/form de observación libre.
3. Reutilizar o crear hook de guardado para Hallazgo.
4. Generar CREATE_INSPECTION + CREATE_INSPECTION_FINDING.
5. Conectar resumen y success.
```
