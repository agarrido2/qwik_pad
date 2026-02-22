# 🔍 AUDITORÍA COMPLETA DE BASE DE DATOS - ONUCALL
**Fecha:** 21 de febrero de 2026  
**Analista:** QwikDBA  
**Propósito:** Revisión arquitectónica completa de esquema PostgreSQL en Supabase

---

## 📊 1. INVENTARIO DE TABLAS

| # | Tabla | Tamaño | Registros | Estado |
|---|-------|--------|-----------|--------|
| 1 | `users` | 168 KB | **100** | ✅ EN USO |
| 2 | `organization_members` | 128 KB | 0 | ⚠️ VACÍA |
| 3 | `users_demo` | 80 KB | 0 | ⚠️ VACÍA |
| 4 | `assigned_numbers` | 80 KB | 0 | ⚠️ VACÍA |
| 5 | `agent_profiles` | 48 KB | 0 | ⚠️ VACÍA |
| 6 | `ip_trials` | 48 KB | 0 | ⚠️ VACÍA |
| 7 | `organizations` | 48 KB | 0 | ⚠️ VACÍA |
| 8 | `pending_invitations` | 48 KB | 0 | ⚠️ VACÍA |
| 9 | `departments` | 40 KB | 0 | ⚠️ VACÍA |
| 10 | `call_flow_templates` | 16 KB | 0 | ⚠️ VACÍA |

**Total:** 10 tablas, 744 KB almacenados

---

## 🔐 2. TRIGGERS Y FUNCIONES ACTIVAS

### 2.1 Triggers

| Trigger | Tabla | Función | Timing | Evento |
|---------|-------|---------|--------|--------|
| `audit_role_changes_trigger` | `organization_members` | `log_role_change()` | AFTER | INSERT/UPDATE/DELETE |
| `validate_demo_before_insert` | `users_demo` | `validate_demo_rate_limits()` | BEFORE | INSERT |

### 2.2 Funciones Disponibles

| Función | Tipo | Propósito |
|---------|------|-----------|
| `handle_new_auth_user()` | Trigger | Sincroniza auth.users → public.users |
| `handle_new_user()` | Trigger | **(REVISAR: ¿Duplicada con handle_new_auth_user?)** |
| `is_admin_or_owner(org_id)` | Boolean | RBAC: Verifica rol admin u owner |
| `is_member_of_org(org_id)` | Boolean | RBAC: Verifica membresía |
| `is_owner_of_org(org_id)` | Boolean | RBAC: Verifica rol owner |
| `log_role_change()` | Trigger | Auditoría de cambios de rol |
| `user_organizations()` | TABLE | Retorna organizaciones del user |
| `validate_demo_rate_limits()` | Trigger | Anti-abuse: Limita demos por IP |

---

## 📋 3. ANÁLISIS DETALLADO POR TABLA

### ✅ 3.1 `users` (CORE - EN USO)

**Propósito:** Tabla central de usuarios, sincronizada con `auth.users` de Supabase Auth.

**Columnas Clave:**
- `id` (UUID, PK) ← Mismo ID que auth.users
- `email` (text, unique, NOT NULL)
- `full_name`, `phone`, `avatar_url`
- `role` (text) ← **ROL DE PLATAFORMA**, NO rol organizacional
  - Valores: `invited`, `active`, `suspended`
- `onboarding_completed` (boolean, default false)
- `subscription_tier` (text, default 'free')
- Security tracking: `signup_ip`, `last_login_ip`, `signup_fingerprint`, `suspicious_activity_flags`

**Índices:**
- `idx_users_role` → Queries por rol
- `idx_users_is_active` → Usuarios activos
- `idx_users_onboarding` → Onboarding incompleto

**Sincronización:**
- Trigger: `handle_new_auth_user()` en auth.users (INSERT)
- Crea registro en public.users automáticamente

**Uso en App:** ✅ CRÍTICO
- Guards: `getAuthGuardData()` en middleware
- Services: `AuthService`, `OnboardingService`
- Routes: Todos los `routeLoader$` autenticados

