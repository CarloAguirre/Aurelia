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
findingObservations
```

Y acciones:

```txt
setFindingType(id, label)
addFindingObservation()
updateFindingObservation(id, patch)
removeFindingObservation(id)
```

Esto permite que la vista de observaciones de hallazgo registre el tipo de hallazgo y el borrador de observación libre.

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

El diseño replica el contenido interior de Figma, dejando header, stepper y footer con los componentes existentes del flujo manual.

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

### 7. Modal de tipo de hallazgo

Se actualizó:

```txt
apps/mobile-inspecciones/src/modules/inspection/ManualFindingObservationsScreen.tsx
```

El selector de `Tipo de hallazgo` ya no usa el `SelectSheet` genérico. Ahora usa un modal propio equivalente al nodo Figma:

```txt
Overlay oscuro
Panel blanco desde abajo
Bordes superiores redondeados
Header Tipo de hallazgo + X
Lista con filas altas y separadores
```

Opciones implementadas:

```txt
Desviación en emisiones atmosféricas
Desviación en contención de sustancias
Desviación sobre suelo o sitios patrimoniales
Desviación en seguimiento de medidas de vegetación, flora y fauna
Desviación en la gestión o eliminación de residuos
Desviación en el funcionamiento de equipos e infraestructura
Desviación en manejo de recurso hídrico
```

### 8. Formulario de nueva observación

Se implementó el comportamiento pedido:

```txt
1. Seleccionar tipo de hallazgo.
2. Se habilita Agregar observación.
3. Al presionar Agregar observación, se muestra la card NUEVA OBSERVACIÓN 1.
```

La card incluye:

```txt
Condición detectada
Fotografía Antes
Medidas correctivas propuestas
Criticidad de la inspección
Selector de Probabilidad
Selector de Consecuencia
Nivel calculado
SLA calculado
Matriz 5x5
Cancelar
Guardar observación
```

Estado implementado:

```txt
condition text -> findingObservations[].detectedCondition
corrective action text -> findingObservations[].correctiveAction
photo asset -> findingObservations[].evidence
probability -> findingObservations[].probability
consequence -> findingObservations[].consequence
saved -> findingObservations[].saved
```

## Estado actual

La navegación inicial de Hallazgo queda lista:

```txt
manual/type
seleccionar Hallazgo
Continuar
manual/observations
vista de tipo de hallazgo + empty state
presionar selector de tipo de hallazgo
modal de opciones estilo Figma
seleccionar tipo
botón Agregar observación habilitado
presionar Agregar observación
formulario de observación libre
```

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
