# Plan de Arquitectura: Simplificación de Tema y Actualización de Paleta

## 1. Visión General
Esta feature tiene dos objetivos principales guiados por la simplificación de la UI y la redefinición de marca:
1. Eliminar el modo "system" de la aplicación, soportando únicamente los modos explícitos "light" y "dark" (estableciendo uno de ellos, idealmente "light" o guiado por media-queries inicialmente pero forzando a dos estados).
2. Actualizar la paleta de colores requerida en toda la aplicación.

## 2. Fronteras `$()` y Orquestación
- **`src/root.tsx` (Script de inicialización crítico)**: El script inline bloqueante (sin framework) que inyecta la clase antes de que Qwik empiece, debe ser ajustado. Se reemplazará el fallback `'system'` por `'light'`.
- **Componente de Cambio de Tema (`theme-switcher.tsx` o similar)**: El manejador de eventos `$()` debe modificarse para alternar (toggle) únicamente entre `light` y `dark`. No debe capturar señales complejas, solo el valor actual necesario para conmutar el `localStorage` y la clase de `documentElement`.

## 3. Estado Mínimo (Snapshot Size)
Ningún impacto negativo. De hecho, se simplifica el estado, pasando de 3 posibles valores de cadena a un binario (`true/false` o `'light'/'dark'`). El signal o state global del tema requerirá menor manejo de condicionales en el snapshot de estado reanudable.

## 4. Estilos y Sistema de Diseño (`global.css`)
Las variables CSS (`--primary`, `--secondary`, etc.) en `src/assets/css/global.css` migrarán a los siguientes valores (convertidos a notación HSL sin función para mantener el formato establecido):

- **Primary**: `#37393A` -> `200 3% 22%`
- **Secondary**: `#B077F0` -> `268 82% 70%`
- **Secondary Light**: `#AC7EF7 75%` (puede aplicarse alpha transparency en Tailwind u opacidad) -> `270 85% 73%` con variante opaca apropiada.
- **Warning**: `#F8FF99` -> `64 100% 80%`
- **Info**: `#CEDEF3` -> `214 62% 88%`

*Nota para DBA/Auditor:* Reducir variables para estados fallidos en CSS (si están duplicadas como el bloque experimental de prefer-color-scheme). Se debe eliminar el soporte automático `@media (prefers-color-scheme: dark)` para forzar los dos modos explícitos y evitar cruce de responsabilidades con `localStorage`.

## 5. Tareas Técnicas (Builder)

- [x] Editar `src/root.tsx` y modificar el script inline del `<head>` para remover `system` y establecer `light` (o `dark`) por defecto.
- [x] Localizar el componente de conmutación de tema (Switcher/Toggle UI) en `src/components/` y eliminar la opción "System".
- [x] Editar `src/assets/css/global.css`:
  - Retirar el bloque CSS de `@media (prefers-color-scheme: dark)` que establece automáticamente los colores root.
  - Asegurar que `:root` equivale a `light` mode y `.dark` al `dark` mode exclusivamente.
  - Actualizar los valores HSL expuestos más arriba en los token globales (`--primary`, `--secondary`, `--warning`, `--info`).

## 6. Aprobación y Seguimiento
Una vez aprobado el plan, el agente `@QwikBuilder` podrá leer este Markdown y ejecutar las refactorizaciones necesarias con foco quirúrgico (solo CSS, `root.tsx` y el widget de cambio).