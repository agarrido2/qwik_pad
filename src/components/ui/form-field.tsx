import { component$ } from '@builder.io/qwik';
import { Input, type InputProps } from './input';

export interface FormFieldProps extends Omit<InputProps, 'name'> {
  name: string;
  label: string;
  helperText?: string;
}

/**
 * FormField - Input con label y helper text integrados
 * Simplifica formularios reduciendo boilerplate
 */
export const FormField = component$<FormFieldProps>(
  ({ name, label, helperText, error, ...inputProps }) => {
    const helperId = `${name}-helper`;

    return (
      <div class="flex flex-col gap-1">
        <Input
          name={name}
          label={label}
          error={error}
          aria-describedby={helperText && !error ? helperId : undefined}
          {...inputProps}
        />
        
        {helperText && !error && (
          <p id={helperId} class="text-xs text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
