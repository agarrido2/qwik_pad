/**
 * Notification User Button - Botón de notificaciones del header
 *
 * Muestra el ícono de notificaciones con un badge numérico cuando hay
 * notificaciones sin leer.
 */

import { component$ } from "@builder.io/qwik";
import { NotificationIcon } from "~/components/icons/notification-icon";
import { Badge, Button } from "~/components/ui";

interface NotificationUserProps {
  /** Número de notificaciones sin leer */
  count?: number;
}

export const NotificationUser = component$<NotificationUserProps>(
  ({ count = 0 }) => {
    return (
      <Button
        variant="ghost"
        size="icon"
        class="text-gray-700 hover:bg-gray-200 hover:text-gray-900"
        title={
          count > 0 ? `${count} notificaciones sin leer` : "Sin notificaciones"
        }
      >
        <NotificationIcon aria-hidden="true" class="h-6 w-6" />
        {/* Badge de notificaciones */}
        {count > 0 && (
          <Badge
            variant="error"
            class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px] font-bold"
          >
            {count > 9 ? "9+" : count}
          </Badge>
        )}
      </Button>
    );
  },
);
