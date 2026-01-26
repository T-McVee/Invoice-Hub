'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Receipt,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/timesheets', label: 'Timesheets', icon: FileSpreadsheet },
  { href: '/invoices', label: 'Invoices', icon: Receipt },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md group-hover:blur-lg transition-all" />
                <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight">
                Invoice<span className="text-primary">Hub</span>
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border/30">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'relative px-4 py-2 rounded-lg transition-all duration-300',
                      'hover:bg-accent/80',
                      isActive && [
                        'bg-card text-foreground shadow-sm',
                        'hover:bg-card',
                      ]
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          'h-4 w-4 transition-colors',
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <span className={cn(
                        'font-medium',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {item.label}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                      )}
                    </Link>
                  </Button>
                );
              })}
            </div>

            {/* Logout Button */}
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent/80"
            >
              <a href="/.auth/logout" className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Logout</span>
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="animate-fade-up">{children}</div>
      </main>
    </div>
  );
}
