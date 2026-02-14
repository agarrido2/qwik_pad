/**
 * Layouts - Barrel export
 * 
 * Componentes estructurales/orquestadores que ENSAMBLAN bloques de shared/
 * para crear shells completos de aplicación.
 * 
 * Según ARQUITECTURA_FOLDER.md:
 * - PublicLayout, DashboardLayout, AuthLayout
 * - Son shells que orquestan Header, Footer, Sidebar, etc.
 * - No implementan UI directamente, solo coordinan composición
 */

export { PublicLayout } from './public-layout';
export { AuthLayout } from './auth-layout';
export { DashboardLayout } from './dashboard-layout';
