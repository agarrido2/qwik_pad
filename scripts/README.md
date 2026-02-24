# Scripts de Base de Datos

Este directorio contiene utilidades activas para verificación e inicialización del entorno.

## Archivos vigentes

- `db-setup.ts`: inicialización base del entorno de datos.
- `check_user_orgs.ts`: inspección rápida de relación usuarios/organizaciones.
- `verify_installation.ts`: verificación técnica de instalación y conexión.

## Uso

Desde la raíz del proyecto:

```bash
bun run scripts/verify_installation.ts
bun run scripts/check_user_orgs.ts
bun run scripts/db-setup.ts
```

## Nota

Los scripts legacy de demo/seed/diagnóstico multi-sector fueron eliminados durante la limpieza de Onucall Auto.
