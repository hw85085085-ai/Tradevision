
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Book,
  BarChart,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/journal', icon: Book, label: 'Journal' },
  { href: '/analytics', icon: BarChart, label: 'Analytics' },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card p-2 md:hidden">
      <div className="grid grid-cols-4 gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-md p-2 text-xs font-medium',
              pathname === item.href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        ))}
        <button
            onClick={handleSignOut}
            className={cn(
              'flex flex-col items-center justify-center gap-1 rounded-md p-2 text-xs font-medium',
              'text-muted-foreground hover:bg-muted'
            )}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
      </div>
    </nav>
  );
}
