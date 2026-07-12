# Roadmap asistente AurelIA para ejecución de hallazgos

## Contexto

El flujo manual de ejecución de observaciones ya está integrado desde el modal de Gestión de inspecciones. El siguiente frente es el camino paralelo que se abre desde `Ejecutar observación` al seleccionar `Iniciar con asistente`.

La referencia funcional y visual inicial viene del prototipo HTML `Ejecución de hallazgos.html`. Ese prototipo define una experiencia conversacional en tres pasos:

1. Detalles del hallazgo.
2. Tu respuesta.
3. Resumen y confirmación.

## Decisiones de implementación

- No se implementa IA real en frontend.
- El equipo paralelo de IA reemplazará el mock actual por un servicio real.
- El frontend deja un servicio formal de sugerencias que hoy consume un JSON mockeado desde `public/mock/finding-assistant-execution-suggestions.json`.
- La persistencia de ejecución reutiliza la misma acción real del flujo manual: carga de evidencia posterior, descripción de acción tomada y mutación de ejecución de hallazgo.
- No se toca backend para esta iteración.

## Componentes creados

- `apps/web/src/modules/inspections/components/FindingAssistantExecutionView.tsx`
  - Renderiza la experiencia conversacional para ejecutar una observación.
  - Consume datos reales del `InspectionDetailFindingItemResponse`.
  - Reutiliza iconografía del chatbot existente de creación de inspección.
  - Usa el mismo contrato de submit del formulario manual.

- `apps/web/src/shared/services/findingAssistantExecution.service.ts`
  - Expone `suggestFindingExecutionAction`.
  - Carga sugerencias desde JSON mockeado.
  - Interpola contexto real del hallazgo.

- `apps/web/public/mock/finding-assistant-execution-suggestions.json`
  - Define reglas de respuesta por criticidad.
  - Será reemplazable por el servicio real de IA.

## Integración actual

`FindingExecutionModeView` ahora abre `FindingAssistantExecutionView` al presionar `Iniciar con asistente`.

El flujo manual queda intacto:

- `Usar formulario manual` abre `FindingManualExecutionView`.
- `Ejecutar observación rechazada` sigue entrando directo al flujo manual.

## Flujo implementado

### Paso 1: Detalles del hallazgo

- Saludo inicial de AurelIA.
- Card del hallazgo con observación, criticidad, condición detectada y medida solicitada.
- Card SLA con fecha límite y días vigentes.
- Opciones rápidas:
  - `Sí, iniciar respuesta`.
  - `Tengo una consulta`.

### Paso 2: Tu respuesta

- Solicita foto posterior.
- Permite tomar foto o cargar desde galería.
- Al adjuntar evidencia, llama al servicio mock de sugerencia IA.
- Muestra card `Acción sugerida por AurelIA`.
- Permite aceptar o editar la descripción.
- Habilita `Continuar al resumen` cuando existe foto y descripción.

### Paso 3: Resumen

- Muestra evidencia antes/después.
- Muestra ejecutor, empresa, fecha/hora, criticidad y descripción final.
- Permite confirmar ejecución.

### Pantalla final

- Muestra confirmación visual de observación ejecutada.
- Informa que Admin GF HSE recibirá la alerta de revisión.
- Permite volver a Mis hallazgos.

## Próximos pasos sugeridos

1. Validar fidelidad visual contra el HTML en desktop modal.
2. Conectar el servicio mock al endpoint real de IA cuando el otro equipo entregue contrato.
3. Agregar soporte de historial real de sugerencias IA si el backend expone auditoría.
4. Ajustar textos finales según criterio de producto.
5. Validar comportamiento offline/local si se decide persistir borradores de ejecución asistida.
