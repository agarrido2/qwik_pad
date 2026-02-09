import { component$, Slot } from '@builder.io/qwik';
import { cn } from '~/lib/utils/cn';

export interface ContainerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  class?: string;
}

export const Container = component$<ContainerProps>(
  ({ size = 'lg', class: className }) => {
    const maxWidths = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      full: 'max-w-full',
    };

    return (
      <div class={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', maxWidths[size], className)}>
        <Slot />
      </div>
    );
  }
);
