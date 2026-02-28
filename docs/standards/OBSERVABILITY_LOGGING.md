# Estándar de Observabilidad y Errores Estructurados

Propósito: Definir un sistema de diagnóstico unificado que permita identificar fallos en segundos dentro de una arquitectura de 3 capas.

## 1. Taxonomía de Errores (Error Codes)
Para evitar mensajes de error ambiguos, se asigna un código único según la capa de procedencia:

| Código | Capa | Alcance |
| :--- | :--- | :--- |
| **ORCH_XXX** | src/routes/ | Errores en Loaders, Actions o validación de entrada (Zod). |
| **SERV_XXX** | src/lib/ | Errores en lógica de negocio, servicios externos o integraciones. |
| **DATA_XXX** | src/db/ | Errores de persistencia, integridad, RLS o conectividad con Supabase. |

## 2. Registro de Logs (Structured Logging)
Queda prohibido el uso de console.log para reportar estados de la aplicación. Se debe utilizar un Logger estructurado que incluya metadatos.

Formato OBLIGATORIO:
Logger.error({
  code: 'SERV_001',
  message: 'Explicación clara para el desarrollador',
  context: { userId: user.id, action: 'payment' },
  trace: error.stack
});

## 3. Estrategia de Manejo de Excepciones
1. Capa de Servicios (lib/): Capturan errores técnicos (ej. fallo de API de terceros), los transforman en un código de la tabla anterior y lanzan una excepción controlada.
2. Capa Orchestrator (routes/): Es la única capa que decide qué error mostrar al usuario. Captura la excepción del servicio y devuelve un objeto success: false con un mensaje amigable a través de routeAction$.
3. Capa UI (components/): No maneja errores lógicos; se limita a renderizar el estado de error proporcionado por el Orchestrator.

## 4. Auditoría de Trazabilidad
El @QwikAuditor verificará que:
- No existan bloques catch vacíos.
- Toda routeAction$ maneje explícitamente el caso de error.
- Los logs en producción no expongan PII (Personal Identifiable Information).