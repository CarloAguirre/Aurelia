# Assistant offline iteration - 2026-06-26

## Contexto

La ruta `/inspection/start` ofrece dos caminos:

- `Iniciar con asistente` -> `/inspection/chat`
- `Usar formulario manual` -> `/inspection/manual/identification`

El flujo manual ya quedó conectado al patrón offline-first:

```txt
UI -> storage local -> sync_queue -> POST /api/mobile/sync -> broker -> worker pendiente -> DB final pendiente
```

El flujo asistido existía visualmente y se basaba en `docs/references/Levantamiento de inspecciones.html`, pero seguía usando endpoints directos y no la cola offline.

## Diagnóstico funcional

Archivo principal:

```txt
apps/mobile-inspecciones/src/modules/inspection/InspectionChatScreen.tsx
```

Store actual:

```txt
apps/mobile-inspecciones/src/modules/inspection/useInspectionFlow.ts
```

El store existe y se mantiene para el modo conversacional porque modela correctamente:

```txt
area
sector
tipo de inspección
observaciones
foto local
medida IA/manual
probabilidad
consecuencia
criticidad
SLA
empresa
personal
resumen
```

No conviene reemplazarlo todavía por el store del flujo manual. La convergencia debe ocurrir en la capa de guardado/sync, no necesariamente en la UI conversacional.

## Brechas encontradas

### 1. Catálogos online directos

El asistente cargaba catálogos desde servicios HTTP directos:

```txt
/organization/areas
/organization/sectors
/organization/companies
/inspections/types
/users
```

Esto bloqueaba el llenado offline.

### 2. Submit online directo

El submit usaba:

```txt
createInspection
createFinding
createEvidence
linkEvidence
```

Esto creaba registros directamente contra endpoints tradicionales, saltándose `sync_queue`.

### 3. Evidencias no resueltas para offline native

La captura de foto todavía intenta `uploadFile` cuando el usuario adjunta imagen. Para offline real, debe persistir binario local en FileSystem y encolar metadata/binario después.

### 4. Fidelidad visual pendiente

El flujo usa componentes equivalentes al HTML:

```txt
ChatHeader
BotBubble
UserBubble
TypingIndicator
ChipRow
QuickOpts
AiProposalCard
PhotoStepWidget
PersonnelPicker
SubmitWidget
ChatInput
```

Pero aún falta una pasada de fidelidad 100% contra `docs/references/Levantamiento de inspecciones.html`.

## Cambios aplicados en esta iteración

### Catálogos local-first

Se migraron servicios compartidos del mobile para leer desde `mobile-bootstrap` local-first:

```txt
apps/mobile-inspecciones/src/shared/services/api/organization.api.ts
apps/mobile-inspecciones/src/shared/services/api/inspection-types.api.ts
apps/mobile-inspecciones/src/shared/services/api/users.api.ts
```

El origen real sigue siendo la API/BD mediante:

```txt
GET /api/mobile/bootstrap
```

Pero si la API no está disponible, se usa cache local.

### Submit asistido encolado

Se cambió el servicio usado por el asistente:

```txt
apps/mobile-inspecciones/src/shared/services/api/inspections-submit.api.ts
```

Ahora `createInspection` y `createFinding` generan operaciones en:

```txt
sync_queue:v1
```

y crean/actualizan el registro local en:

```txt
local_inspections:v1
```

El auto-sync del dashboard se encarga de llamar luego:

```txt
POST /api/mobile/sync
```

### Conteo local de hallazgos

Se agregó soporte para incrementar contadores locales de hallazgos:

```txt
apps/mobile-inspecciones/src/shared/offline/local-inspections.ts
```

## Estado esperado después de esta iteración

### Online

1. Entrar a `/inspection/start`.
2. Elegir `Iniciar con asistente`.
3. Cargar áreas, sectores, tipos, empresas y usuarios desde bootstrap/API.
4. Completar conversación.
5. Enviar inspección.
6. Crear `local_inspections` y `sync_queue`.
7. Intentar `POST /api/mobile/sync` por auto-sync/background.

### Offline con bootstrap previo

1. Entrar a `/inspection/chat` sin API.
2. Cargar catálogos desde cache local.
3. Completar conversación sin depender de `/organization/*` ni `/inspections/types`.
4. Enviar inspección.
5. Guardar local + cola.
6. Al volver al dashboard con API viva, auto-sync debe enviar batch.

### Offline sin bootstrap

Debe mostrar error claro de catálogos:

```txt
Debe sincronizar catálogos antes de operar offline
```

## Pendientes secuenciales

### Iteración siguiente 1: validar flujo asistido completo

- Probar `/inspection/chat` online.
- Probar `/inspection/chat` offline con bootstrap previo.
- Revisar que no existan imports directos a endpoints en el chat para catálogos.
- Confirmar que `sync_queue:v1` contiene `CREATE_INSPECTION` y `CREATE_INSPECTION_FINDING`.

### Iteración siguiente 2: mejorar submit asistido

- Crear hook explícito `useSaveAssistantInspectionOffline`.
- Mover la lógica de `inspections-submit.api.ts` a un hook/service offline dedicado.
- Usar usuario real como `createdBy`, no `local-user`.
- Enviar `bootstrapVersion` usada.

### Iteración siguiente 3: evidencias offline

- Evitar `uploadFile` directo en `PhotoStepWidget` cuando no hay red.
- Persistir `fotoUri` como evidencia local.
- Encolar `UPLOAD_ATTACHMENT`.
- En native usar FileSystem para binarios.

### Iteración siguiente 4: SQLite native

- Crear driver SQLite para native.
- Mantener localStorage solo en web/dev.
- Migrar catálogos, inspecciones locales y cola.

### Iteración siguiente 5: fidelidad visual 100%

Comparar contra `docs/references/Levantamiento de inspecciones.html`:

- header y status bar
- progress bar
- burbujas bot/usuario
- chips
- quick options
- propuesta IA
- foto card
- criticidad/SLA
- submit widget
- input inferior

Ajustar tokens, spacing, radius, sombras y estados resueltos/deshabilitados.

## Notas importantes

- El worker final sigue pendiente; `POST /api/mobile/sync` acepta batches y los deja en `PROCESSING`.
- La DB final todavía no se materializa desde la cola.
- El Service Bus real sigue pendiente para producción.
- El almacenamiento dev sigue en localStorage; SQLite es una iteración posterior para native.
