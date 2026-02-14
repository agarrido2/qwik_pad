# Scripts de Base de Datos

Este directorio contiene scripts SQL para gestión y mantenimiento de la base de datos.

## 📁 Archivos Disponibles

### 🌱 `seed-database.sql`
Script principal para poblar la base de datos con datos de prueba.

**Qué hace:**
- Limpia todos los datos actuales (TRUNCATE)
- Crea 100 usuarios con password `a123456`
- Crea 20 organizaciones con diferentes subscription tiers
- Asigna usuarios a organizaciones con roles (owner/admin/member)
- Genera perfiles de agente, números telefónicos, y datos demo

**Uso:**
```bash
# Desde Supabase Dashboard → SQL Editor
# Copiar y pegar el contenido del archivo

# O desde terminal:
psql "postgresql://[CONNECTION_STRING]" -f scripts/seed-database.sql
```

📖 **Documentación completa:** Ver [README_SEED.md](./README_SEED.md)

### 🔍 `verify-seed.sql`
Script de verificación para comprobar que el seed se ejecutó correctamente.

**Qué muestra:**
- Resumen de registros creados
- Distribución de usuarios por organización
- Usuarios de prueba recomendados
- Verificación de passwords hasheados
- Distribución de roles y subscription tiers

**Uso:**
```bash
psql "postgresql://[CONNECTION_STRING]" -f scripts/verify-seed.sql
```

### 🗑️ `cleanup-api-demo.sh`
Script Bash para limpiar datos de la API demo (rate limits, IPs, etc.)

### 🧪 `test-demo-validation.ts`
Script TypeScript para testing de validaciones de la demo.

### ⚙️ `apply-demo-validation.ts`
Script para aplicar validaciones de rate limiting en usuarios demo.

### 🔧 `db-setup.ts`
Script de configuración inicial de la base de datos.

---

## 🚀 Quick Start

### 1. Poblar base de datos con datos de prueba

```bash
# Ejecutar seed
scripts/seed-database.sql  # (desde Supabase Dashboard)

# Verificar resultado
scripts/verify-seed.sql
```

### 2. Credenciales de prueba

**Password universal:** `a123456`

| Email | Rol | Descripción |
|-------|-----|-------------|
| `user1@onucall.test` | owner | Acceso total + facturación |
| `user2@onucall.test` | admin | Gestión usuarios (sin billing) |
| `user3@onucall.test` | member | Solo lectura |

### 3. Testing RBAC

```bash
# Login con diferentes usuarios
1. user1@onucall.test → Ver /dashboard/facturacion ✅
2. user2@onucall.test → Ver /dashboard/facturacion ❌
3. user3@onucall.test → Botones deshabilitados ✅
```

---

## 📝 Notas Importantes

### ⚠️ Advertencias

- **seed-database.sql ELIMINA TODOS LOS DATOS** actuales
- Solo usar en **desarrollo/staging**, NUNCA en producción
- Hacer backup antes de ejecutar scripts destructivos

### 🔐 Seguridad

- Los passwords están hasheados con bcrypt (cost factor 10)
- Compatible con sistema de autenticación de Supabase
- RLS policies se mantienen activas

### 📊 Datos Generados

```
Usuarios:          100
Organizaciones:    20
Membresías:        ~100
Perfiles Agente:   40
Números Asignados: 15
Usuarios Demo:     30
Industry Types:    5
```

---

## 🔗 Referencias

- [Documentación Seed Completa](./README_SEED.md)
- [Schema Database](../src/lib/db/schema.ts)
- [RBAC Documentation](../docs/standards/RBAC_ROLES_PERMISSIONS.md)
- [Supabase Docs](https://supabase.com/docs)

---

## 🛠️ Troubleshooting

### Error: "extension pgcrypto does not exist"

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Error: "permission denied"

Ejecutar con credenciales de superuser desde Supabase Dashboard.

### Los datos no aparecen

Verificar RLS policies:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

**Última actualización:** 2026-02-14
