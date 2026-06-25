# Manual inspection type step - 2026-06-25

## Figma reference

```txt
https://www.figma.com/design/DymqBWIjfxvuU6UK9wNI3p/Medio-Ambiente-Core?node-id=633-14601&m=dev
```

Nodo:

```txt
633:14601
```

`get_design_context` fue bloqueado por controles de seguridad, por lo que la implementación se basó en:

- metadata del nodo Figma;
- screenshot adjunto por el usuario;
- componentes y estilos ya integrados en el flujo manual.

## Ruta creada

```txt
/inspection/manual/type
```

Archivo Expo Router:

```txt
apps/mobile-inspecciones/app/inspection/manual/type.tsx
```

Pantalla:

```txt
apps/mobile-inspecciones/src/modules/inspection/ManualInspectionTypeScreen.tsx
```

## Contratos usados

```txt
InspectionType
```

Importado desde:

```txt
@aurelia/contracts
```

Mapeo actual de opciones:

```txt
Hallazgo              -> InspectionType.ENVIRONMENTAL
Checklist normativo   -> InspectionType.REGULATORY
```

## Estado y arquitectura

### Zustand

Se extendió:

```txt
apps/mobile-inspecciones/src/modules/inspection/manualInspection.store.ts
```

Nuevos campos:

```txt
inspectionType
inspectionTypeLabel
```

Se extendió:

```txt
apps/mobile-inspecciones/src/modules/inspection/manualInspectionFlow.store.ts
```

Nuevas acciones:

```txt
goToIdentification()
goToType()
goToObservations()
```

### TanStack Query

Este paso no consume datos de servidor directamente. Usa estado local del borrador y enum compartido desde contracts.

La separación sigue vigente:

- catálogos de área/sector: TanStack Query en paso 1;
- selección temporal de tipo: Zustand, porque es draft local/offline.

## Cambios UI

- Se creó pantalla de tipo de inspección según Figma.
- Header con botón atrás, título, subtítulo y badge `GF HSE`.
- Banner de conectividad reutilizado.
- Stepper reutilizado con soporte para pasos completados.
- Card `Hallazgo` y card `Checklist normativo` seleccionable.
- Footer con `Atrás` y `Continuar`.

## Pendientes

1. Validar pixel-to-pixel en navegador contra Figma.
2. Definir si `Hallazgo` requiere un enum más específico que `InspectionType.ENVIRONMENTAL`.
3. Crear pantalla `/inspection/manual/observations` para el paso 3.
4. Reemplazar `Alert` temporal del botón Continuar por navegación real al paso 3.
5. Confirmar si la opción `Hallazgo` debe quedar deshabilitada o seleccionable.

## Comandos de prueba

```powershell
cd C:\Users\carlo\Desktop\aurelia\Aurelia
git pull origin main
pnpm install
pnpm --filter api start:dev
```

En otro terminal:

```powershell
cd C:\Users\carlo\Desktop\aurelia\Aurelia\apps\mobile-inspecciones
pnpm web -- --clear
```

Validación:

1. Entrar a `/inspection/manual/identification`.
2. Completar área, sector y ubicación.
3. Presionar `Continuar`.
4. Confirmar navegación a `/inspection/manual/type`.
5. Seleccionar `Hallazgo` o `Checklist normativo`.
6. Confirmar que cambia el texto: `Para esta inspección se ha seleccionado ...`.
