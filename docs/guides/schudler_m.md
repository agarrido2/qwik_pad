
# Informe de Arquitectura Backend: Motor de Agendamiento para IA de Voz (Onucall)

**Contexto del Proyecto:** Diseño de arquitectura de base de datos para Onucall,
un SaaS multi-tenant con integración de agentes de IA por voz.  
**Stack Tecnológico:** Qwik (Frontend), Supabase / PostgreSQL (Backend).  
**Objetivo Principal:** Crear un motor de reservas escalable, independiente de
servicios de terceros (Google Calendar, Cal.com), que reduzca la latencia
conversacional de la IA a cero mediante la entrega de ventanas de tiempo
pre-calculadas en una única petición a base de datos.

---

## 1. Concepto Core: Tres Entidades Autónomas

El sistema se basa en tres entidades con calendarios laborales completamente
independientes entre sí. No existe herencia rígida ni cascada automática entre
los niveles. Cada entidad gestiona su propio calendario de forma autónoma,
siendo responsabilidad exclusiva del administrador del SaaS configurarlo y
mantenerlo actualizado.

Los tres niveles son:

- **Organización:** Define el marco global de la empresa (horarios de apertura
  general, zona horaria, festivos propios del negocio).
- **Departamento:** Recurso lógico o físico dentro de la organización
  (Departamento de Ventas, Box Perros, Sala de Conferencias, Despacho Laboral 1).
  Funciona de forma completamente autónoma. Su horario puede coincidir o no con
  el de la organización.
- **Usuario / Operario:** El factor humano. Tiene su propio calendario laboral
  (turnos, vacaciones, horas propias por convenio, devolución de horas).

### Principio de Autonomía
A nivel de configuración, los tres calendarios son independientes. Nadie
hereda nada de nadie. El dueño del SaaS configura cada uno por separado en el
panel de control.

### Principio de Intersección (Solo en el momento de agendar)
La dependencia **únicamente aparece** cuando el Agente de IA (Elena) necesita
buscar una cita. En ese momento, el motor de base de datos cruza los tres
calendarios y devuelve solo los huecos donde los tres coinciden en estar
disponibles simultáneamente.

---

## 2. Abstracción del Departamento (Generic Scheduling Engine)

El departamento no representa necesariamente un espacio físico. Es un
**recurso programable abstracto**. Esto hace que el motor de Onucall sea
agnóstico al tipo de negocio que lo utilice.

Ejemplos del mismo motor resolviendo casos dispares:

| Negocio | Departamento en Onucall |
| :--- | :--- |
| Inmobiliaria | Dpto. Ventas, Dpto. Alquileres |
| Peluquería de mascotas | Box Perros, Box Gatos, Box Patos |
| Concesionario | Vehículos Nuevos, Postventa, Financiación |
| Despacho jurídico | Despacho Laboral 1, Despacho Civil 2 |
| Clínica | Consulta Medicina General, Consulta Pediatría |

La base de datos no "sabe" qué es un box o un despacho. Solo entiende de
`target_type`, `target_id`, fechas y horas. Esto garantiza escalabilidad
horizontal del SaaS sin modificar el esquema.

---

## 3. Esquema de Base de Datos (Ecosistema de 3 Tablas)

Para evitar bases de datos pesadas (guardar los 365 días del año para cada
entidad), el sistema utiliza el patrón **"Horario Base Semanal + Excepciones"**.

### Tabla 1: `calendar_schedules` (Patrón Base Semanal)

Almacena el comportamiento repetitivo por defecto. **No guarda fechas exactas**,
sino los días de la semana (Lunes = 1, Domingo = 7) codificados en JSONB.

| Columna | Tipo SQL | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `target_type` | `enum` | `'ORGANIZATION'`, `'DEPARTMENT'`, `'USER'` |
| `target_id` | `uuid` | Identificador único de la entidad (indexado) |
| `timezone` | `text` | Ej: `'Europe/Madrid'`. Vital para cálculos horarios |
| `weekly_hours` | `jsonb` | Patrón semanal ISODOW (claves 1 a 7) |
| `created_at` | `timestamptz` | Fecha de creación |
| `updated_at` | `timestamptz` | Fecha de última modificación |