---

### ⚠️ 3.2 `organizations` (CORE - VACÍA en DEV)

**Propósito:** Tabla de organizaciones/empresas ("tenants" del multi-tenant).

**Columnas Clave:**
- `id` (UUID, PK)
- `name`, `slug` (unique)
- `subscription_tier` (enum: free | starter | pro | enterprise)
- `subscription_status` (enum: active | trialing | canceled | past_due | incomplete)
- `phone` → Teléfono del negocio
- `sector` (text, nullable) ← Recién cambiado de FK a text flexible
- `business_description` (text)
- **Asistente de IA:**
  - `assistant_name`, `assistant_gender` (enum: male | female)
  - `assistant_kindness_level` (integer 1-5)
  - `assistant_friendliness_level` (integer 1-5)
- **Integraciones (NULL en free tier):**
  - `zadarme_phone_number` → Número telefónico asignado
  - `retell_agent_id` → ID del agente de Retell AI

**Creación:**
- `OnboardingService.completeOnboarding()` crea org + añade user como owner

**Uso en App:** ✅ CRÍTICO
- Context: `AuthContext.currentOrg`
- Services: `OrganizationService`, `RBACService`
- Guards: Auth guard valida org membership

**Estado:** Vacía porque usuarios de testing no han completado onboarding

---

### ⚠️ 3.3 `organization_members` (RELACIÓN N:M - VACÍA)

**Propósito:** Tabla pivote Users ↔ Organizations con roles RBAC.

**Columnas:**
- `user_id` (FK → users, CASCADE DELETE)
- `organization_id` (FK → organizations, CASCADE DELETE)
- `role` (enum: owner | admin | member)
- `joined_at` (timestamp)

**Constraints:**
- UNIQUE(user_id, organization_id) → Un rol por user/org

**Índices:** (RBAC optimizados, añadidos 2026-02-14)
- `idx_org_members_org_id` → Miembros por org
- `idx_org_members_user_id` → Orgs de un user
- `idx_org_members_role` → Todos los owners/admins
- `idx_org_members_org_role` (compuesto) → "owners de org X"
- `idx_org_members_user_role` (compuesto) → "orgs donde soy owner"

**Trigger:**
- `audit_role_changes_trigger` → Log de cambios de rol

**Uso en App:** ✅ CRÍTICO para RBAC
- `RBACService.getUserPermissions()`
- Context: `AuthContext.userRole`
- Guards: Validación de permisos

---

### ⚠️ 3.4 `users_demo` (DEMO PÚBLICA - VACÍA)

**Propósito:** Leads de landing page que solicitan demo.

**Flujo:**
1. Formulario → INSERT con `status='pending_verification'`
2. Email OTP enviado
3. Usuario verifica código → `status='verified'`, trigger llamada Retell
4. Webhook post-llamada actualiza: `retell_call_id`, `duration_call`, `satisfaction`, `score_sentiment`, `url_record`

**Columnas Clave:**
- `name`, `email`, `phone`, `sector`
- `ip_address` (NOT NULL, anti-abuse)
- `status` (default 'pending_verification')
- `retell_call_id` (nullable hasta webhook)
- Marketing: `resource_origin`, `utm_campaign`, `utm_medium`
- `converted_org_id` (FK → organizations, si se convierte en cliente)

**Índices:**
- `idx_users_demo_status`
- `idx_users_demo_email_status`
- `idx_users_demo_resource_origin` (UTM tracking)

**Trigger:**
- `validate_demo_before_insert` → Evita spam por IP

**Uso en App:** ✅ FUNCIONAL
- Routes: `(public)/index.tsx`
- Actions: `useDemoRequestAction`, `useVerifyCodeAction`
- Services: `requestDemoVerification`, `verifyAndTriggerDemo`

---

### ⚠️ 3.5 `agent_profiles` (CATÁLOGO DE AGENTES - VACÍA)

**Propósito:** Perfiles de agentes de IA configurados para sectores específicos.

