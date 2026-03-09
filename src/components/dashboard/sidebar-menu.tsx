import {
  component$,
  useContext,
  useStore,
  useTask$,
  useComputed$,
  type QRL,
  type JSXOutput,
} from "@builder.io/qwik";
import { Link, useLocation } from "@builder.io/qwik-city";
import { Popover, Tooltip } from "@qwik-ui/headless";
import { cn } from "~/lib/utils/cn";
import { IconMap } from "~/components/icons/dashboard-icons";
import { AuthContext } from "~/lib/context/auth.context";
import { getVisibleMenu, type ResolvedMenuItem } from "~/lib/config/menu.config";

interface MenuState {
  openItems:    Record<string, boolean>;
  openSubItems: Record<string, boolean>;
}

interface SidebarMenuProps {
  collapsed:    boolean;
  isMobile:     boolean;
  onNavigate$?: QRL<() => void>;
}

interface MenuItemNodeProps {
  item:         ResolvedMenuItem;
  itemKey:      string;
  pathname:     string;
  collapsed:    boolean;
  state:        MenuState;
  onNavigate$?: QRL<() => void>;
}

interface MenuChildNodeProps {
  child:        Exclude<ResolvedMenuItem["children"], undefined>[number];
  childKey:     string;
  pathname:     string;
  state:        MenuState;
  onNavigate$?: QRL<() => void>;
}

const getIcon = (name?: string): JSXOutput | null =>
  name ? (IconMap[name] ?? null) : null;

const isActive = (href: string | undefined, pathname: string): boolean =>
  !!href && (pathname === href || pathname.startsWith(href + "/"));

const hasActiveChild = (item: ResolvedMenuItem, pathname: string): boolean => {
  if (!item.children) return false;
  return item.children.some(
    (child) =>
      isActive(child.href, pathname) ||
      child.children?.some((sub) => isActive(sub.href, pathname))
  );
};

