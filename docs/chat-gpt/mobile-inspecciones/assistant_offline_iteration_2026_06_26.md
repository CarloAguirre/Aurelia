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

La captura de foto intentaba `uploadFile` cuando el usuario adjuntaba imagen. Para offline real, debe persistir binario local en FileSystem y encolar metadata/binario después.

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

## Cambios aplicados

### Iteración A: catálogos local-first

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

### Iteración B: submit asistido en hook offline dedicado

Se creó:

```txt
apps/mobile-inspecciones/src/modules/inspection/hooks/useSaveAssistantInspectionOffline.ts
```

Y se integró en:

```txt
apps/mobile-inspecciones/src/modules/inspection/InspectionChatScreen.tsx
```

Ahora el asistente deja de usar el submit directo tradicional en la pantalla de chat. Al enviar, el hook:

```txt
1. construye CREATE_INSPECTION
2. guarda local_inspections:v1
3. construye CREATE_INSPECTION_FINDING por cada observación
4. guarda sync_queue:v1
5. intenta syncPendingOperations si hay red y sesión
6. navega a /inspection/success
```

El `createdBy` usa el usuario autenticado cuando existe; si no hay sesión local, cae a `local-user`.

### Iteración C: foto capturada sin upload directo

En `/inspection/chat`, la captura ahora guarda `fotoUri` local y continúa el flujo sin llamar inmediatamente a `/files/upload`.

La evidencia queda como metadata local asociada al hallazgo. La subida binaria real queda pendiente para FileSystem/SQLite native.

### Iteración D: operación explícita UPLOAD_ATTACHMENT

El contrato ya contiene:

```txt
UPLOAD_ATTACHMENT
```

Se agregó en `useSaveAssistantInspectionOffline` una operación explícita por cada foto adjunta:

```txt
CREATE_INSPECTION
CREATE_INSPECTION_FINDING
UPLOAD_ATTACHMENT
```

La operación `UPLOAD_ATTACHMENT` usa `entityType: evidence`, depende de la inspección y del hallazgo local, y conserva metadata dev:

```txt
inspectionLocalId
findingLocalId
localEvidenceId
sourceUri
remoteFileId
fileName
mimeType
sizeBytes
evidenceType
capturedAt
```

Esto permite validar el flujo offline completo en cola, aunque la subida binaria final queda pendiente para el worker/FileSystem.

### Iteración E: conteo local de hallazgos

Se agregó soporte para incrementar/establecer contadores locales de hallazgos:

```txt
apps/mobile-inspecciones/src/shared/offline/local-inspections.ts
```

### Iteración F: validación backend de operaciones mobile-sync

Se actualizó `apps/api/src/modules/mobile-sync/mobile-sync.service.ts` para reconocer explícitamente operaciones soportadas:

```txt
CREATE_INSPECTION
UPSERT_INSPECTION_ANSWER
CREATE_INSPECTION_FINDING
CLOSE_INSPECTION
CREATE_INCIDENT
UPLOAD_ATTACHMENT
```

Si llega una operación no soportada, el resultado de esa operación vuelve con:

```txt
status: ERROR
errorCode: UNSUPPORTED_OPERATION
```

También se agregó resumen de estado del broker in-memory:

```txt
acceptedBatches
operationCounts
pendingMessages
```

expuesto desde `GET /api/mobile/sync`.

## Estado esperado después de estas iteraciones

### Online

1. Entrar a `/inspection/start`.
2. Elegir `Iniciar con asistente`.
3. Cargar áreas, sectores, tipos, empresas y usuarios desde bootstrap/API.
4. Completar conversación.
5. Enviar inspección.
6. Crear `local_inspections` y `sync_queue`.
7. Si hay foto, `sync_queue` debe incluir `UPLOAD_ATTACHMENT`.
8. Intentar `POST /api/mobile/sync` por auto-sync/background.
9. API debe responder `PROCESSING` para operaciones soportadas.

### Offline con bootstrap previo

1. Entrar a `/inspection/chat` sin API.
2. Cargar catálogos desde cache local.
3. Completar conversación sin depender de `/organization/*` ni `/inspections/types`.
4. Enviar inspección.
5. Guardar local + cola.
6. Si hay foto, encolar `UPLOAD_ATTACHMENT` con metadata local.
7. Al volver al dashboard con API viva, auto-sync debe enviar batch.

### Offline sin bootstrap

Debe mostrar error claro de catálogos:

```txt
Debe sincronizar catálogos antes de operar offline
```

## Validación inmediata recomendada

### Caso online

```txt
1. Limpiar localStorage de local_inspections y sync_queue.
2. Entrar a /inspection/start.
3. Iniciar con asistente.
4. Completar flujo saltando foto o adjuntando foto.
5. Enviar.
6. Confirmar /inspection/success.
7. Confirmar local_inspections:v1.
8. Confirmar sync_queue:v1.
9. Confirmar CREATE_INSPECTION y CREATE_INSPECTION_FINDING.
10. Si hubo foto, confirmar UPLOAD_ATTACHMENT.
11. Confirmar POST /api/mobile/sync si hay API viva.
12. Confirmar GET /api/mobile/sync con operationCounts.
```

### Caso offline

```txt
1. Cargar bootstrap una vez con API viva.
2. Cortar API o red.
3. Entrar a /inspection/chat.
4. Completar flujo.
5. Enviar.
6. Confirmar éxito visual.
7. Confirmar local_inspections:v1 y sync_queue:v1.
8. Levantar API.
9. Volver a /inspection/dashboard.
10. Confirmar POST /api/mobile/sync.
11. Confirmar GET /api/mobile/sync con operationCounts.
```

## Pendientes secuenciales

### Iteración siguiente 1: resolver worker dev de materialización

- Resolver dependencias localId -> remoteId en el backend.
- Materializar `CREATE_INSPECTION` en tablas reales.
- Materializar `CREATE_INSPECTION_FINDING` usando `inspectionLocalId`.
- Dejar `UPLOAD_ATTACHMENT` como metadata pendiente hasta FileSystem/storage.
- Marcar operaciones como `SYNCED` cuando el worker dev las materialice.

### Iteración siguiente 2: evidencias offline completas native

- Persistir binarios en FileSystem en native.
- Agregar hash/checksum y tamaño real.
- En web/dev mantener metadata y sourceUri en localStorage.
- Resolver subida real desde worker/sync.

### Iteración siguiente 3: SQLite native

- Crear driver SQLite para native.
- Mantener localStorage solo en web/dev.
- Migrar catálogos, inspecciones locales y cola.

### Iteración siguiente 4: fidelidad visual 100%

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