**Ejemplo del campo `weekly_hours`:**
```json
{
  "1": [{"start": "09:00", "end": "14:00"}, {"start": "17:00", "end": "20:00"}],
  "2": [{"start": "09:00", "end": "14:00"}, {"start": "17:00", "end": "20:00"}],
  "3": [{"start": "09:00", "end": "14:00"}, {"start": "17:00", "end": "20:00"}],
  "4": [{"start": "09:00", "end": "14:00"}, {"start": "17:00", "end": "20:00"}],
  "5": [{"start": "09:00", "end": "14:00"}],
  "6": [],
  "7": []
}
```
*(Las claves `"6"` y `"7"` con array vacío indican que sábado y domingo están
cerrados. Si falta la clave, se interpreta igualmente como cerrado.)*

---

### Tabla 2: `calendar_exceptions` (Overrides y Festivos)

Esta tabla es el corazón del control manual del administrador. Sobrescribe el
horario base en días **puntuales y concretos**. Es la tabla que determina si
un día específico del año no se abre, o si tiene un horario diferente al normal.

| Columna | Tipo SQL | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `target_type` | `enum` | A qué nivel aplica la excepción |
| `target_id` | `uuid` | ID exacto de la entidad afectada (indexado) |
| `exception_date` | `date` | La fecha exacta alterada. Ej: `2026-02-23` |
| `is_closed` | `boolean` | `true` = Día completamente cerrado sin importar el horario base |
| `custom_hours` | `jsonb` | Nullable. Si no está cerrado entero, aplica este horario especial ese día |
| `description` | `text` | Motivo para el administrador: "Baja médica", "Inventario", "Evento especial" |
| `created_at` | `timestamptz` | Fecha de creación del registro |

**Casos de uso del campo `is_closed`:**
- `true` + `custom_hours: null` → El día entero está cerrado. No se generan huecos.
- `false` + `custom_hours: [{"start":"09:00","end":"12:00"}]` → Abre ese día pero con horario reducido.
- `false` + `custom_hours: [{"start":"09:00","end":"20:00"}]` → Override positivo: ese día abre más horas de lo habitual (Ej: devolución de horas, refuerzo puntual).

**Ejemplos de registros reales en la tabla:**

| Caso | target_type | is_closed | custom_hours | description |
| :--- | :--- | :--- | :--- | :--- |
| Siniestro en empresa | ORGANIZATION | true | null | "Rotura tubería, local cerrado" |
| Único empleado de baja | DEPARTMENT | true | null | "Baja médica Dpto. Alquileres" |
| Nochebuena (tarde libre) | DEPARTMENT | false | `[{"start":"09:00","end":"13:00"}]` | "Horario especial Nochebuena" |
| Empleado devuelve horas | USER | false | `[{"start":"09:00","end":"14:00"}]` | "Trabaja sábado por deuda de horas" |

---

### Tabla 3: `appointments` (Reservas Finales Confirmadas)

Almacena los bloques de tiempo que ya han sido reservados por clientes.
Es la tabla que el motor de disponibilidad consulta para "restar" los huecos
ya ocupados antes de devolver la disponibilidad a la IA.

| Columna | Tipo SQL | Descripción |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `organization_id` | `uuid` | Aislamiento Multi-Tenant (RLS en Supabase) |
| `department_id` | `uuid` | Recurso que atiende la cita |
| `user_id` | `uuid` | Operario asignado. Nullable hasta confirmación |
| `start_at` | `timestamptz` | Inicio exacto de la cita (incluye buffers) |
| `end_at` | `timestamptz` | Fin exacto de la cita (incluye buffers) |
| `status` | `enum` | `CONFIRMED`, `PENDING`, `CANCELLED` |
| `created_at` | `timestamptz` | Fecha de creación |

---

## 4. Índices Recomendados

