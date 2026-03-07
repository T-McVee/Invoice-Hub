'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
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
  Menu,
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
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#e85d26" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      {/* Ambient background effects */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />
      <div className="fixed inset-0 noise pointer-events-none" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
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

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border/30">
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
                      isActive && ['bg-card text-foreground shadow-sm', 'hover:bg-card']
                    )}
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          'h-4 w-4 transition-colors',
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <span
                        className={cn(
                          'font-medium',
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
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

            <div className="flex items-center gap-2">
              {/* Mobile Navigation Drawer */}
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-accent/80"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <span className="text-lg font-bold tracking-tight">
                        Invoice<span className="text-primary">Hub</span>
                      </span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 px-4">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;

                      return (
                        <Button
                          key={item.href}
                          asChild
                          variant="ghost"
                          className={cn(
                            'justify-start gap-3 px-4 py-3 rounded-lg transition-all',
                            'hover:bg-accent/80',
                            isActive && ['bg-card text-foreground shadow-sm', 'hover:bg-card']
                          )}
                        >
                          <Link
                            href={item.href}
                            onClick={() => setSheetOpen(false)}
                          >
                            <Icon
                              className={cn(
                                'h-5 w-5 transition-colors',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                              )}
                            />
                            <span
                              className={cn(
                                'font-medium',
                                isActive ? 'text-foreground' : 'text-muted-foreground'
                              )}
                            >
                              {item.label}
                            </span>
                          </Link>
                        </Button>
                      );
                    })}
                    <hr className="my-2 border-border/40" />
                    <Button
                      asChild
                      variant="ghost"
                      className="justify-start gap-3 px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-accent/80"
                    >
                      <a href="/.auth/logout">
                        <LogOut className="h-5 w-5" />
                        <span className="font-medium">Logout</span>
                      </a>
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>

              {/* Logout Button (desktop) */}
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="hidden lg:flex text-muted-foreground hover:text-foreground hover:bg-accent/80"
              >
                <a href="/.auth/logout" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span className="font-medium">Logout</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-fade-up">{children}</div>
      </main>
    </div>
  );
}
