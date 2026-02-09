# AI Coding Instructions

## 🎯 Quick Context
**Stack**: Qwik + Qwik City (SSR/Resumable) • Bun (dev) • Node.js (prod) • Supabase (PostgreSQL + Auth) • Drizzle ORM • Tailwind v4

This project follows a **strict 3-layer architecture** with comprehensive documentation in `docs/standards/`. All architectural decisions MUST comply with documented patterns.

---

## 📐 Architecture (The Orchestrator Pattern)

### Critical Rule: Routes orchestrate, never implement
`src/routes/` uses filesystem-based routing where files **coordinate** data, services, and views — but contain **zero business logic**.

```tsx
// ✅ CORRECT: Route orchestrates, service implements
export const useProfile = routeLoader$(async ({ params }) => {
  return await ProfileService.getById(params.id);  // lib/services/
});

// ❌ WRONG: Business logic in route
export const useProfile = routeLoader$(async ({ params }) => {
  const db = getDB();
  return await db.select().from(profiles).where(eq(profiles.id, params.id));
});
```

### Layer Responsibilities
1. **`src/routes/`** → `routeLoader$`, `routeAction$`, `DocumentHead`, component assembly
2. **`src/lib/`** → Services, DB schema (`schema.ts`), auth, Zod schemas, utilities
3. **`src/components/`** → Pure UI (no business logic, no API calls)
4. **`src/features/`** → Feature-isolated modules (when logic doesn't fit global `lib/`)

**Test**: If deleting `src/routes/` loses business logic, architecture is broken.

---

## 🚫 Non-Negotiable Rules

**MUST REJECT** requests that:
- Add business logic to `src/routes/` files
- Create new top-level folders outside documented architecture
- Violate `docs/standards/PROJECT_RULES_CORE.md`, `ARQUITECTURA_FOLDER.md`, or `SUPABASE_DRIZZLE_MASTER.md`

**When rejecting**: Explain the violation + propose compliant alternative.

---

## 🔧 Development Commands (Bun-First)

```bash
# Core workflow
bun install          # Package management (30x faster than npm)
bun dev              # Dev server (http://localhost:5173)
bun run build        # Production build (client + SSR)
bun fmt              # Prettier formatting
bun run lint         # ESLint

# Database (Drizzle + Supabase)
bun run db:push      # Push schema to dev (no migrations)
bun run db:generate  # Generate migration from schema changes
bun run db:studio    # Open Drizzle Studio
```

**Production Runtime**: Node.js v20+ (not Bun). See `docs/standards/BUN_NODE.md` for hybrid strategy.

---

## 💾 Database & Auth Patterns

### Schema as Source of Truth
- `src/lib/db/schema.ts` defines all tables (Drizzle ORM)
- Environment validation: `src/lib/env.server.ts` (Zod, fail-fast on missing vars)
- Connection modes:
  - **App**: Port 6543 (Transaction Pooler, `pgbouncer=true`)
  - **Migrations**: Port 5432 (Session Mode, schema changes)

### Auth Flow (Supabase SSR)
1. Sessions via cookies (`@supabase/ssr`)
2. Signup → `handle_new_auth_user()` trigger → creates `public.users` record
3. Server validation: `getAuthUser()` uses `getUser()` (validates JWT), **never** `getSession()`
4. Private routes: Auth guard in `layout.tsx`

**Security Checklist**:
- ✅ Server actions use `zod$()` validation
- ✅ RLS policies on all tables
- ✅ Secrets in `.env`, never hardcoded
- ✅ Use `createServerSupabaseClient(requestEvent)` server-side

---

## ⚡ Performance Rules (Resumability)

- **Default**: `useSignal()` (primitives), `useStore()` (objects), `useComputed$()`
- **Server data**: `routeLoader$` (SSR, zero client JS)
- **Reactive effects**: `useTask$()` (resumable, tracks dependencies)
- **Client-only DOM**: `useVisibleTask$()` ⚠️ **Restricted** — breaks resumability
  - *Only* for: DOM manipulation, 3rd-party libs (charts/maps), browser APIs
  - Anything else = performance violation

### Images
- Always set `width` + `height` to prevent CLS
- Use `loading="lazy"` or `@unpic/qwik`
- Target: LCP < 2.5s, CLS < 0.1

---

## 🎨 Styling (Tailwind v4)

- Theme in `src/global.css` via `@theme`
- Conditional classes: `cn()` from `lib/utils/cn.ts`
- Mobile-first: `sm:`, `md:`, `lg:` breakpoints
- **No** inline styles, **no** CSS Modules

---

## 📚 Documentation Hierarchy

When in doubt, consult in order:
1. `docs/standards/SUPABASE_DRIZZLE_MASTER.md` (Data/Auth)
2. `docs/standards/ARQUITECTURA_FOLDER.md` (Structure)
3. `docs/standards/PROJECT_RULES_CORE.md` (Constitution)
4. `docs/standards/CHEATSHEET_QWIK.md` (Quick patterns)
5. `docs/standards/QUALITY_STANDARDS.md` (Performance metrics)

---

## 🤖 Agent Roles (Optional)

Invoke with `@` mentions:
- **@QwikArchitect** → Planning (no code), outputs `PLAN.md` or folder trees
- **@QwikBuilder** → Implementation (enforces `SUPABASE_DRIZZLE_MASTER.md`, requires tests for `lib/`)
- **@QwikDBA** → Schema changes only (RLS enforced, workflow: schema → `db:generate` → `db:push`)
- **@QwikAuditor** → Code review against `QUALITY_STANDARDS.md`
