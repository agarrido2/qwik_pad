/**
 * Dashboard Components - Barrel export
 * 
 * Componentes específicos de la feature dashboard.
 * Según ARQUITECTURA_FOLDER.md: componentes de app van en components/dashboard/
 * NO en components/layout/ (que es solo para shells orquestadores)
 */

export { DashboardSidebar } from './dashboard-sidebar';
export { DashboardHeader } from './dashboard-header';
export { DashboardFooter } from './dashboard-footer';
export { MetricCard, type MetricCardProps } from './metric-card';
export { RecentCallsTable, type RecentCallsTableProps, type CallRecord } from './recent-calls-table';
