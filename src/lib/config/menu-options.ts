/**
 * Menu Options - Dashboard Navigation Config
 * 
 * Configuración centralizada de las opciones del menú del dashboard.
 * Se separa del UI para facilitar mantenimiento y testing.
 * 
 * Los iconos son strings que mapean a componentes SVG en el Sidebar.
 * Patrón según ARQUITECTURA_FOLDER.md: Config en lib/, UI en components/
 */

export interface MenuItem {
  /** Texto visible en el menú */
  label: string;
  /** URL de destino */
  href: string;
  /** Identificador del icono (mapeado a SVG en el componente) */
  icon: string;
  /** Mostrar badge con número (ej: notificaciones) */
  badge?: number;
}

/**
 * Menú principal del dashboard
 * 
 * NOTA: Solo incluir rutas que ESTÁN implementadas en src/routes/(app)/dashboard/
 * Las rutas comentadas están planificadas para futuras fases.
 */
export const dashboardMenu: MenuItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'home',
  },
  // Rutas planificadas (sin implementar aún):
  // { label: 'Llamadas', href: '/dashboard/llamadas', icon: 'phone' },
  // { label: 'Agente', href: '/dashboard/agente', icon: 'bot' },
  // { label: 'Números', href: '/dashboard/numeros', icon: 'hash' },
  // { label: 'Integraciones', href: '/dashboard/integraciones', icon: 'puzzle' },
  // { label: 'Base Conocimiento', href: '/dashboard/base-conocimiento', icon: 'book' },
];

/**
 * Menú de workspace/organización
 * Aparece en la sección footer del sidebar (antes del logout)
 * 
 * NOTA: Solo rutas implementadas. /dashboard/configuracion planificada.
 */
export const workspaceMenu: MenuItem[] = [
  {
    label: 'Usuarios',
    href: '/dashboard/usuarios',
    icon: 'users',
  },
  // { label: 'Configuración', href: '/dashboard/configuracion', icon: 'settings' },
  {
    label: 'Facturación',
    href: '/dashboard/facturacion',
    icon: 'credit-card',
  },
];
