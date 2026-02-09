/**
 * IndustrySelector - Grid de sectores con iconos para selección en onboarding
 */

import { component$, type QRL } from '@builder.io/qwik';
import { cn } from '~/lib/utils/cn';

export interface IndustryOption {
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export interface IndustrySelectorProps {
  industries: IndustryOption[];
  selectedSlug?: string;
  onSelect$: QRL<(slug: string) => void>;
}

export const IndustrySelector = component$<IndustrySelectorProps>(
  ({ industries, selectedSlug, onSelect$ }) => {
    return (
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="radiogroup" aria-label="Selecciona tu sector">
        {industries.map((industry) => (
          <button
            key={industry.slug}
            type="button"
            role="radio"
            aria-checked={selectedSlug === industry.slug}
            onClick$={() => onSelect$(industry.slug)}
            class={cn(
              'flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-all',
              'hover:border-primary-400 hover:bg-primary-50/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              selectedSlug === industry.slug
                ? 'border-primary-600 bg-primary-50 shadow-sm'
                : 'border-neutral-200 bg-white'
            )}
          >
            <span class="text-2xl" aria-hidden="true">{industry.icon}</span>
            <div>
              <span class="text-sm font-semibold text-neutral-900">{industry.name}</span>
              <p class="mt-0.5 text-xs text-neutral-500">{industry.description}</p>
            </div>
          </button>
        ))}
      </div>
    );
  }
);
