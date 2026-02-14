# Script de Seed para Database

## 📋 Descripción

Script SQL que puebla la base de datos con datos ficticios para testing y desarrollo del sistema RBAC.

## 🎯 Qué hace este script

1. **Limpia los datos** (sin eliminar estructura):
   - Vacía todas las tablas de `public.*`
   - Limpia sesiones y tokens de `auth.*`
   - Respeta las foreign keys (orden correcto)

2. **Crea datos realistas**:
   - ✅ **100 usuarios** con password universal `a123456`
   - ✅ **20 organizaciones** con diferentes tiers (free/starter/pro/enterprise)
   - ✅ **~100 membresías** distribuidas (cada org: 1 owner + 1-2 admins + 2-3 members)
   - ✅ **40 perfiles de agente** completos
   - ✅ **15 números telefónicos** asignados
   - ✅ **30 usuarios demo** con diferentes estados
   - ✅ **5 industry types** base

## 🚀 Uso

### Opción 1: Desde Supabase Dashboard (Recomendado)

1. Ir a tu proyecto en [supabase.com/dashboard](https://supabase.com/dashboard)
2. Navegar a **SQL Editor**
3. Crear una **New Query**
4. Copiar y pegar el contenido de `scripts/seed-database.sql`
5. Ejecutar (**Run** o `Cmd/Ctrl + Enter`)
6. Verificar los mensajes de éxito en la consola

### Opción 2: Desde terminal (psql)

```bash
# Desde la raíz del proyecto
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -f scripts/seed-database.sql
```

### Opción 3: Desde Drizzle Studio

```bash
# Si usas Drizzle para gestionar la DB
bun run db:studio
# Luego ejecutar el script desde la interfaz
```

## 🔑 Credenciales de Prueba

**Password universal:** `a123456`

### Usuarios de Ejemplo

| Email | Rol en Org 1 | Descripción |
|-------|--------------|-------------|
| `user1@onucall.test` | **owner** | Propietario, acceso total |
| `user2@onucall.test` | **admin** | Administrador, sin billing |
| `user3@onucall.test` | **member** | Miembro, solo lectura |
| `user4@onucall.test` | **member** | Miembro adicional |
| `user5@onucall.test` | **member** | Miembro adicional |

### Organizaciones Creadas

```
1.  AutoStar Madrid (free)
2.  Inmobiliaria Premium (starter)
3.  TechRetail Solutions (pro)
4.  RentCar Express (enterprise)
5.  SAT Tecnología (starter)
...
20. Reparaciones Express (enterprise)
```

Cada organización tiene:
- 1 owner (acceso total + facturación)
- 1-2 admins (gestión usuarios)
- 2-3 members (solo lectura)

## 📊 Distribución de Datos

```
Usuarios:          100
├─ Owners:         ~20 (1 por org)
├─ Admins:         ~20-30 (1-2 por org)
└─ Members:        ~50-60 (2-3 por org)

Organizaciones:    20
├─ Free:           ~5
├─ Starter:        ~7
├─ Pro:            ~5
└─ Enterprise:     ~3

Perfiles Agente:   40
Números Asignados: 15
Usuarios Demo:     30
```

## 🧪 Testing RBAC

### Flujos de Prueba Recomendados

#### 1. **Test Owner** (user1@onucall.test)
```
✅ Puede acceder a /dashboard/facturacion
✅ Puede invitar admins y members
✅ Puede cambiar cualquier rol
✅ Puede eliminar miembros (excepto único owner)
✅ Ve todos los links del sidebar
```

#### 2. **Test Admin** (user2@onucall.test)
```
✅ Puede acceder a /dashboard/usuarios
❌ NO puede acceder a /dashboard/facturacion
✅ Puede invitar solo members
✅ Puede cambiar roles a member
❌ NO ve link "Facturación" en sidebar
```

#### 3. **Test Member** (user3@onucall.test)
```
✅ Puede acceder a /dashboard
❌ NO puede acceder a /dashboard/usuarios
❌ NO puede acceder a /dashboard/facturacion
❌ Botón "Nuevo Agente" deshabilitado
❌ NO ve links de gestión en sidebar
```

## 🔍 Consultas de Verificación

### Ver distribución de usuarios por organización

```sql
SELECT 
  o.name,
  o.subscription_tier,
  COUNT(*) as total_members,
  SUM(CASE WHEN om.role = 'owner' THEN 1 ELSE 0 END) as owners,
  SUM(CASE WHEN om.role = 'admin' THEN 1 ELSE 0 END) as admins,
  SUM(CASE WHEN om.role = 'member' THEN 1 ELSE 0 END) as members
FROM organizations o
LEFT JOIN organization_members om ON om.organization_id = o.id
GROUP BY o.id, o.name, o.subscription_tier
ORDER BY o.name;
```

### Listar usuarios con sus organizaciones

```sql
SELECT 
  u.email,
  u.full_name,
  o.name as organization,
  om.role,
  u.onboarding_completed
FROM users u
JOIN organization_members om ON om.user_id = u.id
JOIN organizations o ON o.id = om.organization_id
ORDER BY o.name, om.role DESC;
```

### Ver números asignados

```sql
SELECT 
  o.name as organization,
  an.phone_number_formatted,
  an.status,
  u.full_name as assigned_to
FROM assigned_numbers an
JOIN organizations o ON o.id = an.organization_id
JOIN users u ON u.id = an.user_id
ORDER BY o.name;
```

### Verificar perfiles de agente

```sql
SELECT 
  u.full_name,
  o.name as organization,
  ap.industry,
  ap.assistant_name,
  ap.assistant_gender
FROM agent_profiles ap
JOIN users u ON u.id = ap.user_id
JOIN organizations o ON o.id = ap.organization_id
ORDER BY o.name;
```

## ⚠️ Advertencias

1. **Este script ELIMINA TODOS LOS DATOS** actuales
2. **NO elimina la estructura** (tablas, índices, constraints permanecen)
3. **Usa en desarrollo/staging**, NUNCA en producción con datos reales
4. **Backup recomendado** antes de ejecutar

## 🔧 Troubleshooting

### Error: "extension pgcrypto does not exist"

```sql
-- Ejecutar como superuser en Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Error: "permission denied"

- Ejecutar desde Supabase Dashboard con credenciales de superuser
- O conectar con rol `postgres` desde terminal

### Error: "violates foreign key constraint"

- El script usa `TRUNCATE CASCADE` para manejar FKs
- Si falla, verificar que no hay policies RLS bloqueando

### Los datos no aparecen en la app

1. Verificar que RLS policies están activas:
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

2. Verificar que el usuario autenticado está en `auth.users`:
   ```sql
   SELECT id, email, encrypted_password 
   FROM auth.users 
   LIMIT 5;
   ```

3. Probar login con `user1@onucall.test` / `a123456`

## 📝 Notas Técnicas

### Hash del Password

El script usa `crypt('a123456', gen_salt('bf', 10))` que genera:
- Algoritmo: **bcrypt**
- Cost factor: **10** (estándar Supabase)
- Hash: `$2a$10$...` (diferente en cada ejecución por salt aleatorio)

### Triggers Desactivados Temporalmente

Durante TRUNCATE:
```sql
SET session_replication_role = 'replica';  -- Deshabilita triggers
-- ... TRUNCATE operations ...
SET session_replication_role = 'origin';   -- Re-habilita triggers
```

Esto evita que `handle_new_auth_user()` se ejecute múltiples veces.

## 🎯 Próximos Pasos

Después de ejecutar el seed:

1. **Verificar datos:**
   ```bash
   bun test src/tests/unit/auth/guards.test.ts
   ```

2. **Probar login:**
   - Ir a `/login`
   - Email: `user1@onucall.test`
   - Password: `a123456`

3. **Testing RBAC:**
   - Navegar a `/dashboard/usuarios` (owner/admin)
   - Navegar a `/dashboard/facturacion` (solo owner)
   - Probar botones deshabilitados con member

4. **Revisar logs:**
   ```sql
   SELECT * FROM audit_role_changes ORDER BY changed_at DESC LIMIT 10;
   ```

## 📚 Referencias

- [Docs RBAC](../docs/standards/RBAC_ROLES_PERMISSIONS.md)
- [Schema DB](../src/lib/db/schema.ts)
- [Tests Guards](../src/tests/unit/auth/guards.test.ts)
- [Plan RBAC UI](../docs/plans/IMPLEMENTACION_RBAC_UI_2026-02-14.md)
