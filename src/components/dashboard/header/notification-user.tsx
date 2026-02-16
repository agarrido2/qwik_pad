/**
 * Notification User Button - Botón de notificaciones del header
 *
 * Muestra el ícono de notificaciones con un badge numérico cuando hay
 * notificaciones sin leer.
 */

import { component$ } from '@builder.io/qwik';
import { NotificationIcon } from '~/components/icons/notification-icon';
import { Button } from '~/components/ui';

interface NotificationUserProps {
  /** Número de notificaciones sin leer */
  count?: number;
}

export const NotificationUser = component$<NotificationUserProps>(({ count = 0 }) => {
  return (
   <Button variant="ghost" size="icon" title={count > 0 ? `${count} notificaciones sin leer` : 'Sin notificaciones'}>
      <NotificationIcon aria-hidden="true" class="h-6 w-6" />
      {/* Badge de notificaciones */}
      {count > 0 && (
        <span class="absolute top-1 right-1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Button>
  );
});
