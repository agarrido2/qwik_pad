/**
 * UI Components - Barrel Export
 * 
 * Punto de entrada centralizado para todos los componentes UI del sistema de diseño.
 * 
 * Importación recomendada:
 * import { Button, Input, Card } from '~/components/ui'
 * 
 * Nota: Los tipos de variantes (ButtonVariant, etc.) ahora se infieren automáticamente
 * desde CVA mediante VariantProps<>. No es necesario exportarlos manualmente.
 */

export { Button, type ButtonProps } from './button';
export { Input, type InputProps } from './input';
export { Select, type SelectProps, type SelectOption } from './select';
export { FormField, type FormFieldProps } from './form-field';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  type CardProps,
} from './card';
export { Spinner, type SpinnerProps } from './spinner';
export { Alert, type AlertProps } from './alert';
export { Dropdown, DropdownItem, DropdownSeparator } from './dropdown';
export { Avatar, type AvatarProps } from './avatar';
