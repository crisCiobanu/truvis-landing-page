/**
 * MobileNav — React island for the header drawer (Story 1.4 AC2)
 *
 * Hydrated `client:idle` from `header.astro`. Reads/writes the
 * `$mobileNavOpen` nanostore so the plain Astro trigger button can
 * share state with this component without a direct import cycle.
 *
 * Radix's Dialog (shadcn `Sheet`) handles focus-trap + Escape-to-close
 * + `aria-*` wiring, so this island stays intentionally minimal.
 */
import { useStore } from '@nanostores/react';
import { Menu, X } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  $mobileNavOpen,
  closeMobileNav,
  openMobileNav,
} from '@/lib/stores/mobile-nav-store';

export interface NavItem {
  label: string;
  href: string;
}

interface MobileNavProps {
  navItems: NavItem[];
  /** a11y label for the trigger button */
  triggerLabel?: string;
}

export function MobileNav({
  navItems,
  triggerLabel = 'Open navigation menu',
}: MobileNavProps) {
  const open = useStore($mobileNavOpen);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => (next ? openMobileNav() : closeMobileNav())}
    >
      {/*
       * We render our own trigger (instead of `<SheetTrigger>`) so that
       * the button still has a 44x44 touch target (UX-DR26) and uses
       * the nanostore action — keeps state source-of-truth in one place.
       */}
      <button
        type="button"
        aria-label={triggerLabel}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        onClick={openMobileNav}
        className="inline-flex h-11 w-11 items-center justify-center rounded-md text-[var(--color-primary)] transition-colors hover:bg-[var(--color-surface-3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-teal)]"
      >
        {open ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      <SheetContent
        id="mobile-nav-drawer"
        side="right"
        className="flex w-full flex-col gap-6 bg-[var(--color-bg)] sm:max-w-sm"
      >
        <SheetHeader>
          <SheetTitle className="text-left text-[var(--color-primary)]">
            Menu
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Mobile">
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={closeMobileNav}
                  className="flex min-h-11 items-center rounded-md px-3 py-2 text-lg font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-surface-3)] hover:text-[var(--color-teal)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-teal)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNav;
