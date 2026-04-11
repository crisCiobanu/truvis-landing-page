import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/ModeToggle';
import { siteConfig } from '@/config/site';
import type { NavigationItem } from '@/config/site';
import { Home, FileText, Scale, Book } from 'lucide-react';

// Map navigation items to their corresponding icons
const iconMap = {
  '/': Home,
  '/blog': Book,
  '/readme': FileText,
  '/mit-license': Scale,
} as const;

const navigation: NavigationItem[] = siteConfig.navigation.map((item) => ({
  ...item,
  icon: iconMap[item.path as keyof typeof iconMap],
}));

// Components
const DesktopSidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [activePath, setActivePath] = useState('');

  useEffect(() => {
    setActivePath(window.location.pathname);
    const handleRouteChange = () => setActivePath(window.location.pathname);
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  return (
    <aside
      className={cn(
        'fixed left-0 z-[60] h-screen bg-[var(--sidebar-bg)]',
        'group flex flex-col transition-all duration-300 ease-out',
        'w-[64px] hover:w-64' // Fixed width for non-open state
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-16 items-center justify-center">
        <img
          src={isHovered ? '/logo.svg' : '/icon.svg'}
          alt="Logo"
          className="h-8 transition-opacity duration-300"
        />
      </div>

      <nav className="flex-1 pl-1" aria-label="Main navigation">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.path;
          return (
            <a
              key={item.path}
              href={item.path}
              aria-label={item.title}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-12 items-center gap-4 px-4',
                'text-[hsl(var(--sidebar-fg))] hover:bg-[var(--sidebar-hover)]',
                'transition-colors duration-200',
                isActive && 'bg-[var(--sidebar-active)]'
              )}
            >
              <Icon className="h-5 w-5 min-w-[20px]" />
              <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {item.title}
              </span>
            </a>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="flex items-center gap-4">
          <ModeToggle />
          <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Toggle Theme
          </span>
        </div>
      </div>
    </aside>
  );
};

export function Sidebar() {
  return <DesktopSidebar />;
}
