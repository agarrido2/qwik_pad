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
 * Reemplaza: menu-options.ts, BILLING_ROUTES, ADMIN_ROUTES de guards.ts
 *
 * MULTI-NIVEL (2026-02-16):
 * - Soporta items con `children` (grupos expandibles, max 2 niveles)
 * - Filtrado recursivo por rol: padres sin hijos visibles se ocultan
 * - Separadores visuales con `dividerAfter: true`
 * - Validación automática de profundidad máxima en buildRouteMap()
 *
 * Created: 2026-02-15
 * Updated: 2026-02-16 - Multi-level menu support
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
   *   Si se especifica, se INTERSECTA con los del padre (solo puede restringir, nunca ampliar).
   *   Ej: padre ['owner','admin'] + hijo ['owner'] → hijo efectivo ['owner']
   *   Ej: padre ['owner','admin'] + hijo ['member'] → hijo efectivo [] (error en validación)
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

/**
 * MenuItem de nivel 1 con campos obligatorios resueltos.
 * Usado internamente después de la validación en buildRouteMap.
 */
export type ResolvedMenuItem = MenuItem & {
  roles: MemberRole[];
  section: 'main' | 'workspace';
}

// ============================================================================
// MENU CONFIGURATION (Source of Truth)
// ============================================================================

/**
 * Configuración completa del menú del dashboard.
 *
 * Reglas:
 * - Cada entrada define QUIÉN ve el link Y QUIÉN puede acceder a la ruta
 * - Los roles son acumulativos: ['owner'] = solo owner
 * - Rutas no listadas aquí son accesibles por cualquier usuario autenticado
 * - Sub-rutas (ej: /dashboard/facturacion/planes) heredan restricción del padre
 *
 * Para añadir una ruta nueva, añade un objeto aquí.
 * Para restringir una ruta existente, cambia el array de roles.
 * Para ocultar una ruta del menú, coméntala o elimínala.
 */
export const MENU_CONFIG: MenuItem[] = [
  // ── Main Section ──────────────────────────────────────────
  {
    text: 'Dashboard',
    icon: 'home',
    roles: ['owner', 'admin', 'member'],
    section: 'main',
    visible: true,
    children: [
      { text: 'Agenda', href: '/dashboard/agenda', icon: 'calendar' },
      { text: 'Citas', href: '/dashboard/appointments', icon: 'calendar' },
      { text: 'Analítica', href: '/dashboard/analitica', icon: 'chart' },
    ],
    dividerAfter: true,
  },
  {
    text: 'Interacciones',
    href: '/dashboard/interacciones',
    icon: 'inbox',
    roles: ['owner', 'admin', 'member'],
    section: 'main',
  },
  {
    text: 'Contactos',
    href: '/dashboard/contactos',
    icon: 'contact',
    roles: ['owner', 'admin', 'member'],
    section: 'main',
  },
  {
    // MVP: hardcoded al primer sector (Concesionarios)
    // Futuro: derivar este bloque desde industries.config.ts
    text: 'CMS - Concesionarios',
    icon: 'building',
    roles: ['owner', 'admin', 'member'],
    section: 'main',
    children: [
      { text: 'Dashboard', href: '/dashboard/cms/dashboard', icon: 'home' },
      { text: 'Vehículos', href: '/dashboard/cms/vehiculos', icon: 'building' },
      { text: 'Inventario', href: '/dashboard/cms/inventario', icon: 'puzzle' },
      { text: 'Marcas, Modelos y Tipos', href: '/dashboard/cms/catalogo', icon: 'settings' },
    ],
  },
  {
    text: 'Agente IA',
    icon: 'bot',
    roles: ['owner', 'admin'],
    section: 'main',
    children: [
      { text: 'Agentes', href: '/dashboard/agents', icon: 'bot' },
      { text: 'Teléfonos', href: '/dashboard/agente/telefonos', icon: 'hash' },
      { text: 'Prompt / Flujo', href: '/dashboard/agente/flujos', icon: 'workflow' },
      { text: 'Base Conocimiento', href: '/dashboard/agente/kb', icon: 'book' },
    ],
    dividerAfter: true,
  },

  // ── Workspace Section ─────────────────────────────────────
  {
    text: 'Configuración',
    icon: 'settings',
    roles: ['owner', 'admin'],
    section: 'workspace',
    children: [
      { text: 'Horarios', href: '/dashboard/departments', icon: 'calendar' },
      { text: 'Integraciones', href: '/dashboard/integraciones', icon: 'puzzle' },
      { text: 'Organización', href: '/dashboard/organizacion', icon: 'building', roles: ['owner'] },
      { text: 'Usuarios', href: '/dashboard/usuarios', icon: 'users' },
      { text: 'Facturación', href: '/dashboard/facturacion', icon: 'credit-card', roles: ['owner'] },
    ],
  },
];

// ============================================================================
// ROUTE PROTECTION (built from config at module load — cached)
// ============================================================================

/**
 * Mapa de rutas protegidas → roles permitidos.
 * Ordenado por longitud de ruta descendente para que la ruta más
 * específica haga match primero (ej: /dashboard/facturacion antes que /dashboard).
 */
const PROTECTED_ROUTES: Array<[string, MemberRole[]]> = [];

