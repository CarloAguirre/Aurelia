# Assistant checklist flow fix

El flujo asistido no debe redirigir a `/inspection/manual/identification` al seleccionar `Checklist normativo`.

Debe mantener solo dos opciones visibles:

```txt
Hallazgo
Checklist normativo
```

Ambas opciones deben continuar dentro de `/inspection/chat` y usar el mismo guardado persistente del asistente:

```txt
useSaveAssistantInspectionOffline
CREATE_INSPECTION
CREATE_INSPECTION_FINDING
UPLOAD_ATTACHMENT cuando aplica
POST /api/mobile/sync
```

Pendiente: aplicar el cambio en `InspectionChatScreen.tsx` eliminando la rama que llama a `router.replace('/inspection/manual/identification')`.
