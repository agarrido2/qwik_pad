/**
 * Select Component - Custom dropdown con estilo moderno
 * Diseño "cool" con iconos y descripciones
 */

import { component$, useSignal, $, type QRL } from '@builder.io/qwik';
import { cn } from '~/lib/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface SelectProps {
  name: string;
  options: SelectOption[];
  value?: string;
  onChange$: QRL<(value: string) => void>;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  class?: string;
}

export const Select = component$<SelectProps>(
  ({
    name,
    options,
    value,
    onChange$,
    placeholder = 'Selecciona una opción',
    label,
    required = false,
    error,
    class: className,
  }) => {
    const isOpen = useSignal(false);
    const selectedOption = options.find(opt => opt.value === value);

    const toggleDropdown = $(() => {
      isOpen.value = !isOpen.value;
    });

    const selectOption = $((optionValue: string) => {
      onChange$(optionValue);
      isOpen.value = false;
    });

    return (
      <div class={cn('relative', className)}>
        {label && (
          <label class="mb-2 block text-sm font-medium text-neutral-700">
            {label}
            {required && <span class="ml-1 text-error" aria-label="obligatorio">*</span>}
          </label>
        )}

        {/* Hidden input for form submission */}
        <input type="hidden" name={name} value={value || ''} />

        {/* Custom Trigger Button */}
        <button
          type="button"
          onClick$={toggleDropdown}
          class={cn(
            'relative w-full rounded-lg border-2 bg-white px-4 py-3 text-left transition-all',
            'hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500',
            error ? 'border-error' : 'border-neutral-200',
            !selectedOption && 'text-neutral-400'
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen.value}
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              {selectedOption?.icon && (
                <span class="text-2xl" aria-hidden="true">
                  {selectedOption.icon}
                </span>
              )}
              <div>
                <div class="font-medium text-neutral-900">
                  {selectedOption?.label || placeholder}
                </div>
                {selectedOption?.description && (
                  <div class="text-xs text-neutral-500">
                    {selectedOption.description}
                  </div>
                )}
              </div>
            </div>
            <svg
              class={cn(
                'h-5 w-5 text-neutral-400 transition-transform',
                isOpen.value && 'rotate-180'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen.value && (
          <div class="absolute z-10 mt-2 w-full rounded-lg border border-neutral-200 bg-white shadow-xl">
            <ul class="max-h-80 overflow-auto py-2" role="listbox">
              {options.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick$={() => selectOption(option.value)}
                    class={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                      'hover:bg-primary-50',
                      option.value === value && 'bg-primary-100'
                    )}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    {option.icon && (
                      <span class="text-2xl" aria-hidden="true">
                        {option.icon}
                      </span>
                    )}
                    <div class="flex-1">
                      <div class="font-medium text-neutral-900">
                        {option.label}
                      </div>
                      {option.description && (
                        <div class="text-xs text-neutral-500">
                          {option.description}
                        </div>
                      )}
                    </div>
                    {option.value === value && (
                      <svg class="h-5 w-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <p class="mt-1 text-sm text-error" role="alert">
            {error}
          </p>
        )}

        {/* Overlay to close dropdown when clicking outside */}
        {isOpen.value && (
          <div
            class="fixed inset-0 z-0"
            onClick$={toggleDropdown}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }
);