Para que el Stored Procedure vuele en producción, se deben crear estos índices
en Supabase desde el primer día:

```sql
-- Búsqueda ultra-rápida del patrón base por entidad
CREATE INDEX idx_calendar_schedules_target
  ON calendar_schedules (target_type, target_id);

-- Búsqueda ultra-rápida de excepciones por entidad y fecha
CREATE INDEX idx_calendar_exceptions_target_date
  ON calendar_exceptions (target_id, exception_date);

-- Búsqueda de citas ocupadas en un rango de tiempo
CREATE INDEX idx_appointments_range
  ON appointments (department_id, start_at, end_at);
```

---

## 5. Procedimiento Almacenado RPC: `get_time_window_availability`

Esta función es el único punto de contacto entre el Agente de IA (Elena) y
el motor de calendario. Recibe un rango de fechas y devuelve un JSON limpio
y pre-calculado con todos los huecos disponibles.

### Parámetros de Entrada

| Parámetro | Tipo | Descripción |
| :--- | :--- | :--- |
| `p_target_type` | `enum` | El nivel a consultar |
| `p_target_id` | `uuid` | La entidad exacta a consultar |
| `p_start_date` | `date` | Inicio de la ventana de tiempo |
| `p_end_date` | `date` | Fin de la ventana de tiempo |
| `p_duration_minutes` | `int` | Duración de cada hueco (configurada en el Departamento) |

### Lógica Interna (Paso a Paso)

1. **`generate_series(p_start_date, p_end_date)`:** PostgreSQL genera en RAM
   la lista de días del rango solicitado. No hay tabla con 365 días físicamente
   almacenados. Es generación dinámica en microsegundos.

2. **`EXTRACT(ISODOW FROM fecha)`:** Convierte cada fecha del rango en su número
   de día de la semana (1=Lunes, 7=Domingo) para buscar el horario base en
   `calendar_schedules`.

3. **`LEFT JOIN calendar_exceptions`:** Para cada día generado, busca si existe
   un registro en la tabla de excepciones con esa fecha exacta y ese `target_id`.

4. **`COALESCE` (Regla de resolución):** Aplica la siguiente lógica de prioridad:
   - Si existe excepción y `is_closed = true` → Devuelve `[]` (cerrado).
   - Si existe excepción y `custom_hours` tiene datos → Devuelve `custom_hours`.
   - Si no existe excepción → Devuelve el horario base de `weekly_hours`.

5. **Sustracción de citas ocupadas:** Cruza el resultado con la tabla
   `appointments` y elimina los huecos donde ya exista una cita confirmada
   (`status = 'CONFIRMED'`) que se solape en tiempo.

6. **`jsonb_object_agg()`:** Empaqueta todos los días procesados en un único
   objeto JSON y lo devuelve como respuesta final.

### Respuesta JSON (Ejemplo)

```json
{
  "2026-03-03": ["09:00", "09:30", "11:00", "15:00", "16:00"],
  "2026-03-04": [],
  "2026-03-05": ["09:00", "10:00", "11:00", "12:00"],
  "2026-03-06": ["09:00", "10:30"],
  "2026-03-07": [],
  "2026-03-08": [],
  "2026-03-09": ["09:00", "10:00", "14:00", "15:00"]
}
```

*(Los días con `[]` pueden ser sábado/domingo por horario base, o un día
cerrado por excepción. La IA no necesita saber el motivo, solo que no hay huecos.)*

---

## 6. Flujo Completo del Agente de IA (Elena)

### Fase 1: Inicio de Búsqueda
Cuando Elena detecta intención de reserva en la conversación, lanza
**una única llamada** al RPC solicitando la ventana de los próximos 7-14 días.

```javascript
// Tool Call desde el LLM de Elena
POST /rest/v1/rpc/get_time_window_availability
{
  "p_target_type": "DEPARTMENT",
  "p_target_id": "uuid-departamento-alquileres",
  "p_start_date": "2026-03-03",
  "p_end_date": "2026-03-10",
  "p_duration_minutes": 60
}
```

