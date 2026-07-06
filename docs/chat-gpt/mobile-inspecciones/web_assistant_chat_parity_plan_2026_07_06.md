# Paridad chatbot mobile-inspecciones hacia web

Fecha: 2026-07-06
Modulo destino: `apps/web/src/modules/inspections/new-inspection/steps/AssistantChatStep.tsx`
Modulo referencia: `apps/mobile-inspecciones/src/modules/inspection/InspectionChatScreenV2.tsx`

## Objetivo

Llevar el flujo web de nueva inspeccion con asistente AurelIA a una paridad progresiva con el chatbot actual de `mobile-inspecciones`, evitando que el usuario sea derivado al flujo manual y reduciendo diferencias funcionales, visuales y de copy.

## Criterio rector

El asistente no debe comportarse como un wizard con pantallas. Debe comportarse como una conversacion basada en mensajes, igual que mobile:

- `messages`: historial real de mensajes y widgets.
- `resolvedMessages`: bloqueo de decisiones ya tomadas.
- `waiting`: input textual activo solo cuando el bot espera texto.
- `push()`: agrega mensajes o widgets al historial.
- `markResolved()`: congela widgets ya usados.
- `pushError()`: agrega error contextual con retry.
- `renderMessage()`: renderiza cada unidad del historial segun su tipo.

## Auditoria de brechas detectadas

| Prioridad | Brecha | Estado mobile | Estado web antes de iterar | Accion requerida |
| --- | --- | --- | --- | --- |
| Alta | Motor conversacional | Usa `messages`, `resolvedMessages`, `waiting`, `push`, `markResolved` | Usaba `stage` global y estados locales | Reemplazar por motor de mensajes |
| Alta | Input textual | `ChatInput` inferior habilitado cuando `waiting !== null` | Textareas inline dentro del historial | Implementar input inferior equivalente |
| Alta | Borradores | Persiste draft y estado de chat, permite continuar o reiniciar | Sin reanudacion de chat | Migrar persistencia en iteracion posterior |
| Alta | Checklist question card | Tarjeta con seccion, codigo, indice, guidance y botones SÍ/NO/N/A | Burbuja simple + quick options | Crear componente web equivalente |
| Alta | Foto general y evidencia | `PhotoStepWidget` con recibo, nombre, GPS y hora | Input file basico | Crear widget web equivalente |
| Alta | IA medida correctiva | `suggestCorrectiveMeasure` + `AiProposalCard` | Medida manual directa | Integrar propuesta IA |
| Alta | Criticidad y SLA | Criticidad + `SlaConfirmWidget` antes de guardar observacion | Criticidad guarda directo | Agregar confirmacion SLA |
| Alta | Sugerencia de empresa | `suggestCompany` + `CompanySuggestionCard` | Lista directa de empresas | Agregar sugerencia y confirmacion |
| Media | Personal responsable | `PersonnelPicker` con sugerido | Chips simples | Crear selector equivalente |
| Media | Errores | `ErrorBubble` con retry contextual | Mensajes inline sin retry | Implementar error como mensaje |
| Media | Catalogos | Local-first/bootstrap en mobile | Endpoints directos en web | Revisar fallback y orden |
| Media | Tipo inspeccion | Mobile consulta catalogo y valida id | Web hardcodea opciones | Consultar tipos reales |
| Media | Resumen | Tarjetas separadas por tipo y boton especifico | Resumen generico | Migrar resumen por tipo |
| Media | Guardado y exito | Guarda y navega a success mobile | Guarda y muestra `SavedStep` web | Definir success web equivalente |
| Baja | Componentes visuales | Componentes dedicados del chat | Componentes inline | Extraer componentes web incrementales |
| Baja | Footer | ChatInput inferior | Footer con volver/texto | Reemplazar por input inferior |

## Plan de iteraciones

### Iteracion 1 - Base conversacional

Estado: completada.

Incluye:

- `messages`, `resolvedMessages`, `waiting`, `photoReceiptByMessageId`.
- `push`, `clearTyping`, `markResolved`, `pushError`.
- `renderMessage` por tipo.
- Flujo base dentro del chat para area, sector, tipo, fecha, ubicacion, plantilla/hallazgo, foto, preguntas, responsables y resumen.
- Input inferior habilitado cuando el bot espera texto.

### Iteracion 2 - Widgets visuales de checklist y fotografia

Estado: parcialmente completada en la iteracion base.

- `QuestionCard` web equivalente inicial.
- `PhotoStepWidget` web con recibo de foto, hora y metadata.
- Widgets resueltos congelados con `resolvedMessages`.

Pendiente:

- Paridad visual fina contra los componentes mobile.
- Extraccion a componentes pequeños para reducir el tamaño de `AssistantChatStep.tsx`.

### Iteracion 3 - Rama hallazgo IA

Estado: completada funcionalmente.

- Integrar `suggestCorrectiveMeasure`.
- Crear `AiProposalCard` web.
- Permitir aceptar o editar medida.
- Mantener fallback local si `/ai/suggest` falla.

### Iteracion 4 - Criticidad y SLA

Estado: parcialmente completada en la iteracion base.

- Card de criticidad con descripcion.
- `SlaConfirmWidget` web.
- Guardado de observacion despues de confirmar SLA.

Pendiente:

- Ajuste visual fino contra mobile.

### Iteracion 5 - Empresa y personal

Estado: parcialmente completada.

- Integrado `suggestCompany`.
- Creado `CompanySuggestionCard` web.
- Permite confirmar empresa sugerida o elegir otra.
- Mantiene fallback local si `/ai/suggest` falla.
- `PersonnelPicker` web con usuario sugerido y seleccion multiple ya existe como version inicial.

Pendiente:

- Paridad visual fina de `CompanySuggestionCard` y `PersonnelPicker` contra mobile.
- Mejorar heuristica de matching cuando la IA devuelve texto largo y no solo el nombre de empresa.

### Iteracion 6 - Resumen y guardado

Estado: parcialmente completada.

- Resumen diferenciado inicial.
- Botones `Guardar hallazgo` y `Guardar checklist`.
- Pantalla final enriquecida con resumen de area, sector, fecha, registro, empresa y observaciones.
- Correccion: `Nueva inspeccion` desde guardado limpia el draft antes de volver al inicio.

Pendiente:

- Ajustar detalle visual fino contra success mobile.
- Incorporar numero/id de inspeccion creada si el submit expone ese dato al controller.

### Iteracion 7 - Persistencia y reanudacion

Estado: pendiente.

- Persistir draft y estado del chat.
- Mostrar opcion de continuar borrador o iniciar desde cero.
- Limpiar estado al guardar.

## Validacion por iteracion

Comandos esperados:

```bash
pnpm --filter web typecheck
pnpm --filter web build
```

Criterios minimos:

- El asistente nunca navega al flujo manual.
- Cada decision ya tomada queda congelada.
- El historial mantiene orden cronologico real.
- El input textual solo se habilita cuando corresponde.
- No se introduce `any`.
- No se rompen `NewInspectionModalController`, `useSubmitNewInspection` ni stores existentes.
