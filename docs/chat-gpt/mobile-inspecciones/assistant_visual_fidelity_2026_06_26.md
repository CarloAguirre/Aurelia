# Assistant visual fidelity - 2026-06-26

## Foco de esta iteración

Alinear el paso de criticidad y SLA del flujo asistido con el prototipo HTML:

```txt
docs/references/Levantamiento de inspecciones.html
```

## Extracción desde HTML

Se usaron directamente las clases del HTML de referencia:

```txt
.crit-sec
.crit-shdr
.crit-sbdy
.crit-chips
.cc
.cc.sel
.cc.dis
.nivel-box
.sla-sec
.sla-lbl
.sla-qs
.sla-q
.sla-q.sel
.sla-row
.sla-inp
.qopt.tok
```

Referencias visuales importantes:

```txt
.crit-shdr -> background surface, padding 7px 12px, uppercase, border-bottom
.crit-sbdy -> padding 10px 12px
.cc -> background surface, border 1.5px, radius 8, font-size 10
.cc.sel -> warn-surf, border #E8C86A, warn-txt
.nivel-box -> margin-top 8, padding 10px 12px, radius 8
.sla-sec -> radius 10, padding 10px 12px
.sla-q -> background surface, radius 6, padding 5px 10px
.sla-q.sel -> gold
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
3. muestra consecuencia solo después de elegir probabilidad
4. deshabilita opciones no seleccionadas como en el HTML
5. calcula nivel y SLA sugerido dentro de la tarjeta
6. muestra tarjeta de confirmación SLA
7. muestra botón teal separado para guardar observación
8. pregunta si hay más observaciones
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
