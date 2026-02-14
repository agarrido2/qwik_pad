# RBAC - Roles y Permisos en Onucall

**Fecha:** 14 de febrero de 2026  
**Ámbito:** Sistema de autorización multi-tenant (organizacional)  
**Versión:** 1.0

---

## 🎯 Jerarquía de Roles

El sistema implementa **4 roles organizacionales** con jerarquía descendente de privilegios:

```
owner (Propietario)
  └─► admin (Administrador)
       └─► member (Trabajador)
            └─► invited (Invitado)
```

---

## 📋 Especificación de Roles

### 1. `owner` - Propietario

**Descripción:** Dueño legal de la organización, responsable de facturación.

**Privilegios:**
- ✅ **ACCESO EXCLUSIVO** a facturación/billing/pagos
- ✅ Todos los privilegios del sistema
- ✅ Gestión completa de la organización
- ✅ **Puede crear usuarios:** `admin`

**Casos de uso:**
- Dueño de clínica dental que paga la suscripción
- CEO de empresa que gestiona la facturación
- Responsable legal del negocio

**Restricciones:**
- Solo puede haber **1 owner** por organización (best practice)
- No puede ser degradado a otro rol sin transferir ownership

---

### 2. `admin` - Administrador

**Descripción:** Gestor operacional con privilegios completos excepto facturación.

**Privilegios:**
- ✅ Todos los privilegios **EXCEPTO** facturación/billing/pagos
- ✅ Gestión de usuarios
- ✅ Configuración del sistema
- ✅ Gestión de llamadas y agentes
- ✅ **Puede crear usuarios:** `member`, `invited`
- ❌ **NO puede acceder:** Páginas de facturación, suscripciones, métodos de pago

**Casos de uso:**
- Secretaria de clínica dental con gestión completa
- Gerente operacional que no maneja finanzas
- Encargado de sucursal

**Restricciones:**
- No puede modificar planes de suscripción
- No puede ver información de facturación
- No puede crear otros `admin` (solo el `owner`)

---

### 3. `member` - Trabajador

**Descripción:** Empleado de la organización con acceso limitado.

**Privilegios:**
- ✅ Acceso a funcionalidades básicas del dashboard
- ✅ Visualización de llamadas
- ✅ Consulta de datos (sin modificación)
- ❌ **NO puede:** Crear usuarios, modificar configuración, acceder a facturación

**Casos de uso:**
- Recepcionista que consulta llamadas
- Empleado que necesita ver datos pero no modificarlos
- Rol de "solo lectura" con permisos básicos

**Restricciones:**
- No puede invitar a otros usuarios
- No puede modificar configuración de agentes
- No puede acceder a configuración avanzada

---

### 4. `invited` - Invitado

**Descripción:** Usuario especial en modo **preview/demo** con acceso de solo lectura.

**Privilegios:**
- ✅ **Solo visualización** de opciones disponibles
- ✅ Preview del dashboard (modo demo)
- ✅ Exploración de funcionalidades (sin ejecutar acciones)
- ❌ **NO puede:** Realizar acciones, modificar datos, crear recursos

**Casos de uso:**
- Usuario en trial evaluando el producto
- Invitado externo que revisa el sistema
- Modo "preview" antes de completar onboarding

**Restricciones:**
- No puede ejecutar acciones (todo en modo lectura)
- No puede crear ni modificar recursos
- No puede invitar a otros usuarios
- Acceso temporal (convertido a `member` tras onboarding)

---

## 🔐 Matriz de Permisos

| Funcionalidad | `owner` | `admin` | `member` | `invited` |
|---------------|---------|---------|----------|-----------|
| **Facturación/Billing** | ✅ Exclusivo | ❌ | ❌ | ❌ |
| **Configuración Organización** | ✅ | ✅ | ❌ | ❌ |
| **Gestión de Usuarios** | ✅ | ✅ (member/invited) | ❌ | ❌ |
| **Crear Admin** | ✅ | ❌ | ❌ | ❌ |
| **Configuración Agentes** | ✅ | ✅ | ❌ | ❌ |
| **Ver Llamadas** | ✅ | ✅ | ✅ | ✅ (demo) |
| **Modificar Llamadas** | ✅ | ✅ | ❌ | ❌ |
| **Dashboard Analytics** | ✅ | ✅ | ✅ (limitado) | ✅ (demo) |
| **Integraciones (Retell, Zadarma)** | ✅ | ✅ | ❌ | ❌ |
| **Números de Teléfono** | ✅ | ✅ | ❌ | ❌ |
| **Modo Preview/Demo** | ✅ | ✅ | ✅ | ✅ |

---

## 🛠️ Implementación Técnica

### Base de Datos

```sql
-- Enum de roles organizacionales
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member', 'invited');

-- Tabla pivote users ↔ organizations
CREATE TABLE members (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES users(id),
  role member_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Ubicación:** [schema-fusion.ts](../lib/db/schema-fusion.ts#L69-L73)

---

### Guards de Autorización (Pendiente Implementación)

```typescript
// src/lib/auth/guards.ts

