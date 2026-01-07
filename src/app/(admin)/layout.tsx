'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/timesheets', label: 'Timesheets' },
  { href: '/invoices', label: 'Invoices' },
  { href: '/clients', label: 'Clients' },
  { href: '/analytics', label: 'Analytics' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-semibold">
            Invoice Hub
          </Link>
          <div className="flex gap-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  pathname === item.href &&
                    'bg-accent text-accent-foreground'
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </div>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
