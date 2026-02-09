/**
 * Dashboard Layout - Envuelve las páginas del dashboard con sidebar + header
 * Auth guard ya ejecutado en (app)/layout.tsx
 */

import { component$, Slot } from '@builder.io/qwik';
import { DashboardLayout } from '~/components/layouts';

export default component$(() => {
  return (
    <DashboardLayout>
      <Slot />
    </DashboardLayout>
  );
});
