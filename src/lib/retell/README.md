# `src/lib/retell`

Integración con Retell AI (llamadas).

## Server-only

Este módulo usa `process.env` y el SDK de Retell, así que es **solo servidor**.

## Exports

Desde `~/lib/retell`:

```ts
import { triggerDemoCall } from '~/lib/retell';
```

- `retellClient`: cliente singleton.
- `triggerDemoCall(toNumber, agentId)`: crea llamada con `override_agent_id`.

## Variables de entorno

- `RETELL_API_KEY`
- `RETELL_FROM_NUMBER`