export const ROLE_PERMISSIONS = {
  owner: ['*'], // Acceso total
  admin: ['dashboard', 'calls', 'agents', 'users:create:member', 'users:create:invited'],
  member: ['dashboard:read', 'calls:read'],
  invited: ['dashboard:preview'],
} as const;

export function hasPermission(
  userRole: MemberRole,
  permission: string
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.includes('*') || permissions.includes(permission);
}

export function canAccessBilling(role: MemberRole): boolean {
  return role === 'owner'; // EXCLUSIVO para owner
}

export function canCreateAdmin(role: MemberRole): boolean {
  return role === 'owner'; // Solo owner puede crear admins
}

export function canCreateMemberOrInvited(role: MemberRole): boolean {
  return role === 'owner' || role === 'admin';
}
```

---

## 🚀 Rutas Protegidas (Por Implementar)

### Facturación (Owner Exclusivo)

```
/dashboard/facturacion
/dashboard/billing
/dashboard/suscripcion
/dashboard/metodos-pago
```

**Guard:** `requireOwner()`

### Gestión de Usuarios (Owner + Admin)

```
/dashboard/usuarios
/dashboard/invitar
```

**Guard:** `requireAdminOrOwner()`

### Dashboard General (Todos)

```
/dashboard
/dashboard/llamadas (read-only para member/invited)
```

**Guard:** `requireMember()` (incluye todos los roles)

---

## 📊 Flujos de Creación de Usuarios

### Owner crea Admin

```
1. Owner accede a /dashboard/usuarios
2. Click "Invitar Administrador"
3. Formulario: email + rol: admin
4. Sistema envía invitación
5. Admin completa onboarding
6. Admin tiene acceso completo EXCEPT billing
```

### Admin crea Member/Invited

```
1. Admin accede a /dashboard/usuarios
2. Click "Invitar Usuario"
3. Opciones disponibles: member | invited (NO admin)
4. Sistema envía invitación
5. Usuario completa onboarding según rol
```

### Conversión: Invited → Member

```
1. Usuario invited completa onboarding
2. Admin/Owner revisa y aprueba
3. Rol actualizado a "member"
4. Acceso ampliado automáticamente
```

---

## ⚠️ Reglas de Negocio

### RN-001: Un Owner por Organización
- Una organización debe tener exactamente **1 owner**
- El owner puede transferir ownership a otro usuario
- Al transferir, el owner anterior pasa a `admin`

### RN-002: Jerarquía de Invitaciones
```
owner     → Puede crear: admin
admin     → Puede crear: member, invited
member    → No puede crear usuarios
invited   → No puede crear usuarios
```

### RN-003: Billing Exclusivo
- Solo el `owner` ve las páginas de facturación
- Intentos de acceso por otros roles → 403 Forbidden
- Redirección a `/dashboard` con mensaje de error

### RN-004: Preview Mode para Invited
- Usuarios `invited` ven datos demo/simulados
- No pueden ejecutar acciones (botones deshabilitados)
- Banner superior: "Modo Preview - Completa onboarding para acceso completo"

---

## 🔄 Estados de Transición

```
invited (Trial/Preview)
  ↓ [Onboarding completado + Aprobación]
member (Trabajador)
  ↓ [Promoción por owner]
admin (Administrador)
  ↓ [Transferencia de ownership]
owner (Propietario)
```

**Nota:** No hay degradación automática. Solo manual por el `owner`.

---

## 📝 Checklist de Implementación

### ✅ Completado
- [x] Enum `member_role` definido
- [x] Tabla `members` con campo `role`
- [x] Relación N:M users ↔ organizations

### 🚧 Pendiente
- [ ] Guards de autorización en rutas
- [ ] Middleware `requireOwner()`, `requireAdmin()`
- [ ] UI condicional según rol (mostrar/ocultar botones)
- [ ] Página `/dashboard/facturacion` (owner only)
- [ ] Página `/dashboard/usuarios` con permisos de invitación
- [ ] Banner "Preview Mode" para `invited`
- [ ] Sistema de transferencia de ownership
- [ ] Auditoría de cambios de rol

---

## 🧪 Casos de Prueba

```typescript
// test/auth/rbac.test.ts

describe('RBAC Permissions', () => {
  it('owner can access billing', () => {
    expect(canAccessBilling('owner')).toBe(true);
  });

  it('admin cannot access billing', () => {
    expect(canAccessBilling('admin')).toBe(false);
  });

  it('owner can create admin', () => {
    expect(canCreateAdmin('owner')).toBe(true);
  });

  it('admin cannot create admin', () => {
    expect(canCreateAdmin('admin')).toBe(false);
  });

  it('admin can create member and invited', () => {
    expect(canCreateMemberOrInvited('admin')).toBe(true);
  });

  it('member cannot create users', () => {
    expect(canCreateMemberOrInvited('member')).toBe(false);
  });
});
```

---

## 📖 Referencias

- **Schema DB:** [schema-fusion.ts](../lib/db/schema-fusion.ts)
- **Services:** [organization.service.ts](../lib/services/organization.service.ts)
- **Onboarding:** [onboarding.service.ts](../lib/services/onboarding.service.ts)

---

**Última actualización:** 14 de febrero de 2026  
**Responsable:** QwikDBA + Equipo Arquitectura