### Fase 2: Negociación Proactiva (Sin peticiones extra)
Elena ya tiene el mapa completo de la semana en su contexto (el JSON).
Puede negociar con el cliente de forma fluida sin volver a consultar la BD:

> *Cliente:* "¿Tenéis el miércoles 4 por la mañana?"  
> *Elena:* "El miércoles 4 no tenemos disponibilidad, pero el jueves 5
> tengo huecos a las 9:00 y a las 10:00. ¿Alguna te viene bien?"

### Fase 3: Paginación Dinámica
Si el cliente solicita fechas fuera de la ventana inicial (Ej: "La semana
que viene"), Elena vuelve a invocar el mismo RPC con nuevas fechas.
El sistema está diseñado para que esto sea transparente en la conversación.

### Fase 4: Confirmación con Bloqueo Transaccional
Una vez acordada la hora, Elena lanza la segunda y última llamada:
`book_appointment`. En el momento del `INSERT`, PostgreSQL ejecuta una
validación de exclusión para prevenir el problema del **Double Booking**
(dos clientes reservando el mismo hueco simultáneamente).

- Si el hueco sigue libre → `INSERT` confirmado. Elena comunica la reserva.
- Si el hueco fue ocupado en ese intervalo → El backend devuelve error
  estructurado. Elena pide disculpas y ofrece el siguiente hueco del JSON
  sin necesidad de volver a consultar la BD.

---

## 7. Ventajas Técnicas de esta Arquitectura

### Rendimiento
Sin bucles en el servidor de aplicación (Node/Qwik). Todo el cálculo de
intersección de calendarios y sustracción de citas se resuelve dentro de
PostgreSQL en una única transacción. Un `generate_series` de 15 días con
sus `JOINs` cuesta menos de 5ms de cómputo en Supabase.

### Latencia Cero en Voz
El Agente de IA realiza únicamente **2 peticiones** en toda la conversación:
1. `get_time_window_availability` → Para obtener huecos disponibles.
2. `book_appointment` → Para confirmar la cita.

Esto garantiza un diálogo telefónico natural sin silencios percibibles.

### Almacenamiento Ultra-Ligero
Un año completo de configuración consume un puñado de filas en
`calendar_schedules` (una por entidad) y registros puntuales en
`calendar_exceptions`. Nunca se almacenan los 365 días físicamente.

### Escalabilidad Multi-Tenant
El campo `organization_id` en `appointments` permite activar Row Level
Security (RLS) en Supabase, garantizando que cada empresa cliente solo
acceda a sus propios datos de forma segura y aislada.

### Independencia Total de Terceros
No hay dependencia de APIs externas (Google Calendar, Cal.com, Calendly).
El motor de reservas es 100% propiedad de Onucall, elimina costes de
licencias y evita fallos por caídas de servicios externos.

### Control Administrativo Total
La tabla `calendar_exceptions` se mapea directamente con la interfaz de
usuario del panel de Onucall: el administrador pincha en un día del
calendario visual, introduce el motivo en el modal, y el backend refleja
el cambio de forma inmediata. El campo `description` garantiza trazabilidad
y auditoría interna para todos los cambios de disponibilidad.

---

## 8. Resumen Ejecutivo

| Componente | Responsabilidad |
| :--- | :--- |
| `calendar_schedules` | Define el "ritmo normal" semanal de la entidad |
| `calendar_exceptions` | Inyecta la realidad caótica del día a día (overrides) |
| `appointments` | Registra los compromisos de tiempo ya confirmados |
| `get_time_window_availability` (RPC) | Motor único: cruza los 3 componentes y devuelve JSON limpio |
| `book_appointment` (RPC) | Confirma la reserva con validación anti-double-booking |

Con esta arquitectura de **2 tablas de calendario + 1 tabla de reservas +
2 funciones RPC**, Onucall dispone de un motor de agendamiento de nivel
empresarial, nativo en Supabase/PostgreSQL, optimizado para la baja
latencia crítica que exige la IA de Voz.