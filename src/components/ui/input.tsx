import { component$, type QRL } from '@builder.io/qwik';
import { cn } from '~/lib/utils/cn';

export interface InputProps {
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  onInput$?: QRL<(event: Event) => void>;
  class?: string;
  autocomplete?: string;
  'aria-describedby'?: string;
}

export const Input = component$<InputProps>(
  ({
    name,
    type = 'text',
    value,
    placeholder,
    disabled = false,
    error,
    label,
    required = false,
    helperText,
    onInput$,
    autocomplete,
    class: className,
    'aria-describedby': ariaDescribedby,
  }) => {
    const inputId = `input-${name}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div class={cn('flex flex-col gap-1', className)}>
        {label && (
          <label for={inputId} class="text-sm font-medium text-neutral-700">
            {label}
            {required && <span class="ml-1 text-error" aria-label="obligatorio">*</span>}
          </label>
        )}
        
        <input
          id={inputId}
          name={name}
          type={type}
          {...(value !== undefined && { value })}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autocomplete={autocomplete}
          onInput$={onInput$}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : (helperText ? helperId : ariaDescribedby)}
          class={cn(
            'h-10 w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors',
            'placeholder:text-neutral-400',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-error focus-visible:ring-error'
              : 'border-neutral-300 hover:border-neutral-400'
          )}
        />

        {helperText && !error && (
          <p id={helperId} class="text-xs text-neutral-500">
            {helperText}
          </p>
        )}

        {error && (
          <p id={errorId} class="text-sm text-error leading-relaxed" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
