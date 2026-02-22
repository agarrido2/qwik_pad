# Supabase Database Setup

Este directorio contiene toda la configuración SQL necesaria para las funciones y triggers de Supabase.

## 📋 Estructura

```
supabase/
├── triggers.sql          # Funciones y triggers principales
└── README.md            # Esta documentación
```

## 🔧 Instalación

### Primera vez (Setup inicial)

1. **Asegurarse de que el schema está actualizado:**
   ```bash
   bun run db:push
   ```

2. **Instalar funciones y triggers:**
   - Ir a [Supabase Dashboard](https://app.supabase.com) → Tu Proyecto
   - Navegar a **SQL Editor**
   - Abrir el archivo `supabase/triggers.sql`
   - Copiar todo el contenido
   - Pegar en el SQL Editor
   - Click en **Run**

3. **Verificar instalación:**
   ```bash
   bun run scripts/diagnose_db.ts
   ```

   Deberías ver:
   ```
   ✅ Funciones: 5
   ✅ Triggers: 1
   ✅ Todos los usuarios de auth.users tienen registro en public.users
   ```

## 🎯 Funciones Principales

### `handle_new_auth_user()`
**Trigger:** `on_auth_user_created` (AFTER INSERT en `auth.users`)

Crea automáticamente un registro en `public.users` cuando un usuario se registra via Supabase Auth.

**Soporta:**
- ✅ Google OAuth (extrae `name`, `picture`, `email`)
- ✅ Email/Password
- ✅ Otros providers OAuth

**Campos iniciales:**
- `role`: `'invited'` (requiere completar onboarding)
- `is_active`: `true`
- `subscription_tier`: `'free'`
- `onboarding_completed`: `false`
- `timezone`: `'Europe/Madrid'`
- `locale`: `'es'`

### `handle_updated_at()`
**Triggers:** `set_updated_at` (BEFORE UPDATE en varias tablas)

Actualiza automáticamente el campo `updated_at` antes de cualquier UPDATE.

**Tablas afectadas:**
- `users`
- `organizations`
- `voice_agents`
- `phone_numbers`
- `departments`

### `handle_delete_auth_user()`
**Trigger:** `on_auth_user_deleted` (AFTER DELETE en `auth.users`)

Elimina automáticamente el usuario de `public.users` cuando se elimina de `auth.users`. Los foreign keys con `ON DELETE CASCADE` se encargan de limpiar el resto de referencias.

### `user_organizations(user_id)`
Helper function para obtener las organizaciones de un usuario.

**Retorna:**
```sql
TABLE(organization_id UUID, role TEXT)
```

**Uso:**
```sql
-- En RLS policies
SELECT * FROM organizations
WHERE id IN (
  SELECT organization_id 
  FROM user_organizations(auth.uid())
);

-- En queries
SELECT * FROM user_organizations('4da4c9b3-76c9-4a77-85ff-391a313730eb');
```

## 🔍 Diagnóstico y Mantenimiento

### Verificar estado de la base de datos
```bash
bun run scripts/diagnose_db.ts
```

Este script verifica:
- ✅ Existencia de tablas (`public.users`, `auth.users`)
- ✅ Funciones instaladas
- ✅ Triggers configurados
- ✅ Enums correctos
- ✅ Integridad referencial (usuarios huérfanos)

### Inspeccionar funciones
```bash
bun run scripts/inspect_function.ts
```

### Recrear usuario huérfano manualmente
Si encuentras usuarios en `auth.users` que no tienen registro en `public.users`:

```bash
bun run scripts/inspect_function.ts
```

Este script intentará recrear el usuario automáticamente.

## 🚨 Troubleshooting

### Problema: Usuario se registró pero no aparece en `public.users`

**Diagnóstico:**
```bash
bun run scripts/diagnose_db.ts
```

Si ves usuarios huérfanos, significa que:
1. El trigger no existía cuando se registró el usuario
2. La función tenía un error
3. La tabla `public.users` no existía

**Solución:**
1. Reinstalar triggers: ejecutar `supabase/triggers.sql` en SQL Editor
2. Recrear usuario: `bun run scripts/inspect_function.ts`
3. Verificar: `bun run scripts/diagnose_db.ts`

### Problema: Error "relation public.users does not exist"

**Causa:** El schema no está sincronizado con la base de datos.

**Solución:**
```bash
bun run db:push
```

### Problema: Trigger ejecuta pero falla silenciosamente

**Diagnóstico:**
Ver logs en Supabase Dashboard → Logs → Database

**Causas comunes:**
- Campo requerido (`NOT NULL`) falta en el INSERT
- Enum value inválido
- Constraint violation

**Solución:**
1. Revisar la definición de la función en `supabase/triggers.sql`
2. Comparar con el schema en `src/lib/db/schema.ts`
3. Actualizar y reinstalar

### Problema: Función obsoleta `handle_new_user()` aparece en diagnóstico

**Causa:** Función legacy de una versión anterior.

**Solución:**
```sql
-- En Supabase SQL Editor
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
```

## 📚 Referencias

- [Supabase Triggers Documentation](https://supabase.com/docs/guides/database/postgres/triggers)
- [PostgreSQL Trigger Documentation](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- Documentación interna: `docs/standards/SUPABASE_DRIZZLE_MASTER.md`

## 🔐 Seguridad

Todas las funciones de trigger usan `SECURITY DEFINER`, lo que significa que se ejecutan con los privilegios del usuario que creó la función (superusuario de Supabase). Esto es necesario para insertar en `public.users` desde un trigger en `auth.users`.

**Consideraciones:**
- ✅ Las funciones no exponen datos sensibles
- ✅ Solo realizan operaciones de mantenimiento de integridad
- ✅ No aceptan input del usuario (solo datos del trigger)
- ✅ Usan `SET search_path TO 'public'` para evitar schema poisoning

## 📝 Actualizaciones

Cuando actualices el schema en `src/lib/db/schema.ts`:

1. **Si añades campos NOT NULL a `users`:**
   - Actualizar `handle_new_auth_user()` en `supabase/triggers.sql`
   - Proporcionar valores por defecto en el INSERT
   - Reinstalar en Supabase SQL Editor

2. **Si añades nuevas tablas con `updated_at`:**
   - Añadir trigger `set_updated_at` en `supabase/triggers.sql`
   - Reinstalar en Supabase SQL Editor

3. **Si cambias enums:**
   - Ejecutar `bun run db:push` (se encarga automáticamente)
   - Verificar que triggers no usen valores obsoletos

## 🎯 Checklist de Deploy

Antes de hacer push a producción:

- [ ] `bun run db:push` ejecutado en dev
- [ ] `bun run scripts/diagnose_db.ts` pasa sin errores
- [ ] `supabase/triggers.sql` actualizado si el schema cambió
- [ ] Triggers reinstalados en Supabase Dashboard (prod)
- [ ] Verificación post-deploy: crear usuario de prueba y verificar que aparece en `public.users`