**Columnas:**
- `organization_id` (FK → organizations)
- `sector` (text, NOT NULL) ← Alineado con organizations.sector
- `assistant_name`, `assistant_gender`
- `retell_agent_id` → ID del agente en Retell AI
- `is_default` (boolean) → Agente primario de la org

**Índice:**
- `idx_agent_profiles_sector` → Búsqueda por sector

**Uso Actual:** ❓ NO USADO
- No hay código en `src/` que lea/escriba esta tabla
- **Propósito futuro:** Multi-agente (diferentes agentes por sector)

**Recomendación:** 
- **MANTENER** si roadmap incluye multi-agente
- **ELIMINAR** si solo habrá 1 agente por org (usar `organizations.retell_agent_id`)

---

### ⚠️ 3.6 `assigned_numbers` (NÚMEROS TELEFÓNICOS - VACÍA)

**Propósito:** Registro de números de Zadarme asignados a organizaciones.

**Columnas:**
- `organization_id` (FK → organizations)
- `phone_number` (text, NOT NULL)
- `provider` (default 'zadarme')
- `assigned_at`, `released_at`

**Uso Actual:** ❓ NO USADO
- No hay servicios que gestionen esta tabla

**Recomendación:**
- **MANTENER** si planeas gestionar inventario de números
- **SIMPLIFICAR** a solo `organizations.zadarme_phone_number` si hay 1:1

---

### ⚠️ 3.7 `departments` (CATÁLOGO OPERATIVO - VACÍA)

**Propósito:** Departamentos para filtrar agenda por tipo de servicio/equipo.

**Columnas:**
- `organization_id` (FK → organizations, CASCADE)
- `name`, `color`, `slug`
- `is_active` (boolean, default true)
- `sort_order` (integer, para ordenamiento custom)

**Constraints:**
- UNIQUE(organization_id, slug)

**Índices:**
- `idx_departments_org`
- `idx_departments_org_active`

**Uso en App:** ✅ DISEÑADO
- Route: `(app)/dashboard/agenda/index.tsx`
- Loader: `useDepartments()` retorna datos mock estáticos
- **TODO:** Migrar de datos mock a DB cuando haya UI de gestión

**Recomendación:** MANTENER (funcionalidad roadmap clara)

---

### ⚠️ 3.8 `call_flow_templates` (PLANTILLAS DE FLUJO - VACÍA)

**Propósito:** Flujos de conversación pre-configurados por sector.

**Columnas:**
- `sector` (text, nullable) ← **Recién cambiado** de FK a text
- `name`, `description`
- `flow_config` (jsonb, NOT NULL) ← Steps, conditions, etc.

**Uso Actual:** ❓ NO USADO
- No hay servicios que lean/escriban esta tabla

**Recomendación:**
- **ELIMINAR** si no se usará en el corto plazo (YAGNI)
- **MANTENER** si roadmap incluye editor de flujos sin código

---

### ⚠️ 3.9 `ip_trials` (ANTI-ABUSE - VACÍA)

**Propósito:** Rate limiting de demos por dirección IP.

**Columnas:**
- `ip_address` (text, PK)
- `trial_count` (integer, default 0)
- `blocked_at` (timestamp, nullable)
- `blocked_reason` (text)
- `last_trial_at` (timestamp)

**Trigger Relacionado:**
- `validate_demo_rate_limits()` en `users_demo` (BEFORE INSERT)
- Lógica: Incrementa trial_count, bloquea si > límite

**Uso en App:** ✅ FUNCIONAL (protección activa)
- Trigger automático al insertar en `users_demo`

**Recomendación:** MANTENER (seguridad crítica)

---

### ⚠️ 3.10 `pending_invitations` (INVITACIONES DE EQUIPO - VACÍA)

**Propósito:** Invitaciones pendientes para unirse a organizaciones.

**Columnas:**
- `organization_id` (FK → organizations, CASCADE)
- `email` (text, NOT NULL)
- `role` (enum: owner | admin | member)
- `invited_by` (FK → users)
- `token` (UUID, unique) → Para link de invitación
- `expires_at` (timestamp)
- `accepted_at` (timestamp, nullable)

