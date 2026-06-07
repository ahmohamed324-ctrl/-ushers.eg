'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Search, FileText, Bookmark, UserCircle, TrendingUp } from 'lucide-react';
import api from '@/lib/axios';
import Link from 'next/link';
import { UsherProfileForm } from '@/components/usher-profile-form';
import { Logo } from '@/components/logo';
import { useSearchParams, useRouter } from 'next/navigation';



interface Stats {
  applications: number;
  savedJobs: number;
}

function StatCard({
  value,
  label,
  icon: Icon,
  loading,
}: {
  value: string | number;
  label: string;
  icon: React.ElementType;
  loading: boolean;
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-6 overflow-hidden group hover:border-[oklch(0.30_0.040_248)] transition-all duration-300">
      {/* Top shine */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.94_0.010_82/0.05)] to-transparent" />

      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-[oklch(0.35_0.032_248)]" />
      </div>
      {loading ? (
        <div className="h-10 w-16 rounded-lg bg-muted animate-pulse" />
      ) : (
        <p
          className="text-4xl font-light text-foreground leading-none"
          style={{ fontFamily: 'var(--font-display), Georgia, serif', letterSpacing: '-0.04em' }}
        >
          {value}
        </p>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center relative overflow-hidden">
      {/* Background brand watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <Logo size="xl" withText={false} />
      </div>

      <div className="relative z-10">
        <div className="mb-4 h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto">
          <Icon className="h-6 w-6 text-[oklch(0.35_0.030_248)]" />
        </div>
        <p
          className="text-base font-light text-muted-foreground mb-1"
          style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
        >
          {message}
        </p>
        <p className="text-xs text-muted-foreground">Your activity will appear here.</p>
      </div>
    </div>
  );
}

export default function UsherDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeTab = searchParams.get('tab') || 'applications';

  const handleTabChange = (value: string) => {
    router.push(`/dashboard/usher?tab=${value}`);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [appsRes, savedRes] = await Promise.all([
          api.get('/applications/my'),
          api.get('/jobs/saved'),
        ]);
        setStats({
          applications: appsRes.data.data.totalCount || 0,
          savedJobs: savedRes.data.data.totalCount || 0,
        });
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error('Failed to fetch stats', error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">

      {/* ── Header ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
            Usher Dashboard
          </p>
          <h1
            className="text-3xl font-light text-foreground tracking-tight"
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            Welcome back, {user?.firstName}.
          </h1>
        </div>
        <Link href="/jobs">
          <Button
            size="lg"
            className="h-11 px-6 text-xs font-medium tracking-widest uppercase rounded-xl bg-primary text-primary-foreground hover:bg-white border-0 shadow-[0_4px_20px_oklch(0.94_0.010_82/0.12)] hover:shadow-[0_6px_28px_oklch(0.94_0.010_82/0.22)] transition-all duration-300 hover:-translate-y-0.5"
          >
            <Search className="mr-2 h-4 w-4" /> Browse Jobs
          </Button>
        </Link>
      </div>

      {/* ── Stats Grid ────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={stats?.applications ?? 0} label="My Applications" icon={FileText} loading={loading} />
        <StatCard value={stats?.savedJobs ?? 0} label="Saved Jobs" icon={Bookmark} loading={loading} />
        <StatCard value="85%" label="Profile Complete" icon={TrendingUp} loading={loading} />
      </div>

      {/* ── Tabs ──────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-xl gap-1 h-auto">
          {[
            { value: 'applications', label: 'Applications' },
            { value: 'saved', label: 'Saved Jobs' },
            { value: 'profile', label: 'My Profile' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-[10px] tracking-[0.15em] uppercase font-medium rounded-lg px-4 py-2 text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-none transition-all"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="applications">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2
                className="text-base font-light text-card-foreground"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Application History
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Track the status of jobs you&apos;ve applied for.</p>
            </div>
            <EmptyState icon={FileText} message="No applications yet." />
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2
                className="text-base font-light text-card-foreground"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Saved Positions
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Jobs you&apos;ve bookmarked for later.</p>
            </div>
            <EmptyState icon={Bookmark} message="No saved jobs yet." />
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2
                className="text-base font-light text-card-foreground"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Professional Profile
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Update your personal info, photos, skills, and experience.</p>
            </div>
            <div className="p-6">
              <UsherProfileForm />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
