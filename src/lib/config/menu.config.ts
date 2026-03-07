/**
 * Menu Config - Source of Truth para Navegación y RBAC de Rutas
 *
 * Define la estructura del menú del dashboard, qué rutas existen y
 * qué roles tienen acceso a cada una. Sirve para DOS propósitos:
 *
 * 1. NAVEGACIÓN: Los componentes filtran este config por rol para
 *    mostrar solo los links accesibles.
 * 2. PROTECCIÓN: El middleware lee este config para bloquear acceso
 *    a rutas no autorizadas (URL manual, deep links, etc).
 *
 * Para añadir/mover/restringir páginas: edita SOLO este archivo.
 *
 * MULTI-NIVEL:
 * - Soporta items con `children` (grupos expandibles, max 2 niveles)
 * - Filtrado recursivo por rol: padres sin hijos visibles se ocultan
 * - Separadores visuales con `dividerAfter: true`
 * - Validación automática de profundidad máxima en buildRouteMap()
 */

import type { MemberRole } from '~/lib/auth/guards';

// ============================================================================
// TYPES
// ============================================================================

export interface MenuItem {
  /** Texto visible en la navegación */
  text: string;
  /** URL de destino (obligatorio en hijos, opcional en padres con children) */
  href?: string;
  /** Identificador del icono (mapeado a SVG en IconMap) */
  icon: string;
  /**
   * Roles con acceso a esta ruta.
   * - Nivel 1: OBLIGATORIO. Define quién ve el item y accede a la ruta.
   * - Children: OPCIONAL. Si se omite, hereda del padre.
   *   Si se especifica, se INTERSECTA con los del padre (solo puede restringir).
   */
  roles?: MemberRole[];
  /**
   * Sección del sidebar donde se muestra.
   * - Nivel 1: OBLIGATORIO. Determina si va en nav principal o footer.
   * - Children: IGNORADO. Heredan siempre la sección del padre.
   */
  section?: 'main' | 'workspace';
  /** Badge numérico opcional (ej: notificaciones pendientes) */
  badge?: number;
  /** Sub-items (máx 1 nivel de profundidad). Si existen, el padre actúa como grupo expandible */
  children?: MenuItem[];
  /** Renderiza separador visual debajo de este item (solo nivel 1) */
  dividerAfter?: boolean;
  /**
   * Interruptor para el programador. Si es false, el item no se renderiza en el menú,
   * independientemente de los roles. Por defecto es true.
   */
  visible?: boolean;
}

export type ResolvedMenuItem = MenuItem & {
  roles: MemberRole[];
  section: 'main' | 'workspace';
}

// ============================================================================
// MENU CONFIGURATION (Source of Truth)
// ============================================================================

export const MENU_CONFIG: MenuItem[] = [
  // ── 1. Visión General ─────────────────────────────────────
  {
    text: 'Dashboard',
    href: '/dashboard',
    icon: 'home',
    roles: ['owner', 'admin', 'member'],
    section: 'main',
    visible: true,
    dividerAfter: true,
  },

  // ── 2. Gestión de Clientes y Leads (CRM Core) ──────────────
  {
    text: 'Inbox / Llamadas',
    href: '/dashboard/interacciones',
    icon: 'inbox',
    roles: ['owner', 'admin', 'member'],
    section: 'main',
  },
  {
    text: 'Contactos y Leads',
    href: '/dashboard/contactos',
    icon: 'contact',
    roles: ['owner', 'admin', 'member'],
    section: 'main',
  },
  {
    text: 'Citas y Agenda',
    icon: 'calendar',
    roles: ['owner', 'admin', 'member'],
    section: 'main',
    children: [
      { text: 'Calendario',        href: '/dashboard/agenda', icon: 'calendar' },
      { text: 'Citas Programadas', href: '/dashboard/appointments',  icon: 'clock' },
    ],
    dividerAfter: true,
  },

  // ── 3. Motor del Negocio (CMS Sectorial) ───────────────────
  {
    text: 'Inventario',
    icon: 'building',
    roles: ['owner', 'admin', 'member'],
    section: 'main',
    children: [
      { text: 'Catálogo de Vehículos', href: '/dashboard/cms/vehiculos',  icon: 'list' },
      { text: 'Gestión de Stock',      href: '/dashboard/cms/inventario', icon: 'box' },
      { text: 'Marcas y Modelos',      href: '/dashboard/cms/maestros',   icon: 'tags' },
    ],
    dividerAfter: true,
  },

  // ── 4. Inteligencia Artificial ─────────────────────────────
  {
    text: 'Agentes de Voz AI',
    icon: 'bot',
    roles: ['owner', 'admin'],
    section: 'main',
    children: [
      { text: 'Mis Agentes',          href: '/dashboard/agents',              icon: 'bot' },
      { text: 'Prompts y Guiones',    href: '/dashboard/agents/prompts',      icon: 'file-text' },
      { text: 'Base de Conocimiento', href: '/dashboard/agents/conocimiento', icon: 'database' },
    ],
  },
  {
    text: 'Analítica y KPIs',
    href: '/dashboard/analitica',
    icon: 'chart',
    roles: ['owner', 'admin'],
    section: 'main',
    dividerAfter: true,
  },

  // ── 5. Configuración del Workspace ─────────────────────────
  {
    text: 'Configuración',
    icon: 'settings',
    roles: ['owner', 'admin'],
    section: 'workspace',
    children: [
      { text: 'General',             href: '/dashboard/configuracion', icon: 'settings' },
      { text: 'Horarios de Atención',href: '/dashboard/horarios',      icon: 'clock' },
      { text: 'Integraciones',       href: '/dashboard/integraciones', icon: 'puzzle' },
      { text: 'Departamentos',       href: '/dashboard/departments', icon: 'building', roles: ['owner'] },
      { text: 'Usuarios',            href: '/dashboard/usuarios',      icon: 'users' },
    ],
  },
  {
    text: 'Suscripción',
    href: '/dashboard/facturacion',
    icon: 'credit-card',
    roles: ['owner'],
    section: 'workspace',
  },
];