const hasActiveSubChild = (
  child: Exclude<ResolvedMenuItem["children"], undefined>[number],
  pathname: string
): boolean => {
  if (!child.children) return false;
  return child.children.some((sub) => isActive(sub.href, pathname));
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const SidebarMenu = component$<SidebarMenuProps>(
  ({ collapsed, isMobile, onNavigate$ }) => {
    const location = useLocation();
    const auth = useContext(AuthContext);

    const mainItems = useComputed$(() =>
      getVisibleMenu(auth.organization.role, "main"),
    );
    const workspaceItems = useComputed$(() =>
      getVisibleMenu(auth.organization.role, "workspace"),
    );

    const state = useStore<MenuState>({
      openItems:    {},
      openSubItems: {},
    });

    const effectivelyCollapsed = useComputed$(() => !isMobile && collapsed);

    useTask$(({ track }) => {
      const path = track(() => location.url.pathname);

      mainItems.value.forEach((item, idx) => {
        const key = `0-${idx}`;
        if (hasActiveChild(item, path)) {
          state.openItems         = {};
          state.openItems[key]    = true;
          item.children?.forEach((child, subIdx) => {
            if (hasActiveSubChild(child, path)) {
              state.openSubItems[`${key}-${subIdx}`] = true;
            }
          });
        }
      });

      workspaceItems.value.forEach((item, idx) => {
        const key = `1-${idx}`;
        if (hasActiveChild(item, path)) {
          state.openItems         = {};
          state.openItems[key]    = true;
          item.children?.forEach((child, subIdx) => {
            if (hasActiveSubChild(child, path)) {
              state.openSubItems[`${key}-${subIdx}`] = true;
            }
          });
        }
      });
    });

    useTask$(({ track }) => {
      const mobile = track(() => isMobile);
      if (mobile) {
        state.openItems    = {};
        state.openSubItems = {};
      }
    });

    return (
      <nav class="flex flex-col gap-6 px-3 py-4 flex-1">

        <div class="flex flex-col gap-0.5">
          {!effectivelyCollapsed.value && (
            <p class="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30 select-none">
              Principal
            </p>
          )}
          {mainItems.value.map((item, idx) => (
            <div key={item.href ?? item.text}>
              <MenuItemNode
                item={item}
                itemKey={`0-${idx}`}
                pathname={location.url.pathname}
                collapsed={effectivelyCollapsed.value}
                state={state}
                onNavigate$={onNavigate$}
              />
              {item.dividerAfter && !effectivelyCollapsed.value && (
                <div class="my-3 border-t border-white/10" />
              )}
            </div>
          ))}
        </div>

        <div class="flex-1" />

        <div class="flex flex-col gap-0.5">
          {!effectivelyCollapsed.value && (
            <p class="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30 select-none">
              Workspace
            </p>
          )}
          {workspaceItems.value.map((item, idx) => (
            <div key={item.href ?? item.text}>
              <MenuItemNode
                item={item}
                itemKey={`1-${idx}`}
                pathname={location.url.pathname}
                collapsed={effectivelyCollapsed.value}
                state={state}
                onNavigate$={onNavigate$}
              />
              {item.dividerAfter && !effectivelyCollapsed.value && (
                <div class="my-3 border-t border-white/10" />
              )}
            </div>
          ))}
        </div>

      </nav>
    );
  }
);

// ============================================================================
// NIVEL 1 — MenuItemNode
// ============================================================================

const MenuItemNode = component$<MenuItemNodeProps>(
  ({ item, itemKey, pathname, collapsed, state, onNavigate$ }) => {
    const active      = isActive(item.href, pathname);
    const childActive = hasActiveChild(item, pathname);
    const isOpen      = !!state.openItems[itemKey];
    const hasChildren = !!item.children?.length;
    const icon        = getIcon(item.icon);

    const baseClass = cn(
      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
      collapsed && "justify-center px-2"
    );

    const stateClass = cn(
      active
        ? "bg-white/20 text-white shadow-sm"
        : childActive || isOpen
          ? "bg-white/15 text-white"
          : "text-white/60 hover:bg-white/10 hover:text-white"
    );

    const tooltipPanelClass = [
      "[&[popover]]:bg-primary/95 [&[popover]]:text-white",
      "[&[popover]]:text-[12px] [&[popover]]:font-medium",
      "[&[popover]]:px-3 [&[popover]]:py-1.5",
      "[&[popover]]:rounded-lg [&[popover]]:shadow-xl",
      "[&[popover]]:border [&[popover]]:border-white/10",
    ];

    // ── Colapsado con children → Popover ──────────────────────────────────
    if (collapsed && hasChildren) {
      return (
        <Popover.Root floating="right" gutter={24}>
          <Popover.Trigger
            class={cn(baseClass, stateClass)}
         
          >
            {icon && (
              <span class={cn("shrink-0 h-4 w-4", childActive ? "text-white" : "text-white/70")}>
                {icon}
              </span>
            )}
          </Popover.Trigger>

          <Popover.Panel
            class={[
              "[&[popover]]:bg-primary [&[popover]]:rounded-xl [&[popover]]:shadow-xl",
              "[&[popover]]:border [&[popover]]:border-white/10",
              "[&[popover]]:p-2 [&[popover]]:min-w-[200px]",
            ]}
          >
            <p class="px-3 py-2 text-[11px] font-semibold uppercase tracking-widest text-white/40 select-none border-b border-white/10 mb-1">
              {item.text}
            </p>
            <ul>
              {item.children?.map((child) => (
                <li key={child.href ?? child.text}>
                  <Link
                    href={child.href}
                    onClick$={onNavigate$}
                    class={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-all",
                      isActive(child.href, pathname)
                        ? "text-secondary font-medium bg-white/10"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {child.text}
                  </Link>
                </li>
              ))}
            </ul>
          </Popover.Panel>
        </Popover.Root>
      );
    }

    // ── Colapsado sin children → Tooltip ──────────────────────────────────
    if (collapsed && !hasChildren) {
      return (
        <Tooltip.Root placement="right" gutter={16} delayDuration={200}>

         <Tooltip.Trigger
  class={cn(baseClass, stateClass)}
  onClick$={() => {
    if (item.href) window.location.href = item.href;
    onNavigate$?.();
  }}
>
  {icon && (
    <span class={cn("shrink-0 h-4 w-4", active ? "text-white" : "text-white/70")}>
      {icon}
    </span>
  )}
</Tooltip.Trigger>

          <Tooltip.Panel class={tooltipPanelClass}>
            {item.text}
          </Tooltip.Panel>
        </Tooltip.Root>
      );
    }

    // ── Expandido sin children ─────────────────────────────────────────────
    if (!hasChildren) {
      return (
        <Link
          href={item.href}
          onClick$={onNavigate$}
          class={cn(baseClass, stateClass)}
        >
          {icon && (
            <span class={cn("shrink-0 h-4 w-4", active ? "text-white" : "text-white/70")}>
              {icon}
            </span>
          )}
          <span class="truncate">{item.text}</span>
          {item.badge && (
            <span class="ml-auto shrink-0 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {item.badge}
            </span>
          )}
        </Link>
      );
    }

    // ── Expandido con children → acordeón ─────────────────────────────────
    return (
      <div>
        <button
          type="button"
          onClick$={() => {
            const wasOpen = state.openItems[itemKey];
            state.openItems = {};
            if (!wasOpen) state.openItems[itemKey] = true;
          }}
          class={cn(baseClass, stateClass)}
        >
          {icon && (
            <span class={cn("shrink-0 h-4 w-4", childActive || isOpen ? "text-white" : "text-white/70")}>
              {icon}
            </span>
          )}
          <span class="truncate flex-1 text-left">{item.text}</span>
          {item.badge && (
            <span class="shrink-0 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {item.badge}
            </span>
          )}
          <span class={cn(
            "shrink-0 h-4 w-4 text-white/40 transition-transform duration-200",
            isOpen && "rotate-180"
          )}>
            {IconMap["chevron"]}
          </span>
        </button>

        {isOpen && (
          <ul class="relative ms-2.5 ps-7.5 mt-1 mb-2 before:absolute before:h-full before:w-px before:left-[10px] before:top-0 before:bg-white/20">
            {item.children?.map((child, childIdx) => (
              <MenuChildNode
                key={child.href ?? child.text}
                child={child}
                childKey={`${itemKey}-${childIdx}`}
                pathname={pathname}
                state={state}
                onNavigate$={onNavigate$}
              />
            ))}
          </ul>
        )}
      </div>
    );
  }
);

// ============================================================================
// NIVEL 2 — MenuChildNode
// ============================================================================

const MenuChildNode = component$<MenuChildNodeProps>(
  ({ child, childKey, pathname, state, onNavigate$ }) => {
    const active      = isActive(child.href, pathname);
    const childActive = hasActiveSubChild(child, pathname);
    const isOpen      = !!state.openSubItems[childKey];
    const hasChildren = !!child.children?.length;

    const pointClass = cn(
      "before:hidden before:absolute before:rounded-full before:h-[9px] before:w-[9px] before:left-[-24px] before:top-[50%] before:translate-y-[-50%] before:bg-secondary hover:before:block",
      active && "before:!block"
    );

    const itemStateClass = cn(
      active
        ? "text-secondary font-medium"
        : childActive || isOpen
          ? "text-secondary/80"
          : "text-white/50 hover:text-secondary"
    );

    const itemBase = "relative flex items-center w-full py-1.5 text-[13px] transition-all";

    if (!hasChildren) {
      return (
        <li>
          <Link
            href={child.href}
            onClick$={onNavigate$}
            class={cn(itemBase, itemStateClass, pointClass)}
          >
            {child.text}
          </Link>
        </li>
      );
    }

    return (
      <li>
        <button
          type="button"
          onClick$={() => { state.openSubItems[childKey] = !isOpen; }}
          class={cn(itemBase, itemStateClass, pointClass)}
        >
          <span class="flex-1 text-left">{child.text}</span>
          <span class={cn(
            "shrink-0 h-3.5 w-3.5 text-white/40 transition-transform duration-200",
            isOpen && "rotate-180"
          )}>
            {IconMap["chevron"]}
          </span>
        </button>

        {isOpen && (
          <ul class="relative ms-2.5 ps-7.5 mt-1 mb-2 before:absolute before:h-full before:w-px before:left-[10px] before:top-0 before:bg-white/15">
            {child.children?.map((sub) => {
              const subActive = isActive(sub.href, pathname);
              return (
                <li key={sub.href ?? sub.text}>
                  <Link
                    href={sub.href}
                    onClick$={onNavigate$}
                    class={cn(
                      "relative flex items-center w-full py-1.5 text-[12px] transition-all",
                      "before:hidden before:absolute before:rounded-full before:h-1.75 before:w-1.75 before:left-[-24px] before:top-[50%] before:translate-y-[-50%] before:bg-secondary hover:before:block",
                      subActive
                        ? "text-secondary font-medium before:!block"
                        : "text-white/40 hover:text-secondary"
                    )}
                  >
                    {sub.text}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  }
);
