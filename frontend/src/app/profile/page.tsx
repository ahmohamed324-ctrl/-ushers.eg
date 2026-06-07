'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    const role = user.role?.toLowerCase();
    router.replace(`/dashboard/${role}?tab=profile`);
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-[oklch(0.94_0.010_82/0.3)] border-t-[oklch(0.94_0.010_82)] animate-spin" />
        <p className="text-xs tracking-widest uppercase text-muted-foreground">
          Redirecting…
        </p>
      </div>
    </div>
  );
}
