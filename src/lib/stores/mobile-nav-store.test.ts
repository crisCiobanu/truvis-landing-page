import { describe, it, expect, beforeEach } from 'vitest';
import {
  $mobileNavOpen,
  openMobileNav,
  closeMobileNav,
  toggleMobileNav,
} from './mobile-nav-store';

describe('mobile-nav-store', () => {
  beforeEach(() => {
    // Reset the atom between tests. This is the ONLY place where we
    // touch `.set()` directly — consumers outside the store module
    // must use the action functions (decision 4c).
    $mobileNavOpen.set(false);
  });

  it('defaults to closed', () => {
    expect($mobileNavOpen.get()).toBe(false);
  });

  it('openMobileNav() sets the atom to true', () => {
    openMobileNav();
    expect($mobileNavOpen.get()).toBe(true);
  });

  it('closeMobileNav() sets the atom to false', () => {
    openMobileNav();
    closeMobileNav();
    expect($mobileNavOpen.get()).toBe(false);
  });

  it('toggleMobileNav() flips between states', () => {
    expect($mobileNavOpen.get()).toBe(false);
    toggleMobileNav();
    expect($mobileNavOpen.get()).toBe(true);
    toggleMobileNav();
    expect($mobileNavOpen.get()).toBe(false);
  });
});
