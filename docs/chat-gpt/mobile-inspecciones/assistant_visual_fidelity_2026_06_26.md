# Assistant visual fidelity - 2026-06-26

## Foco de esta iteración

Alinear pasos del flujo asistido con el prototipo HTML:

```txt
docs/references/Levantamiento de inspecciones.html
```

## Extracción desde HTML

Se usaron directamente clases del HTML de referencia para criticidad, SLA, empresa sugerida, personal, resumen y pantalla de éxito:

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
.prop
.phdr
.pbdy
.plb
.ptx
.pmt
.pac
.bed
.bok
.pers-list
.pi
.pi.sel
.pia-tag
.pck
.res-card
.res-hdr
.res-row
.rk
.rv
.badge
.done-screen
.done-circle
```

## Criticidad y SLA

El flujo ahora usa:

```txt
apps/mobile-inspecciones/src/shared/components/chat/CriticalityWidget.tsx
apps/mobile-inspecciones/src/shared/components/chat/SlaConfirmWidget.tsx
```

Comportamiento:

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

## Empresa sugerida

Se agregó:

```txt
apps/mobile-inspecciones/src/shared/components/chat/CompanySuggestionCard.tsx
```

Comportamiento alineado con el HTML:

```txt
1. Al continuar con empresa, AurelIA consulta/simula sugerencia.
2. Muestra bubble: Basándome en el historial de área · sector, te propongo.
3. Muestra card Empresa sugerida por AurelIA.
4. Permite Confirmar empresa sugerida.
5. Permite Elegir otra.
6. Solo si se elige otra, muestra chips de empresas.
7. Al confirmar, continúa a selección de personal.
```

El selector de chips de empresa ya no aparece inmediatamente después de guardar observación.

## Resumen antes de guardar

Se actualizó:

```txt
apps/mobile-inspecciones/src/shared/components/chat/SubmitWidget.tsx
apps/mobile-inspecciones/src/modules/inspection/InspectionAssistantChatScreen.tsx
```

Después de seleccionar personal ahora ocurre:

```txt
1. bubble: ✓ Personal: nombres seleccionados
2. bubble: ¡Listo! Revisa el resumen antes de guardar:
3. card Datos generales
4. card Observaciones
5. pregunta ¿Todo correcto?
6. botón Modificar algo
7. botón Guardar inspección
```

## Pantalla final

Se actualizó:

```txt
apps/mobile-inspecciones/app/inspection/success.tsx
```

La pantalla final ahora recibe datos del flujo:

```txt
areaName
sectorName
companyName
personnelNames
criticalCount
findingsCount
evidencesCount
```

Y muestra:

```txt
header completado
círculo verde
¡Inspección guardada!
mensaje con observaciones + área/sector
card EECC notificada
cards de métricas
acciones Misma área / Nueva insp.
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
personal sugerido
header/progress
AI proposal card
photo widget
espaciados/sombras/tamaños
```
