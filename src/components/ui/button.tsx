import { component$, Slot, type QRL } from '@builder.io/qwik';
import { cn } from '~/lib/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  onClick$?: QRL<() => void>;
  class?: string;
  'aria-label'?: string;
}

export const Button = component$<ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    onClick$,
    class: className,
    'aria-label': ariaLabel,
  }) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50';

    const variants: Record<ButtonVariant, string> = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
      secondary: 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300 active:bg-neutral-400',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100',
      ghost: 'text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200',
      danger: 'bg-error text-white hover:bg-red-600 active:bg-red-700',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-10 px-4 text-base rounded-md',
      lg: 'h-12 px-6 text-lg rounded-lg',
    };

    return (
      <button
        type={type}
        disabled={disabled || loading}
        onClick$={onClick$}
        class={cn(baseStyles, variants[variant], sizes[size], className)}
        aria-label={ariaLabel}
        aria-busy={loading}
      >
        {loading && (
          <svg class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        <Slot />
      </button>
    );
  }
);
