import { component$, Slot } from '@builder.io/qwik';
import { cn } from '~/lib/utils/cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  class?: string;
}

export const Alert = component$<AlertProps>(
  ({ variant = 'info', title, class: className }) => {
    const variants = {
      info: 'border-info/50 bg-info/10 text-info',
      success: 'border-success/50 bg-success/10 text-success',
      warning: 'border-warning/50 bg-warning/10 text-warning',
      error: 'border-error/50 bg-error/10 text-error',
    };

    const icons = {
      info: (
        <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      success: (
        <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      warning: (
        <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      error: (
        <svg class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };

    return (
      <div
        class={cn(
          'flex gap-3 rounded-lg border p-4',
          variants[variant],
          className
        )}
        role="alert"
      >
        {icons[variant]}
        
        <div class="flex-1">
          {title && (
            <h4 class="mb-1 font-semibold">{title}</h4>
          )}
          <div class="text-sm">
            <Slot />
          </div>
        </div>
      </div>
    );
  }
);
