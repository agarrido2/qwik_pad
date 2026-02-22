/**
 * SectorSelector - Grid de sectores con iconos para selección en onboarding
 */

import { component$, type QRL } from '@builder.io/qwik';
import { cn } from '~/lib/utils/cn';

export interface SectorOption {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export interface SectorSelectorProps {
  sectors: SectorOption[];
  selected?: string;
  selectedSlug?: string; // Backward compatibility
  onSelect$: QRL<(slug: string) => void>;
}

export const SectorSelector = component$<SectorSelectorProps>(
  ({ sectors, selected, selectedSlug, onSelect$ }) => {
    const activeSlug = selected || selectedSlug || '';

    return (
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Selecciona tu sector">
        {sectors.map((sector) => (
          <button
            key={sector.slug}
            type="button"
            role="radio"
            aria-checked={activeSlug === sector.slug}
            onClick$={() => onSelect$(sector.slug)}
            class={cn(
              'flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all',
              'hover:border-primary-400 hover:bg-primary-50/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              activeSlug === sector.slug
                ? 'border-primary-600 bg-primary-50 shadow-sm'
                : 'border-neutral-200 bg-white'
            )}
          >
            <span class="text-2xl" aria-hidden="true">{sector.icon}</span>
            <div>
              <span class="text-sm font-semibold text-neutral-900">{sector.name}</span>
              <p class="mt-0.5 text-xs text-neutral-500">{sector.description}</p>
            </div>
          </button>
        ))}
      </div>
    );
  },
);
