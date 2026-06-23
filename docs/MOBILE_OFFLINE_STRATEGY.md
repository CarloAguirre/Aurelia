# MOBILE_OFFLINE_STRATEGY

Estrategia offline-first para las apps móviles (`mobile-inspecciones`, `mobile-incidentes`). React Native + Expo + TypeScript.

> **Estado: previsión, no implementado.** Hoy existen solo carpetas y placeholders. No se implementa todavía offline-first completo. Este documento define el rumbo para cuando se construya.

## Objetivo

Permitir el **registro en terreno sin conexión** y sincronizar con la API cuando haya red, sin pérdida de datos y con manejo explícito de conflictos.

## Capas previstas

```txt
apps/mobile-*/src/shared
  /storage   Almacenamiento local persistente
  /sync      Cola de sincronización + estados de sync
  /services  Acceso HTTP (ya existe http-client + *.api.ts)
```

### 1. Storage local

- Persistencia en el dispositivo (candidatos: AsyncStorage para datos simples, SQLite/MMKV para volumen/consultas).
- Interfaz prevista en [local-storage.ts](../apps/mobile-inspecciones/src/shared/storage/local-storage.ts) (placeholder).
- Guarda registros creados en terreno (inspecciones/incidentes) y sus evidencias antes de sincronizar.

### 2. Cola de sincronización

- Cada registro creado offline entra en una **cola** con un estado de sincronización.
- `SyncStatus` ya está definido como placeholder ([sync-status.ts](../apps/mobile-inspecciones/src/shared/sync/sync-status.ts)):

```ts
export enum SyncStatus {
  PENDING = 'PENDING',  // creado local, aún no enviado
  SYNCED  = 'SYNCED',   // confirmado por la API
  ERROR   = 'ERROR',    // falló el envío; requiere reintento/resolución
}
```

- Estructura prevista de un item de cola (`SyncQueueItem<TPayload>`): `id`, `payload` (tipado con `@aurelia/contracts`), `status`, `createdAt`, `lastError?`.
- Funciones placeholder de encolado ya existen (`enqueueInspection` / `enqueueIncident`).

### 3. Proceso de sincronización

Flujo objetivo (a implementar):

1. Detectar conectividad.
2. Tomar items `PENDING` (y `ERROR` elegibles para reintento) en orden.
3. Enviar a la API con los request types de `@aurelia/contracts`.
4. Marcar `SYNCED` o `ERROR` según resultado; backoff en reintentos.
5. Reflejar el estado en la UI por registro.

### 4. Resolución de conflictos

A definir junto con las reglas de negocio. Opciones a evaluar:

- **Last-write-wins** por timestamp (simple, riesgo de pérdida).
- **Detección por versión/updatedAt** con resolución manual cuando el servidor cambió.
- **Append-only** para evidencias (no se sobrescriben, se agregan).

La estrategia elegida dependerá de qué entidades pueden editarse desde más de un origen.

## Evidencias en terreno

- **Foto:** captura con `expo-image-picker` (ya declarado en `app.json`); guardar referencia local y subir en la sincronización.
- **GPS:** `expo-location` (ya declarado); el tipo `GeoLocation` vive en `@aurelia/contracts`.
- **Formularios:** validación local con las `schemas` de contracts.
- Las evidencias siguen el mismo ciclo de cola/estado que los registros.

## Relación con el manejo de estado

- **Server state** sigue gestionándose con TanStack Query (funciona en RN); puede combinarse con persistencia de cache.
- **UI/cliente** con Zustand.
- La **cola offline** es una preocupación aparte (storage + sync), no se mezcla con el cache de server state.

Ver [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md).

## Pendiente de definir

- [ ] Motor de persistencia local (AsyncStorage vs SQLite vs MMKV).
- [ ] Estrategia de resolución de conflictos por entidad.
- [ ] Política de reintentos/backoff.
- [ ] Manejo de archivos de evidencia grandes (subida diferida).
