# API hardening iteration - 2026-06-26

## Objetivo

Subir la API desde MVP/demo hacia una base de seguridad inicial sin bloquear el avance funcional de mobile inspecciones.

## Cambios aplicados

### Token service

Se agregó:

```txt
apps/api/src/modules/auth/jwt-token.service.ts
```

Implementa emisión y verificación de tokens firmados HS256 usando `crypto` de Node.

Variables esperadas:

```txt
API_TOKEN_KEY
API_TOKEN_TTL_SECONDS
```

### Auth guard disponible

Se agregó:

```txt
apps/api/src/modules/auth/jwt-auth.guard.ts
```

El guard valida cabecera Bearer y deja el usuario decodificado en `request.user`.

Por seguridad operativa del desarrollo actual, quedó registrado como provider y no como `APP_GUARD` global hasta reemplazar completamente el login demo.

### Endpoint me

Se actualizó:

```txt
apps/api/src/modules/auth/auth.controller.ts
```

para leer desde `request.user` cuando el guard esté activo.

### Headers y rate limit

Se agregó:

```txt
apps/api/src/shared/security/http-security.ts
```

Incluye headers HTTP básicos y rate limit in-memory de 180 requests por minuto por ip, método y path.

### CORS por allowlist

Se actualizó:

```txt
apps/api/src/main.ts
```

Ahora CORS usa `CORS_ORIGINS` en vez de aceptar cualquier origen.

Valor sugerido en local:

```txt
CORS_ORIGINS=http://localhost:8081,http://localhost:3001,http://localhost:5173
```

### Cliente mobile preparado

Se actualizó:

```txt
apps/mobile-inspecciones/src/shared/services/http-client.ts
```

Cuando existe sesión mobile, agrega cabecera Bearer a las llamadas HTTP.

## Pendientes obligatorios para producción

1. Reemplazar login demo por credenciales por usuario o SSO/OIDC.
2. Activar `JwtAuthGuard` como guard global.
3. Marcar explícitamente rutas públicas como login y health.
4. Agregar permissions guard por endpoint.
5. Implementar storage seguro native: SecureStore, SQLite cifrado o equivalente.
6. Definir cifrado de datos sensibles en base de datos.
7. Agregar auditoría de login, sync y evidencias.
8. Agregar tests de seguridad mínimos.

## Nivel estimado

```txt
Antes: 2/10 - 3/10
Después de esta iteración: 4/10 aproximado
Objetivo productivo: 8/10+
```

La app mejora en headers, rate limit, CORS y preparación JWT, pero aún no queda productiva hasta cerrar login real, guard global y RBAC.
