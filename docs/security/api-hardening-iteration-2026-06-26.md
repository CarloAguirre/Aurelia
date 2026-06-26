# API hardening iteration - 2026-06-26

## Objetivo

Subir la API desde MVP/demo hacia una base de seguridad inicial sin bloquear el avance funcional de mobile inspecciones.

## Alcance respetado

No se tocó la fidelidad visual ni el flujo asistido mobile de inspecciones.

## Estado revisado antes de cambiar código

- `AuthService` validaba una contraseña demo y devolvía `demo-token-${user.id}`.
- `JwtTokenService` ya existía, pero el login no lo usaba para emitir el token.
- `JwtAuthGuard` validaba Bearer token, pero no estaba activo como `APP_GUARD` global.
- `AuthController.getMe` ya leía `request.user`, pero `fullName` seguía usando el email.
- `HealthController` no tenía marca pública explícita.
- `MobileBootstrapController`, `MobileSyncController`, inspecciones, organización y usuarios no tenían marca pública, por lo que quedan protegidos al activar el guard global.
- El cliente mobile ya enviaba `Authorization: Bearer <token>` cuando existe sesión.
- `apps/api/src/test/api-smoke.ts` todavía ejecutaba flujos sin Bearer token, por lo que quedaba desalineado con el guard global.
- Los permisos base ya existían en seed para organización, usuarios, roles y permisos, pero no había guard declarativo que los exigiera por endpoint.

## Cambios aplicados

### Decorador de rutas públicas

Se agregó:

```txt
apps/api/src/modules/auth/public.decorator.ts
```

Expone `@Public()` e `IS_PUBLIC_KEY` para declarar explícitamente rutas o controladores fuera del guard global.

### Token service

Se actualizó:

```txt
apps/api/src/modules/auth/jwt-token.service.ts
```

Ahora el payload firmado incluye:

```txt
sub
email
fullName
roles
permissions
iat
exp
```

También valida estructura de header, algoritmo `HS256`, tipo `JWT`, firma HMAC, expiración y forma mínima del payload.

Variables esperadas:

```txt
API_TOKEN_KEY
API_TOKEN_TTL_SECONDS
```

`API_TOKEN_KEY` debe tener al menos 32 caracteres.

### Login con token firmado

Se actualizó:

```txt
apps/api/src/modules/auth/auth.service.ts
```

El login ya no devuelve `demo-token-*`. Ahora:

1. Normaliza el email.
2. Valida usuario activo existente en base de datos.
3. Valida contraseña desde env.
4. Emite token firmado con `JwtTokenService`.
5. Actualiza `lastLoginAt`.
6. Devuelve usuario y token compatible con el cliente mobile actual.

Variables de compatibilidad dev:

```txt
API_LOGIN_PASSWORD
DEMO_LOGIN_PASSWORD
```

Se prefiere `API_LOGIN_PASSWORD`. `DEMO_LOGIN_PASSWORD` queda como compatibilidad local temporal, sin valor hardcodeado.

### Configuración de secretos por ambiente

Se actualizó:

```txt
apps/api/src/config/configuration.ts
```

Ahora expone:

```txt
security.tokenKey
security.tokenTtlSeconds
auth.loginPassword
```

No se dejó `JWT_SECRET`, `API_TOKEN_KEY` ni contraseña de login hardcodeada.

### Guard global JWT

Se actualizó:

```txt
apps/api/src/modules/auth/auth.module.ts
```

`JwtAuthGuard` quedó activo como `APP_GUARD`.

### Guard con metadata pública

Se actualizó:

```txt
apps/api/src/modules/auth/jwt-auth.guard.ts
```

El guard ahora consulta `@Public()` con `Reflector`. Si la ruta no es pública, exige `Authorization: Bearer <token>`.

### Decorador de permisos

Se agregó:

```txt
apps/api/src/modules/auth/require-permissions.decorator.ts
```

Expone `@RequirePermissions(...)` para proteger rutas de forma declarativa sin mezclar RBAC dentro de los controladores.

### Guard global de permisos

Se agregó:

```txt
apps/api/src/modules/auth/permissions.guard.ts
```

Se registró como segundo `APP_GUARD` en:

```txt
apps/api/src/modules/auth/auth.module.ts
```

El guard permite rutas sin permisos declarados, respeta `@Public()`, acepta `*` como bypass administrativo y retorna `403` cuando el token no contiene los permisos requeridos.

### Usuarios, roles, permisos y organización protegidos

Se actualizaron:

```txt
apps/api/src/modules/users/users.controller.ts
apps/api/src/modules/roles/roles.controller.ts
apps/api/src/modules/organization/organization.controller.ts
```

Permisos aplicados:

```txt
users:read
users:write
roles:read
roles:write
permissions:read
permissions:write
organization:read
organization:write
```

Esto deja una primera capa RBAC sin granularidad excesiva. Los módulos mobile, inspecciones, incidentes y SPR quedan con JWT obligatorio, pero sin `@RequirePermissions()` todavía para no bloquear flujos funcionales en esta iteración.

### Login público y `/api/me` real

Se actualizó:

```txt
apps/api/src/modules/auth/auth.controller.ts
```

`POST /api/auth/login` quedó público con `@Public()`.

`GET /api/me` queda protegido y responde desde `request.user`:

```txt
id
email
fullName
roles
permissions
isPlaceholder=false
```

### Health público

Se actualizó:

```txt
apps/api/src/modules/health/health.controller.ts
```

El controlador quedó marcado con `@Public()` para mantener disponible `GET /api/health` sin token.

### Smoke test autenticado y con RBAC

Se actualizó:

```txt
apps/api/src/test/api-smoke.ts
```

El smoke test ahora:

