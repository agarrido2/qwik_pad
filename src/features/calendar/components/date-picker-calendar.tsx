/**
 * Date Picker Calendar - Mini calendario mensual para navegación rápida.
 *
 * Componente SSR puro (sin useVisibleTask$). Se apoya en Date API nativa
 * y emite la fecha seleccionada hacia la ruta orquestadora.
 */

import {
  $, 
  component$,
  useComputed$,
  useSignal,
  type QRL,
  type Signal,
} from '@builder.io/qwik';

interface DatePickerCalendarProps {
  selectedDate: Signal<string>;
  onDateSelect$: QRL<(dateIso: string) => void>;
}

interface CalendarDay {
  isoDate: string;
  dayNumber: number;
  inCurrentMonth: boolean;
}

const WEEK_DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];

const toIsoDate = (date: Date): string => date.toISOString().split('T')[0] ?? '';

const getMonthStart = (baseDate: Date): Date =>
  new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);

const addMonths = (baseDate: Date, months: number): Date =>
  new Date(baseDate.getFullYear(), baseDate.getMonth() + months, 1);

const buildMonthGrid = (monthStart: Date): CalendarDay[] => {
  const startOffset = (monthStart.getDay() + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);

    return {
      isoDate: toIsoDate(day),
      dayNumber: day.getDate(),
      inCurrentMonth: day.getMonth() === monthStart.getMonth(),
    };
  });
};

/**
 * Mini calendario mensual con selección de fecha y navegación por mes.
 */
export const DatePickerCalendar = component$<DatePickerCalendarProps>(
  ({ selectedDate, onDateSelect$ }) => {
    const selectedBaseDate = new Date(selectedDate.value);
    const visibleMonth = useSignal(getMonthStart(selectedBaseDate));
    const todayIso = toIsoDate(new Date());

    const monthLabel = useComputed$(() =>
      visibleMonth.value.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      })
    );

    const days = useComputed$(() => buildMonthGrid(visibleMonth.value));

    const goToPreviousMonth$ = $(() => {
      visibleMonth.value = addMonths(visibleMonth.value, -1);
    });

    const goToNextMonth$ = $(() => {
      visibleMonth.value = addMonths(visibleMonth.value, 1);
    });

    const handleSelectDay$ = $(async (isoDate: string) => {
      selectedDate.value = isoDate;
      await onDateSelect$(isoDate);
    });

    return (
      <section class="rounded-lg border border-border bg-card p-4" aria-label="Selector de fecha">
        <header class="mb-3 flex items-center justify-between">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Mes anterior"
            onClick$={goToPreviousMonth$}
          >
            ‹
          </button>

          <p class="text-sm font-semibold capitalize text-foreground">{monthLabel.value}</p>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Mes siguiente"
            onClick$={goToNextMonth$}
          >
            ›
          </button>
        </header>

        <div class="grid grid-cols-7 gap-1">
          {WEEK_DAYS.map((dayName) => (
            <span
              key={dayName}
              class="text-center text-[11px] font-medium text-muted-foreground"
              aria-hidden="true"
            >
              {dayName}
            </span>
          ))}

          {days.value.map((day) => {
            const isSelected = selectedDate.value === day.isoDate;
            const isToday = todayIso === day.isoDate;

            return (
              <button
                key={day.isoDate}
                type="button"
                onClick$={() => handleSelectDay$(day.isoDate)}
                aria-label={`Seleccionar ${day.isoDate}`}
                class={[
                  'flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors',
                  day.inCurrentMonth
                    ? 'text-foreground hover:bg-accent'
                    : 'text-muted-foreground/60 hover:bg-accent/60',
                  isToday && !isSelected && 'bg-primary/10 text-primary',
                  isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                ]}
              >
                {day.dayNumber}
              </button>
            );
          })}
        </div>
      </section>
    );
  }
);