// ============================================================================
// ROUTE PROTECTION (built from config at module load — cached)
// ============================================================================

const PROTECTED_ROUTES: Array<[string, MemberRole[]]> = [];

function buildRouteMap() {
  function traverse(
    items: MenuItem[],
    depth: number,
    parentRoles?: MemberRole[],
  ) {
    for (const item of items) {
      if (depth === 1) {
        if (!item.roles || item.roles.length === 0) {
          throw new Error(`MenuItem "${item.text}" (nivel 1) debe tener roles definidos.`);
        }
        if (!item.section) {
          throw new Error(`MenuItem "${item.text}" (nivel 1) debe tener section definida.`);
        }
      }

      const effectiveRoles = resolveChildRoles(item.roles, parentRoles, item.text);

      if (item.href) {
        PROTECTED_ROUTES.push([item.href, effectiveRoles]);
      }

      if (item.children) {
        if (depth >= 2) {
          throw new Error(
            `MenuItem "${item.text}" tiene hijos en nivel ${depth}. Máximo: 2 niveles.`
          );
        }
        traverse(item.children, depth + 1, effectiveRoles);
      }
    }
  }

  traverse(MENU_CONFIG, 1);
  // Rutas más específicas primero (evita falsos positivos en startsWith)
  PROTECTED_ROUTES.sort((a, b) => b[0].length - a[0].length);
}

function resolveChildRoles(
  childRoles: MemberRole[] | undefined,
  parentRoles: MemberRole[] | undefined,
  itemText: string,
): MemberRole[] {
  if (!parentRoles) return childRoles ?? [];
  if (!childRoles || childRoles.length === 0) return parentRoles;

  const effective = childRoles.filter((role) => parentRoles.includes(role));
  const widened   = childRoles.filter((role) => !parentRoles.includes(role));

  if (widened.length > 0) {
    console.warn(
      `[menu.config] MenuItem "${itemText}" intenta ampliar roles: [${widened.join(', ')}]. ` +
      `Serán ignorados (los hijos solo pueden restringir).`
    );
  }

  return effective;
}

buildRouteMap();

// ============================================================================
// ROUTE ACCESS (consumida por middleware.ts)
// ============================================================================

/**
 * Verifica si un rol tiene acceso a una ruta del dashboard.
 * A prueba de trailing slashes de Qwik City y subrutas dinámicas.
 */
export function canAccessRoute(role: MemberRole, pathname: string): boolean {
  // Limpieza de URL (trailing slash, query params, hash)
  let normalized = pathname;
  if (normalized.includes('?')) normalized = normalized.split('?')[0];
  if (normalized.includes('#')) normalized = normalized.split('#')[0];
  if (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  for (const [route, allowedRoles] of PROTECTED_ROUTES) {
    if (normalized === route || normalized.startsWith(route + '/')) {
      return allowedRoles.includes(role);
    }
  }

  // Ruta no registrada en el config → acceso permitido
  return true;
}

// ============================================================================
// MENU HELPERS (consumidas por componentes UI)
// ============================================================================

export function getVisibleMenu(
  role: MemberRole,
  section: 'main' | 'workspace',
): ResolvedMenuItem[] {
  return MENU_CONFIG
    .filter((item) =>
      item.visible !== false &&
      item.section === section &&
      (item.roles ?? []).includes(role)
    )
    .map((item) => {
      const parentRoles = item.roles ?? [];

      if (!item.children) return item as ResolvedMenuItem;

      const visibleChildren = item.children.filter((child) => {
        if (child.visible === false) return false;
        const effectiveRoles = resolveChildRoles(child.roles, parentRoles, child.text);
        return effectiveRoles.includes(role);
      });

      if (visibleChildren.length === 0) return null;

      return { ...item, children: visibleChildren } as ResolvedMenuItem;
    })
    .filter((item): item is ResolvedMenuItem => item !== null);
}
