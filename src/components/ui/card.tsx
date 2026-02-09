import { component$, Slot } from '@builder.io/qwik';
import { cn } from '~/lib/utils/cn';

export interface CardProps {
  class?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card = component$<CardProps>(
  ({ class: className, padding = 'md', hover = false }) => {
    const paddingVariants = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        class={cn(
          'rounded-lg border border-neutral-200 bg-white shadow-sm',
          paddingVariants[padding],
          hover && 'transition-shadow hover:shadow-md',
          className
        )}
      >
        <Slot />
      </div>
    );
  }
);

export const CardHeader = component$<{ class?: string }>(({ class: className }) => {
  return (
    <div class={cn('mb-4 space-y-1', className)}>
      <Slot />
    </div>
  );
});

export const CardTitle = component$<{ class?: string }>(({ class: className }) => {
  return (
    <h3 class={cn('text-xl font-semibold text-neutral-900', className)}>
      <Slot />
    </h3>
  );
});

export const CardDescription = component$<{ class?: string }>(({ class: className }) => {
  return (
    <p class={cn('text-sm text-neutral-600', className)}>
      <Slot />
    </p>
  );
});

export const CardContent = component$<{ class?: string }>(({ class: className }) => {
  return (
    <div class={cn('', className)}>
      <Slot />
    </div>
  );
});

export const CardFooter = component$<{ class?: string }>(({ class: className }) => {
  return (
    <div class={cn('mt-4 flex items-center gap-2', className)}>
      <Slot />
    </div>
  );
});
