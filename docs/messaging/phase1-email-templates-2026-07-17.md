# Fase 1 - Plantillas comunes de correo

## Objetivo

Crear una base transversal de mensajería en la API para que inspecciones, SPR, incidentes, controles críticos y workflows puedan renderizar y enviar correos sin duplicar HTML ni acoplarse a un proveedor específico.

## Diseño de referencia

Figma:

- Desktop: nodo `693:33892`.
- Mobile: nodo `693:33925`.
- Logo: nodo `693:33900`, exportado como SVG y almacenado en el repositorio.

Medidas principales:

| Elemento | Desktop | Mobile |
| --- | ---: | ---: |
| Contenedor | 650 px | 360 px / 100% |
| Header | 100 px | 70 px |
| Logo | 174 x 57 px | 116 x 38 px |
| Título | 24/29 px | 16/28 px |
| Cuerpo | 16/25.9 px | 14/24 px |
| CTA | 450 x 39 px | 296 x 39 px |
| Footer | 100 px | 78 px |

## Archivos

```txt
apps/api/src/modules/messaging/
  assets/aurelia-email-logo.svg
  disabled-email.transport.ts
  email-template.service.ts
  messaging.module.ts
  messaging.service.ts
  messaging.types.ts
```

## Responsabilidades

### `EmailTemplateService`

- Renderiza HTML responsive compatible con clientes de correo.
- Genera una alternativa `text/plain`.
- Escapa todos los parámetros visibles.
- Valida URLs de CTA y solo acepta `http` o `https`.
- Expone un layout común de CTA y el primer template funcional:
  `inspection.finding-assigned`.

### `MessagingService`

- Expone métodos de dominio para renderizar o enviar mensajes.
- Valida destinatarios.
- Delega la entrega al puerto `EmailTransport`.

### `EmailTransport`

Contrato intercambiable para integrar posteriormente:

- Azure Communication Services Email;
- Microsoft Graph;
- SMTP/Nodemailer;
- un proveedor transaccional externo.

La implementación inicial `DisabledEmailTransport` falla explícitamente al intentar enviar. Esto evita simular entregas exitosas mientras infraestructura no haya definido el proveedor.

## Consumo desde otro módulo

```ts
constructor(private readonly messaging: MessagingService) {}

const preview = this.messaging.renderInspectionFindingAssigned({
  recipientName: user.fullName,
  companyName: company.name,
  inspectionNumber: inspection.code,
  observationCount: findings.length,
  platformUrl: `${webBaseUrl}/inspections/${inspection.id}`,
});
```

Cuando exista un transporte configurado:

```ts
await this.messaging.sendInspectionFindingAssigned({
  to: [{ email: user.email, name: user.fullName }],
  params: {
    recipientName: user.fullName,
    companyName: company.name,
    inspectionNumber: inspection.code,
    observationCount: findings.length,
    platformUrl: `${webBaseUrl}/inspections/${inspection.id}`,
  },
});
```

## Prueba

```powershell
pnpm --filter api exec ts-node src/test/api-messaging-template-smoke.ts
```

Valida:

- diseño desktop y breakpoint mobile;
- inclusión del logo exacto exportado desde Figma;
- singular/plural de observaciones;
- escape de HTML;
- versión de texto plano.

## Riesgos y decisiones pendientes

1. El SVG se incluye como `data:` para permitir previews autocontenidas. El transporte de producción deberá preferir un asset público HTTPS o una imagen adjunta con CID para maximizar compatibilidad con Outlook.
2. No se conecta todavía a la generación perezosa de notificaciones internas, porque esa ruta se ejecuta al consultar el panel y podría duplicar correos.
3. La integración con cada módulo debe ocurrir desde eventos de negocio idempotentes y registrar la entrega para evitar reenvíos.
4. Falta seleccionar y configurar el proveedor de entrega para Azure.

## Siguiente iteración

- elegir proveedor de correo;
- implementar el adaptador de transporte;
- crear outbox o registro de entregas;
- conectar el evento real de asignación de hallazgo;
- añadir templates para aprobación, rechazo, vencimiento y cierre.
