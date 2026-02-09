/**
 * Layout Raíz - Punto de entrada de todas las rutas
 * Solo renderiza el Slot, los layouts de grupo ((public), (auth), (app))
 * se encargan de su propio header/footer/sidebar.
 */

import { component$, Slot } from '@builder.io/qwik';

export default component$(() => {
  return <Slot />;
});