**Constraints:**
- UNIQUE(email, organization_id)

**Uso Actual:** ❓ NO USADO
- No hay UI ni servicios de invitación implementados

**Recomendación:**
- **MANTENER** si roadmap incluye gestión de equipos
- **ELIMINAR** si solo habrá owners sin colaboradores

---

## 🎯 4. HALLAZGOS CLAVE

### 4.1 ✅ Implementación Correcta

1. **Arquitectura Multi-Tenant N:M:**
   - Users ↔ Organizations via `organization_members`
   - Un user puede estar en múltiples orgs ✅
   - Una org puede tener múltiples users ✅

2. **RBAC Bien Diseñado:**
   - Separación clara: `users.role` (plataforma) vs `organization_members.role` (org)
   - Índices compuestos optimizados para queries RBAC
   - Funciones helper: `is_owner_of_org()`, `is_admin_or_owner()`

3. **Free Tier Strategy:**
   - `organizations.subscription_tier = 'free'` → Mode demo
   - Campos de integración nullable (zadarme, retell)

4. **Seguridad:**
   - Anti-abuse en demos (ip_trials + trigger)
   - Email verification flow (users_demo)
   - Tracking de IPs sospechosas (users)

### 4.2 ⚠️ Inconsistencias / Dudas

1. **Funciones Duplicadas:**
   - `handle_new_auth_user()` vs `handle_new_user()`
   - **Acción:** Revisar cuál está activa en auth.users trigger

2. **Tablas sin Uso Actual:**
   - `agent_profiles` → No hay código que la use
   - `assigned_numbers` → No hay gestión de inventario
   - `call_flow_templates` → No hay editor de flujos
   - `pending_invitations` → No hay UI de invitaciones

3. **Datos de Testing:**
   - 100 users sin organizaciones asociadas
   - Probablemente usuarios de OAuth testing
   - No han completado onboarding

### 4.3 🔧 Optimizaciones Aplicadas Recientemente

- ✅ Eliminada tabla `sectors` (YAGNI aplicado)
- ✅ `call_flow_templates.sector` cambiado de FK a text
- ✅ `organizations.sector` cambiado de FK a text (flexibilidad)
- ✅ Índices RBAC añadidos (2026-02-14)

---

## 📝 5. RECOMENDACIONES

### 5.1 Limpieza Inmediata

```sql
-- Eliminar usuarios de testing sin orgs
DELETE FROM users 
WHERE onboarding_completed = false 
  AND created_at < NOW() - INTERVAL '30 days';
```

### 5.2 Decisiones Arquitectónicas Pendientes

**Opción A: Enfoque Minimalista (MVP)**
```sql
-- Eliminar tablas no usadas actualmente
DROP TABLE IF EXISTS agent_profiles;
DROP TABLE IF EXISTS assigned_numbers;
DROP TABLE IF EXISTS call_flow_templates;
DROP TABLE IF EXISTS pending_invitations;
```

**Opción B: Mantener para Roadmap**
- Solo si hay plan claro de implementación en ≤ 3 meses
- Documentar propósito en comentarios de tabla

### 5.3 Triggers a Revisar

```sql
-- Verificar cuál trigger está activo en auth.users 
SELECT tgname, tgfoid::regproc 
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;
```

---

## ✅ 6. VEREDICTO FINAL

**Estado General:** ✅ **ARQUITECTURA SÓLIDA**

- Schema bien diseñado para multi-tenancy
- RBAC implementado correctamente
- Seguridad anti-abuse activa
- Free tier separado de tiers pagos

**Deuda Técnica:** ⚠️ **BAJA-MEDIA**

- 4 tablas sin uso actual (decidir keep vs drop)
- 100 users fantasma de testing
- Posible duplicación de trigger de sync

**Sincronización App ↔ DB:** ✅ **CORRECTA**

- Schema.ts alineado con DB real
- Migraciones en drizzle/ aplicadas
- TypeScript types sincronizados

---

**¿Apruebas esta auditoría y quieres proceder con alguna de las recomendaciones?**