1. Configura secretos efímeros si no existen variables de entorno.
2. Valida `GET /api/health` sin token.
3. Valida `GET /api/me` sin token con respuesta `401`.
4. Valida `GET /api/mobile/bootstrap` sin token con respuesta `401`.
5. Valida login inválido con respuesta `401`.
6. Ejecuta login válido con usuario inspector.
7. Valida `/api/me` con usuario autenticado real.
8. Valida que mobile bootstrap siga funcionando después del login.
9. Valida `403` para usuario inspector en usuarios, organización, roles y permisos.
10. Ejecuta login admin y valida acceso a usuarios, organización, roles y permisos.
11. Reutiliza Bearer token para los flujos existentes de inspecciones, incidentes y SPR.

Esto cubre la brecha inmediata entre JWT global, RBAC declarativo y validación automatizada mínima.

### Headers, CORS y rate limit

Se mantiene lo ya aplicado:

```txt
apps/api/src/shared/security/http-security.ts
apps/api/src/main.ts
```

CORS sigue usando `CORS_ORIGINS`, los headers básicos siguen activos y el rate limit in-memory se mantiene en 180 requests por minuto por ip, método y path.

### Cliente mobile

No se modificó el flujo visual ni asistido mobile.

Se mantiene lo ya aplicado:

```txt
apps/mobile-inspecciones/src/shared/services/http-client.ts
```

El cliente mobile seguirá llamando bootstrap/sync después de login porque conserva el token en sesión y lo envía como Bearer.

## Rutas públicas

```txt
POST /api/auth/login
GET /api/health
```

## Rutas protegidas por JWT

```txt
GET /api/me
GET /api/mobile/bootstrap
POST /api/mobile/sync
GET /api/mobile/sync
GET /api/inspections
GET /api/incidents
GET /api/spr
```

## Rutas protegidas por JWT + permisos

```txt
GET /api/users -> users:read
POST /api/users -> users:write
POST /api/users/:id/roles -> users:write
POST /api/users/:id/companies -> users:write
POST /api/users/:id/areas -> users:write
GET /api/roles -> roles:read
POST /api/roles -> roles:write
POST /api/roles/:id/permissions -> roles:write
GET /api/permissions -> permissions:read
POST /api/permissions -> permissions:write
GET /api/organization/* -> organization:read
POST /api/organization/* -> organization:write
```

## Comandos de validación local

Instalar dependencias:

```bash
pnpm install
```

Configurar variables mínimas para levantar API manualmente:

```bash
$env:API_TOKEN_KEY="dev-local-token-key-change-me-32-characters"
$env:API_LOGIN_PASSWORD="AureliaLocalOnly"
$env:CORS_ORIGINS="http://localhost:8081,http://localhost:3001,http://localhost:5173"
```

Levantar API:

```bash
pnpm --filter api dev
```

Validar health público:

```bash
curl http://localhost:3000/api/health
```

Validar endpoint protegido sin token:

```bash
curl -i http://localhost:3000/api/mobile/bootstrap
```

Resultado esperado:

```txt
401
```

Login inspector:

```bash
curl -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"email":"karen.opazo@goldfields.com","password":"AureliaLocalOnly"}'
```

Guardar token inspector en PowerShell:

```bash
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/auth/login -ContentType "application/json" -Body '{"email":"karen.opazo@goldfields.com","password":"AureliaLocalOnly"}'
$token = $login.token
```

Validar `/api/me` con Bearer:

```bash
Invoke-RestMethod -Method Get -Uri http://localhost:3000/api/me -Headers @{ Authorization = "Bearer $token" }
```

Validar bootstrap mobile con Bearer:

```bash
Invoke-RestMethod -Method Get -Uri http://localhost:3000/api/mobile/bootstrap -Headers @{ Authorization = "Bearer $token" }
```

Validar RBAC inspector sin permisos administrativos:

```bash
Invoke-WebRequest -Method Get -Uri http://localhost:3000/api/users -Headers @{ Authorization = "Bearer $token" }
```

Resultado esperado:

```txt
403
```

Login admin:

```bash
$adminLogin = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/auth/login -ContentType "application/json" -Body '{"email":"carlos.aguirre@goldfields.com","password":"AureliaLocalOnly"}'
$adminToken = $adminLogin.token
Invoke-RestMethod -Method Get -Uri http://localhost:3000/api/users -Headers @{ Authorization = "Bearer $adminToken" }
```

Smoke test:

```bash
pnpm --filter api test:smoke
```

Build API:

```bash
pnpm --filter @aurelia/contracts build
pnpm --filter api build
```

## Pendientes obligatorios para producción

1. Reemplazar contraseña compartida por credenciales por usuario o SSO/OIDC.
2. Agregar hash de password si se implementa auth local.
3. Cargar permisos reales desde `role_permissions` en login y eliminar fallback `*` / permisos fijos.
4. Agregar refresh tokens, revocación y rotación.
5. Extender `@RequirePermissions()` a inspecciones, incidentes, SPR, evidencias, comentarios y workflows.
6. Implementar storage seguro native para token mobile.
7. Definir cifrado de datos sensibles en base de datos.
8. Agregar auditoría de login, sync y evidencias.
9. Ampliar tests de seguridad con expiración, token alterado, Bearer malformado y rutas públicas/protegidas por módulo.
10. Evaluar rate limit persistente o distribuido para producción.

## Nivel estimado

```txt
Antes: 4/10 aproximado
Después de esta iteración: 6/10 aproximado
Objetivo productivo: 8/10+
```

La API queda con JWT firmado, guard global, rutas públicas explícitas, primera capa RBAC declarativa y smoke test alineado al flujo autenticado, pero todavía no queda productiva hasta cerrar credenciales por usuario, permisos reales desde base de datos, refresh/revocación, storage seguro mobile y auditoría.
