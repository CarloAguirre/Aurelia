# Assistant visual fidelity - 2026-06-26

## Foco de esta iteración

Alinear el paso de criticidad y SLA del flujo asistido con el prototipo HTML:

```txt
docs/references/Levantamiento de inspecciones.html
```

## Problema detectado

La implementación anterior mostraba:

```txt
bot bubble probabilidad
chips sueltos
user bubble con probabilidad
bot bubble consecuencia
chips sueltos
user bubble con consecuencia
bot bubble criticidad/SLA
```

El prototipo usa una tarjeta integrada:

```txt
PROBABILIDAD
chips 1 a 5
CONSECUENCIA
chips 1 a 5
resumen amarillo con NIVEL y SLA sugerido
```

Luego muestra una segunda tarjeta para confirmar o ajustar SLA:

```txt
SLA · DÍAS HÁBILES PARA RESOLVER
chips 1, 3, 7, 14 días
valor personalizado
guardar observación
```

## Cambios aplicados

Se agregaron componentes:

```txt
apps/mobile-inspecciones/src/shared/components/chat/CriticalityWidget.tsx
apps/mobile-inspecciones/src/shared/components/chat/SlaConfirmWidget.tsx
```

Se actualizó:

```txt
apps/mobile-inspecciones/src/modules/inspection/InspectionAssistantChatScreen.tsx
```

Ahora el flujo:

```txt
1. pregunta criticidad
2. muestra tarjeta integrada de probabilidad/consecuencia
3. calcula nivel y SLA sugerido dentro de la tarjeta
4. muestra tarjeta de confirmación SLA
5. guarda observación
6. pregunta si hay más observaciones
```

## Persistencia

No se cambió el mecanismo de guardado final.

El submit sigue usando:

```txt
useSaveAssistantInspectionOffline
```

Por lo tanto el flujo conserva:

```txt
local_inspections:v1
sync_queue:v1
CREATE_INSPECTION
CREATE_INSPECTION_FINDING
UPLOAD_ATTACHMENT cuando aplica
POST /api/mobile/sync
```

## Pendiente visual siguiente

Seguir comparando contra el HTML en:

```txt
header/progress
AI proposal card
photo widget
empresa/persona
submit summary
espaciados/sombras/tamaños
```
