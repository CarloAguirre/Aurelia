# MOBILE_OFFLINE_STRATEGY

Estrategia offline-first para las apps móviles (`mobile-inspecciones`, `mobile-incidentes`). React Native + Expo + TypeScript.

> **Estado:** arquitectura inicial versionada. Existen contratos base y un puerto de mensajería API para preparar el flujo offline + sincronización. La persistencia local completa y el worker de sincronización siguen pendientes.

## Objetivo

Permitir el **registro en terreno sin conexión** y sincronizar con la API cuando haya red, sin pérdida de datos y con manejo explícito de conflictos.

## Alcance

Aplica solo a:

- `apps/mobile-inspecciones`
- `apps/mobile-incidentes`

No aplica a la web como flujo offline-first. La web puede seguir usando TanStack Query y API directa.

## Documentos relacionados

- [mobile-offline-service-bus-architecture.md](mobile-offline-service-bus-architecture.md)
- [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md)
- [CONTRACTS_GUIDELINES.md](CONTRACTS_GUIDELINES.md)

## Capas previstas

```txt
apps/mobile-*/src/shared
  /storage   Almacenamiento local persistente
  /sync      Cola de sincronización + estados de sync
  /services  Acceso HTTP
```

### 1. Storage local

- Persistencia en el dispositivo.
- Candidatos:
  - secure storage para sesión offline y device session.
  - SQLite/MMKV para formularios, catálogos, cola y auditoría.
  - filesystem local para evidencias grandes.
- La interfaz base existe en `apps/mobile-inspecciones/src/shared/storage/local-storage.ts`.

### 2. Cola de sincronización

Cada registro creado offline entra en una cola con estado explícito. La cola actual es placeholder; debe evolucionar a persistencia real.

Estados contractuales nuevos:

```txt
LOCAL_DRAFT
PENDING
PROCESSING
SYNCED
ERROR
CONFLICT
CANCELLED
```

Operaciones contractuales nuevas:

```txt
CREATE_INSPECTION
UPSERT_INSPECTION_ANSWER
CREATE_INSPECTION_FINDING
CLOSE_INSPECTION
CREATE_INCIDENT
UPLOAD_ATTACHMENT
```

### 3. Proceso de sincronización

Flujo objetivo:

1. Detectar conectividad.
2. Tomar items `PENDING` y `ERROR` elegibles para reintento.
3. Construir `MobileSyncBatchRequest`.
4. Enviar `POST /api/mobile/sync`.
5. La API valida usuario, permisos, device session, offline grant y versión de catálogo.
6. La API publica el batch a un broker mediante `MobileSyncMessageBroker`.
7. En producción el broker será Service Bus.
8. En dev se valida con in-memory broker o database outbox.
9. El worker procesa y responde resultados por batch.
10. La app marca `SYNCED`, `ERROR` o `CONFLICT`.

### 4. Service Bus en producción

Topología objetivo:

```txt
topic: aurelia.mobile.sync
  subscription: mobile-inspecciones
  subscription: mobile-incidentes
```

La API no debe acoplar el dominio a Azure. Debe usar un puerto:

```txt
MobileSyncMessageBroker
```

Implementaciones previstas:

```txt
InMemoryMobileSyncBroker
DatabaseOutboxMobileSyncBroker
AzureServiceBusMobileSyncBroker
```

### 5. Validación en dev

Niveles recomendados:

1. `in-memory`: rápido para TDD/manual local.
2. `database-outbox`: permite replay y revisión de batches en Postgres.
3. `service-bus`: integración con emulator o namespace cloud de desarrollo.

### 6. Resolución de conflictos

A definir por entidad. Base recomendada:

- Inspecciones nuevas: idempotencia por `localId` + `idempotencyKey`.
- Evidencias: append-only.
- Catálogos cambiados: bloquear sync con `CONFLICT` si `bootstrapVersion` está obsoleta.
- Cambios de permisos: la API revalida permisos actuales antes de aceptar.

## Evidencias en terreno

- Foto: captura con `expo-image-picker`; guardar metadata y archivo local.
- GPS: `expo-location`; el tipo `GeoLocation` vive en `@aurelia/contracts`.
- Formularios: validación local con contratos/schemas compartidos.
- Evidencias deben sincronizarse como operaciones o assets asociados al batch.

## Relación con estado

- **Server state:** TanStack Query.
- **UI/client state:** Zustand.
- **Offline durable state:** storage/sync propio, no TanStack cache ni Zustand puro.

La cola offline no se mezcla con el cache de server state.

## Pendientes de implementación

- [ ] Implementar storage local real en móviles.
- [ ] Crear módulo `mobile-auth` en API.
- [ ] Crear módulo `mobile-bootstrap` en API.
- [ ] Crear módulo `mobile-sync` en API.
- [ ] Crear tablas de device sessions/offline grants.
- [ ] Crear tablas outbox/sync batch/sync operation.
- [ ] Implementar worker de sync.
- [ ] Implementar adaptador Service Bus.
- [ ] Migrar `Guardar inspección` para que encole primero y sincronice después.
- [ ] Definir subida binaria de evidencias.
