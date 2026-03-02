import { component$, Slot } from "@builder.io/qwik";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        primary: "bg-accent text-foreground",
        success: "bg-success text-success-foreground",
        warning: "bg-warning text-warning-foreground",
        error: "bg-error text-error-foreground",
        info: "bg-info text-info-foreground",
        default: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends VariantProps<typeof badgeVariants> {
  class?: string;
}

export const Badge = component$<BadgeProps>(({ variant, class: className }) => {
  return (
    <span class={cn(badgeVariants({ variant }), className)}>
      <Slot />
    </span>
  );
});
