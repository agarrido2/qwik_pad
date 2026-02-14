/**
 * MetricCard - Tarjeta de métrica con indicador de tendencia
 * 
 * Componente UI puro para mostrar KPIs con:
 * - Título descriptivo (ej: "Llamadas hoy")
 * - Valor principal (número o string formateado)
 * - Badge de tendencia con flecha y porcentaje
 * - Icono representativo con color de fondo
 * 
 * Pattern: Componente presentacional sin lógica de negocio
 * Los datos vienen desde el parent (dashboard/index.tsx)
 * 
 * IMPORTANTE: El icono debe ser string que mapea a iconos internos
 * para evitar problemas de serialización en Qwik
 */

import { component$, type JSXOutput } from '@builder.io/qwik';
import { cn } from '~/lib/utils/cn';

export interface MetricCardProps {
  /** Título de la métrica (ej: "Llamadas hoy") */
  title: string;
  
  /** Valor principal a mostrar (puede ser número o string formateado) */
  value: string | number;
  
  /** Tendencia en porcentaje (positivo = mejora, negativo = empeora) */
  trend?: number;
  
  /** Nombre del icono (mapeado internamente) */
  icon: 'phone' | 'check-circle' | 'clock' | 'sparkles';
  
  /** Color temático de la tarjeta */
  color?: 'primary' | 'success' | 'warning' | 'neutral';
}

/**
 * Helper: Mapea nombre de icono a JSX element
 * Pattern: Evitamos pasar componentes como props para serialización
 */
const getIcon = (iconName: MetricCardProps['icon']): JSXOutput => {
  const icons = {
    phone: (
      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    ),
    'check-circle': (
      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    clock: (
      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    sparkles: (
      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
  };
  
  return icons[iconName];
};

/**
 * Helper: Mapea color a clases de fondo del icono
 */
const getIconBgColor = (color: MetricCardProps['color']) => {
  const colors = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    neutral: 'bg-neutral-100 text-neutral-600',
  };
  return colors[color ?? 'neutral'];
};

/**
 * Helper: Renderiza badge de tendencia con flecha
 * Verde para positivo, rojo para negativo
 */
const TrendBadge = component$<{ trend: number }>(({ trend }) => {
  const isPositive = trend >= 0;
  
  return (
    <div
      class={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        isPositive
          ? 'bg-green-50 text-green-700'
          : 'bg-red-50 text-red-700'
      )}
    >
      {/* Flecha arriba/abajo */}
      <svg
        class="h-3 w-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        {isPositive ? (
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        ) : (
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        )}
      </svg>
      <span>{Math.abs(trend)}%</span>
    </div>
  );
});

export const MetricCard = component$<MetricCardProps>(
  ({ title, value, trend, icon, color = 'neutral' }) => {
    return (
      <div class="bg-white rounded-lg border border-neutral-200 p-6 transition-shadow hover:shadow-md">
        <div class="flex items-start justify-between">
          {/* Sección izquierda: Título + Valor + Trend */}
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-neutral-500 truncate">
              {title}
            </p>
            
            <p class="mt-2 text-3xl font-bold text-neutral-900 tracking-tight">
              {value}
            </p>
            
            {/* Badge de tendencia (opcional) */}
            {trend !== undefined && (
              <div class="mt-2">
                <TrendBadge trend={trend} />
              </div>
            )}
          </div>

          {/* Sección derecha: Icono en círculo */}
          <div
            class={cn(
              'flex-shrink-0 rounded-lg p-3',
              getIconBgColor(color)
            )}
          >
            {getIcon(icon)}
          </div>
        </div>
      </div>
    );
  }
);