function buildRouteMap() {
  /**
   * Traversal recursivo que registra rutas de items y sus hijos.
   *
   * Herencia en children:
   * - section: siempre heredado del padre (ignorado si se pone en hijo)
   * - roles: heredado del padre si no se especifica en hijo.
   *   Si el hijo lo especifica, se INTERSECTA con los del padre
   *   (solo puede restringir, nunca ampliar).
   *
   * Validaciones:
   * - Max 2 niveles de profundidad
   * - Items de nivel 1 deben tener roles y section
   * - Roles de hijos no pueden ampliar los del padre
   */
  function traverse(
    items: MenuItem[],
    depth: number,
    parentRoles?: MemberRole[],
  ) {
    for (const item of items) {
      // Validar que nivel 1 tenga roles y section
      if (depth === 1) {
        if (!item.roles || item.roles.length === 0) {
          throw new Error(
            `MenuItem "${item.text}" (nivel 1) debe tener roles definidos.`
          );
        }
        if (!item.section) {
          throw new Error(
            `MenuItem "${item.text}" (nivel 1) debe tener section definida.`
          );
        }
      }

      // Resolver roles efectivos del item
      const effectiveRoles = resolveChildRoles(
        item.roles,
        parentRoles,
        item.text,
      );

      // Registrar ruta del item actual si tiene href
      if (item.href) {
        PROTECTED_ROUTES.push([item.href, effectiveRoles]);
      }

      // Recursión en hijos (validación de max 2 niveles)
      if (item.children) {
        if (depth >= 2) {
          throw new Error(
            `MenuItem "${item.text}" tiene hijos en nivel ${depth + 1}. Máximo permitido: 2 niveles.`
          );
        }
        traverse(item.children, depth + 1, effectiveRoles);
      }
    }
  }

  traverse(MENU_CONFIG, 1);
  // Más específico primero → previene que /dashboard matchee antes que /dashboard/facturacion
  PROTECTED_ROUTES.sort((a, b) => b[0].length - a[0].length);
}

/**
 * Resuelve los roles efectivos de un item, aplicando herencia del padre.
 *
 * - Sin padre (nivel 1): usa roles propios.
 * - Sin roles propios (hijo): hereda del padre.
 * - Con roles propios (hijo): INTERSECTA con padre (solo restringe).
 *   Si la intersección produce roles no válidos (ampliar), los ignora.
 */
function resolveChildRoles(
  childRoles: MemberRole[] | undefined,
  parentRoles: MemberRole[] | undefined,
  itemText: string,
): MemberRole[] {
  // Nivel 1 → devolver roles propios directamente
  if (!parentRoles) {
    return childRoles ?? [];
  }

  // Hijo sin roles → hereda del padre
  if (!childRoles || childRoles.length === 0) {
    return parentRoles;
  }

  // Hijo con roles → intersectar con padre (solo puede restringir)
  const effective = childRoles.filter((role) => parentRoles.includes(role));

  // Advertir si el hijo intentó ampliar (roles que el padre no tiene)
  const widened = childRoles.filter((role) => !parentRoles.includes(role));
  if (widened.length > 0) {
    console.warn(
      `[menu.config] MenuItem "${itemText}" define roles [${widened.join(',')}] que su padre no tiene [${parentRoles.join(',')}]. ` +
      `Estos roles serán ignorados. Los hijos solo pueden restringir, nunca ampliar.`
    );
  }

  return effective;
}

buildRouteMap();

/**
 * Verifica si un rol tiene acceso a una ruta del dashboard.
 *
 * Lógica:
 * 1. Normaliza el pathname (quita trailing slash)
 * 2. Busca la ruta más específica que haga match (startsWith)
 * 3. Si encuentra match → verifica que el rol esté en la lista
 * 4. Si no encuentra match → permite acceso (ruta no restringida)
 *
 * @example
 * canAccessRoute('owner', '/dashboard/facturacion')        // true
 * canAccessRoute('admin', '/dashboard/facturacion')        // false
 * canAccessRoute('admin', '/dashboard/facturacion/planes') // false (hereda del padre)
 * canAccessRoute('member', '/dashboard/perfil')            // true  (no restringida)
 */
export function canAccessRoute(role: MemberRole, pathname: string): boolean {
  const normalized =
    pathname.endsWith('/') && pathname !== '/'
      ? pathname.slice(0, -1)
      : pathname;

  for (const [route, roles] of PROTECTED_ROUTES) {
    if (normalized === route || normalized.startsWith(route + '/')) {
      return roles.includes(role);
    }
  }

  // Ruta no en config → accesible por cualquier usuario autenticado
  return true;
}

// ============================================================================
// MENU HELPERS (para componentes UI)
// ============================================================================

/**
 * Devuelve los items de menú visibles para un rol en una sección.
 *
 * Lógica:
 * 1. Filtra items de nivel 1 por sección y rol
 * 2. Para items con hijos, filtra recursivamente los hijos visibles
 * 3. Oculta padres si ninguno de sus hijos es visible
 *
 * @example
 * const mainItems = getVisibleMenu('admin', 'main');
 * const wsItems = getVisibleMenu('admin', 'workspace');
 */
export function getVisibleMenu(
  role: MemberRole,
  section: 'main' | 'workspace',
): ResolvedMenuItem[] {
  return MENU_CONFIG
    .filter((item) => item.visible !== false && item.section === section && (item.roles ?? []).includes(role))
    .map((item) => {
      const parentRoles = item.roles ?? [];

      // Item sin hijos → devolver tal cual
      if (!item.children) return item as ResolvedMenuItem;

      // Item con hijos → filtrar hijos visibles (con roles heredados/intersectados)
      const visibleChildren = item.children.filter((child) => {
        if (child.visible === false) return false;
        const effectiveRoles = resolveChildRoles(child.roles, parentRoles, child.text);
        return effectiveRoles.includes(role);
      });

      // Si ningún hijo es visible, ocultar el padre
      if (visibleChildren.length === 0) return null;

      // Devolver padre con hijos filtrados
      return { ...item, children: visibleChildren } as ResolvedMenuItem;
    })
    .filter((item): item is ResolvedMenuItem => item !== null);
}
