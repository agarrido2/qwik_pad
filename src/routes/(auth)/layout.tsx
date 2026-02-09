/**
 * Layout de autenticación - Centrado con logo
 */

import { component$, Slot } from '@builder.io/qwik';
import { AuthLayout } from '~/components/layouts';

export default component$(() => {
  return (
    <AuthLayout>
      <Slot />
    </AuthLayout>
  );
});
