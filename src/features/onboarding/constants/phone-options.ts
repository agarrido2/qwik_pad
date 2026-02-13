
/**
 * Opciones de teléfonos agénticos disponibles
 * @description Lista temporal de números para el onboarding UI
 *
 * ⚠️ DEPRECATION NOTICE (13/02/2026):
 * - Esta lista es solo para la UI del onboarding (usuarios invited)
 * - La fuente de verdad es la tabla `public.assigned_numbers`
 * - La asignación REAL ocurre en /client/settings/agent cuando invited → admin
 * 
 * TODO: Migrar selector de onboarding a cargar dinámicamente desde BD
 * cuando el componente soporte async data loading
 */


export interface PhoneOption {
  /** Número de teléfono formateado */
  number: string;
  /** Número sin formatear (para API) */
  value: string;
  /** Prefijo/país */
  prefix: string;
  /** Descripción/ubicación */
  location: string;
  /** Indica si está disponible */
  available: boolean;
}

/**
 * Lista de teléfonos disponibles para selección
 * @description 5 números de prueba para el onboarding
 */
export const PHONE_OPTIONS: PhoneOption[] = [
  {
    number: "+34 919 930 992", // Este numero es que funciona.
    value: "+34919930992",
    prefix: "+34",
    location: "Madrid",
    available: true,
  },
  {
    number: "+34 910 123 002",
    value: "+34910123002",
    prefix: "+34",
    location: "Madrid",
    available: false,
  },
  {
    number: "+34 932 123 001",
    value: "+34932123001",
    prefix: "+34",
    location: "Barcelona",
    available: false,
  },
  {
    number: "+34 954 123 001",
    value: "+34954123001",
    prefix: "+34",
    location: "Sevilla",
    available: false,
  },
  {
    number: "+34 963 123 001",
    value: "+34963123001",
    prefix: "+34",
    location: "Valencia",
    available: false,
  },
];

/**
 * Obtiene un teléfono por su valor
 */
export function getPhoneByValue(value: string): PhoneOption | undefined {
  return PHONE_OPTIONS.find((phone) => phone.value === value);
}

/**
 * Obtiene solo los teléfonos disponibles
 */
export function getAvailablePhones(): PhoneOption[] {
  return PHONE_OPTIONS.filter((phone) => phone.available);
}
