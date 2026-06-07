'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Loader2, LayoutDashboard, Briefcase, FileText, User, Building2, Settings, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/logo';
import { LoadingScreen } from '@/components/loading-screen';

const usherNav = [
  { href: '/dashboard/usher', label: 'Overview', icon: LayoutDashboard },
  { href: '/jobs', label: 'Browse Jobs', icon: Briefcase },
  { href: '/dashboard/usher?tab=applications', label: 'Applications', icon: FileText },
  { href: '/dashboard/usher?tab=profile', label: 'My Profile', icon: User },
];

const employerNav = [
  { href: '/dashboard/employer', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/employer?tab=jobs', label: 'My Jobs', icon: Briefcase },
  { href: '/dashboard/employer?tab=applications', label: 'Applications', icon: FileText },
  { href: '/dashboard/employer?tab=company', label: 'Company', icon: Building2 },
];

const adminNav = [
  { href: '/dashboard/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'All Jobs', icon: Briefcase },
  { href: '/companies', label: 'All Companies', icon: Building2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return <LoadingScreen />;
  }

  const role = user?.role?.toLowerCase();
  const navItems = role === 'admin' ? adminNav : role === 'employer' ? employerNav : usherNav;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="hidden md:flex w-60 flex-col fixed top-16 bottom-0 left-0 border-r border-border bg-sidebar z-40">
        {/* Brand logo at top of sidebar */}
        <div className="p-5 border-b border-border flex justify-center bg-transparent">
          <Logo size="sm" />
        </div>

        {/* User info */}
        <div className="p-5 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-1 ring-border">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user?.firstName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-card-foreground truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground truncate">
                {role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground px-3 py-2 mt-1">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== `/dashboard/${role}` && pathname.startsWith(item.href.split('?')[0]));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-accent text-accent-foreground border border-border'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                <span className="font-medium tracking-wide">{item.label}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-foreground" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-border space-y-0.5">
          <Link
            href={role === 'employer' ? '/dashboard/employer?tab=company' : '/dashboard/usher?tab=profile'}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all group"
          >
            <Settings className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            Settings
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all group"
          >
            <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────── */}
      <main className="flex-1 md:ml-60 p-6 md:p-8 lg:p-10">
        <div className="mx-auto max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
