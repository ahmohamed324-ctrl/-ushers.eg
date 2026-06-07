'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, FileText, Building2, TrendingUp, PlusCircle, Calendar, MapPin, GraduationCap, DollarSign, Award, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { PostJobDialog } from '@/components/post-job-dialog';
import { CompanyProfileForm } from '@/components/company-profile-form';
import { Logo } from '@/components/logo';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

interface Stats {
  activeJobs: number;
  totalJobs: number;
  totalApplications: number;
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
    <div className="relative rounded-2xl border border-border bg-card p-6 overflow-hidden hover:border-[oklch(0.30_0.040_248)] transition-all duration-300">
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

function EmptyState({
  icon: Icon,
  message,
  action,
}: {
  icon: React.ElementType;
  message: string;
  action?: React.ReactNode;
}) {
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
        <p className="text-xs text-muted-foreground mb-5">Your activity will appear here.</p>
        {action}
      </div>
    </div>
  );
}

export default function EmployerDashboard() {
  const { user } = useAuthStore();
  
  const getImageUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    
    try {
      const baseUrl = api.defaults.baseURL || 'http://localhost:5125/api/v1';
      const origin = new URL(baseUrl).origin;
      const timestamp = new Date().getTime();
      return `${origin}${url}?t=${timestamp}`;
    } catch {
      const timestamp = new Date().getTime();
      return `http://localhost:5125${url}?t=${timestamp}`;
    }
  };

  const [stats, setStats] = useState<Stats | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Application details modal state
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const activeTab = searchParams.get('tab') || 'jobs';

  const handleTabChange = (value: string) => {
    router.push(`/dashboard/employer?tab=${value}`);
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/jobs/my');
      const jobsList = res.data.data.items || [];
      setJobs(jobsList);
      
      let allApps: any[] = [];
      if (jobsList.length > 0) {
        const promises = jobsList.map((job: any) => 
          api.get(`/applications/job/${job.id}`).catch(() => ({ data: { data: { items: [] } } }))
        );
        const results = await Promise.all(promises);
        allApps = results.flatMap((res, index) => {
          const items = res.data.data.items || [];
          return items.map((app: any) => ({
            ...app,
            jobTitle: jobsList[index].title,
            jobCategory: jobsList[index].category,
          }));
        });
        
        // Sort by applied date (latest first)
        allApps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      
      setApplications(allApps);
      setStats({
        activeJobs: jobsList.filter((j: { status: string }) => j.status === 'Active').length,
        totalJobs: jobsList.length,
        totalApplications: allApps.length,
      });
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch stats & applications', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    setIsSubmittingStatus(true);
    try {
      await api.patch(`/applications/${appId}/status`, {
        status: newStatus,
        note: statusNote,
      });
      toast.success(`Application updated to ${newStatus} successfully!`);
      setStatusNote('');
      setIsDetailOpen(false);
      setSelectedApp(null);
      await fetchStats(); // Refresh applications and stats!
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update application status');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">

      {/* ── Header ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-2">
            Employer Dashboard
          </p>
          <h1
            className="text-3xl font-light text-foreground tracking-tight"
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            Welcome back, {user?.firstName}.
          </h1>
        </div>
        <PostJobDialog onJobPosted={fetchStats} />
      </div>

      {/* ── Stats ──────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={stats?.activeJobs ?? 0} label="Active Jobs" icon={TrendingUp} loading={loading} />
        <StatCard value={stats?.totalJobs ?? 0} label="Total Posted" icon={Briefcase} loading={loading} />
        <StatCard value={stats?.totalApplications ?? 0} label="Applications" icon={FileText} loading={loading} />
      </div>

      {/* ── Tabs ───────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-card border border-border p-1 rounded-xl gap-1 h-auto">
          {[
            { value: 'jobs', label: 'My Jobs' },
            { value: 'applications', label: 'Applications' },
            { value: 'company', label: 'Company Profile' },
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

        {/* My Jobs */}
        <TabsContent value="jobs">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2
                  className="text-base font-light text-card-foreground"
                  style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                >
                  Job Postings
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Manage your active and past listings.</p>
              </div>
            </div>
            {jobs.length > 0 ? (
              <div className="p-6 grid gap-4 md:grid-cols-2">
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    className="group relative rounded-xl border border-border bg-secondary/50 p-5 hover:border-primary transition-all duration-300"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.94_0.010_82/0.06)] to-transparent" />

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] tracking-wider uppercase bg-muted text-[oklch(0.60_0.022_248)] border border-[oklch(0.26_0.044_248/0.4)]">
                          {job.category}
                        </span>
                        <h3 className="text-base font-medium text-foreground mt-2 group-hover:text-white transition-colors line-clamp-1">
                          {job.title}
                        </h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] tracking-wider uppercase ${
                        job.status === 'Active'
                          ? 'bg-[oklch(0.30_0.08_142/0.1)] text-[oklch(0.60_0.08_142)] border border-[oklch(0.30_0.08_142/0.2)]'
                          : 'bg-[oklch(0.25_0.02_248/0.1)] text-[oklch(0.50_0.02_248)] border border-[oklch(0.25_0.02_248/0.2)]'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mb-4">
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Location</span>
                        <span className="text-foreground line-clamp-1">{job.location || 'Cairo, Egypt'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Openings</span>
                        <span className="text-foreground">{job.openingsCount} staff</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Salary</span>
                        <span className="text-foreground font-medium">
                          {job.salaryMin} – {job.salaryMax} EGP/day
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <Link href={`/jobs/${job.id}`} className="flex-1">
                        <button className="w-full text-center py-1.5 rounded-lg text-[10px] tracking-wider uppercase border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                          View Listing
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Briefcase}
                message="No jobs posted yet."
                action={
                  <PostJobDialog
                    onJobPosted={fetchStats}
                    trigger={
                      <button className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-[oklch(0.60_0.022_82)] hover:text-foreground transition-colors border border-[oklch(0.26_0.044_248/0.5)] rounded-xl px-5 py-2.5 hover:border-[oklch(0.36_0.038_248)] hover:bg-muted">
                        <PlusCircle className="h-4 w-4" /> Post a Job
                      </button>
                    }
                  />
                }
              />
            )}
          </div>
        </TabsContent>

        {/* Applications */}
        <TabsContent value="applications">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2
                className="text-base font-light text-card-foreground"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Candidate Applications
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Review candidates who applied to your jobs.</p>
            </div>
            {applications.length > 0 ? (
              <div className="p-6 grid gap-4 md:grid-cols-2">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="group relative rounded-xl border border-border bg-secondary/50 p-5 hover:border-primary transition-all duration-300"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.94_0.010_82/0.06)] to-transparent" />
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex gap-4">
                        <Avatar className="h-12 w-12 border border-[oklch(0.24_0.044_248/0.6)] shadow-inner">
                          <AvatarImage src={getImageUrl(app.candidateAvatarUrl)} />
                          <AvatarFallback className="bg-muted text-foreground text-xs font-semibold uppercase">
                            {app.candidateName ? app.candidateName.substring(0, 2) : 'US'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-base font-medium text-foreground hover:text-white transition-colors">
                            {app.candidateName || 'Anonymous Candidate'}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Applied for <span className="text-foreground font-semibold">{app.jobTitle}</span>
                          </p>
                        </div>
                      </div>
                      
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] tracking-wider uppercase font-semibold border ${
                        app.status === 'Accepted'
                          ? 'bg-[oklch(0.30_0.08_142/0.1)] text-[oklch(0.60_0.08_142)] border-[oklch(0.30_0.08_142/0.2)]'
                          : app.status === 'Rejected'
                          ? 'bg-[oklch(0.25_0.06_24/0.1)] text-[oklch(0.55_0.06_24)] border-[oklch(0.25_0.06_24/0.2)]'
                          : 'bg-[oklch(0.28_0.05_48/0.1)] text-[oklch(0.68_0.05_48)] border-[oklch(0.28_0.05_48/0.2)]'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    {/* Candidate Quick Stats */}
                    {app.candidateProfile && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {app.candidateProfile.age && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-secondary text-secondary-foreground border border-border">
                            Age: {app.candidateProfile.age}
                          </span>
                        )}
                        {app.candidateProfile.height && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-secondary text-secondary-foreground border border-border">
                            Height: {app.candidateProfile.height}
                          </span>
                        )}
                        {app.candidateProfile.appearance && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-secondary text-secondary-foreground border border-border">
                            Appearance: {app.candidateProfile.appearance}
                          </span>
                        )}
                        {app.candidateProfile.yearsOfExperience !== null && app.candidateProfile.yearsOfExperience !== undefined && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-secondary text-secondary-foreground border border-border">
                            Exp: {app.candidateProfile.yearsOfExperience} yrs
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 pt-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{app.candidateLocation || 'Cairo, Egypt'}</span>
                      </div>
                      <div className="h-3 w-px bg-border" />
                      <div>
                        <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setIsDetailOpen(true);
                        }}
                        className="w-full text-center py-2 rounded-lg text-[10px] tracking-wider uppercase border border-border text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                      >
                        Review Application
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={FileText} message="No applications yet." />
            )}
          </div>
        </TabsContent>

        {/* Company Profile */}
        <TabsContent value="company">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h2
                className="text-base font-light text-card-foreground"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Company Profile
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Update your company details and branding.</p>
            </div>
            <div className="p-6">
              <CompanyProfileForm />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Candidate Detail Modal ──────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={(open) => {
        setIsDetailOpen(open);
        if (!open) {
          setSelectedApp(null);
          setStatusNote('');
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[92vh] overflow-y-auto bg-card border-[oklch(0.26_0.046_248/0.6)] shadow-[0_24px_80px_oklch(0.08_0.030_248/0.9)] text-card-foreground">
          {selectedApp && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 border border-[oklch(0.26_0.044_248/0.6)] shadow-inner">
                    <AvatarImage src={getImageUrl(selectedApp.candidateAvatarUrl)} />
                    <AvatarFallback className="bg-muted text-foreground text-base font-bold uppercase">
                      {selectedApp.candidateName ? selectedApp.candidateName.substring(0, 2) : 'US'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl font-light text-foreground tracking-tight">
                      {selectedApp.candidateName}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" />
                      <span>{selectedApp.candidateLocation || 'Cairo, Egypt'}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.30_0.044_248)]" />
                      <span>Applied for {selectedApp.jobTitle}</span>
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Photos Section */}
              {(selectedApp.candidateProfile?.formalPhotoUrl || selectedApp.candidateProfile?.casualPhotoUrl) && (
                <div className="mb-6">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 font-semibold">
                    Candidate Photos
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedApp.candidateProfile.formalPhotoUrl ? (
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-[oklch(0.12_0.034_248)] group">
                        <img 
                          src={getImageUrl(selectedApp.candidateProfile.formalPhotoUrl)} 
                          alt="Formal Photo" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute bottom-3 left-3 bg-[oklch(0.14_0.042_248/0.8)] backdrop-blur px-2.5 py-0.5 rounded text-[8px] tracking-widest uppercase text-white font-medium">
                          Formal
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border border-dashed border-[oklch(0.24_0.044_248/0.4)] text-muted-foreground">
                        <span className="text-[10px] uppercase tracking-wider">No Formal Photo</span>
                      </div>
                    )}

                    {selectedApp.candidateProfile.casualPhotoUrl ? (
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border bg-[oklch(0.12_0.034_248)] group">
                        <img 
                          src={getImageUrl(selectedApp.candidateProfile.casualPhotoUrl)} 
                          alt="Casual Photo" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute bottom-3 left-3 bg-[oklch(0.14_0.042_248/0.8)] backdrop-blur px-2.5 py-0.5 rounded text-[8px] tracking-widest uppercase text-white font-medium">
                          Casual
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center aspect-[3/4] rounded-xl border border-dashed border-[oklch(0.24_0.044_248/0.4)] text-muted-foreground">
                        <span className="text-[10px] uppercase tracking-wider">No Casual Photo</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="mb-6">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 font-semibold">
                  Usher Profile Details
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[oklch(0.12_0.034_248/0.6)] border border-[oklch(0.20_0.044_248/0.4)] rounded-xl p-4">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Age</span>
                    <span className="text-sm font-medium text-[oklch(0.85_0.010_82)]">
                      {selectedApp.candidateProfile?.age ? `${selectedApp.candidateProfile.age} yrs` : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Height</span>
                    <span className="text-sm font-medium text-[oklch(0.85_0.010_82)]">
                      {selectedApp.candidateProfile?.height || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Appearance</span>
                    <span className="text-sm font-medium text-[oklch(0.85_0.010_82)]">
                      {selectedApp.candidateProfile?.appearance || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Experience</span>
                    <span className="text-sm font-medium text-[oklch(0.85_0.010_82)]">
                      {selectedApp.candidateProfile?.yearsOfExperience !== null && selectedApp.candidateProfile?.yearsOfExperience !== undefined 
                        ? `${selectedApp.candidateProfile.yearsOfExperience} years` 
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Expected Salary</span>
                    <span className="text-sm font-medium text-[oklch(0.85_0.010_82)]">
                      {selectedApp.candidateProfile?.expectedSalaryPerDay 
                        ? `${selectedApp.candidateProfile.expectedSalaryPerDay} EGP/day` 
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Nationality</span>
                    <span className="text-sm font-medium text-[oklch(0.85_0.010_82)]">
                      {selectedApp.candidateProfile?.nationality || 'N/A'}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-3 h-px bg-muted my-1" />
                  <div className="col-span-2">
                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">University / School</span>
                    <span className="text-xs font-medium text-[oklch(0.80_0.018_82)]">
                      {selectedApp.candidateProfile?.university || selectedApp.candidateProfile?.school || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Transportation</span>
                    <span className="text-xs font-medium text-[oklch(0.80_0.018_82)]">
                      {selectedApp.candidateProfile?.hasTransportation ? 'Yes, has car' : 'No'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Languages</span>
                    <span className="text-xs text-[oklch(0.80_0.018_82)]">
                      {selectedApp.candidateProfile?.languages || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Weekends Available</span>
                    <span className="text-xs font-medium text-[oklch(0.80_0.018_82)]">
                      {selectedApp.candidateProfile?.availableWeekends ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="mb-6">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-2 font-semibold">
                  Cover Letter / Message
                </p>
                <div className="bg-[oklch(0.12_0.034_248/0.4)] border border-[oklch(0.20_0.044_248/0.3)] rounded-xl p-4 text-xs leading-relaxed italic text-[oklch(0.80_0.018_82)]">
                  &ldquo;{selectedApp.coverLetter || 'No message provided by candidate.'}&rdquo;
                </div>
              </div>

              {/* Decision Note / Actions */}
              <div className="pt-4 border-t border-border">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3 font-semibold">
                  Review Decision
                </p>
                
                {selectedApp.status === 'Pending' ? (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Add an optional note (e.g. event details, interview date...)"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="bg-[oklch(0.12_0.034_248)] border-border focus:border-[oklch(0.30_0.040_248)] text-xs rounded-xl h-16 resize-none"
                    />
                    <div className="flex gap-4">
                      <button
                        disabled={isSubmittingStatus}
                        onClick={() => handleUpdateStatus(selectedApp.id, 'Rejected')}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs tracking-wider uppercase border border-[oklch(0.25_0.06_24/0.3)] text-[oklch(0.60_0.06_24)] hover:bg-accent hover:text-accent-foreground transition-all duration-300"
                      >
                        <XCircle className="h-4 w-4" /> Reject Candidate
                      </button>
                      <button
                        disabled={isSubmittingStatus}
                        onClick={() => handleUpdateStatus(selectedApp.id, 'Accepted')}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs tracking-wider uppercase bg-primary text-primary-foreground hover:bg-white transition-all duration-300 font-semibold shadow-[0_4px_16px_oklch(0.94_0.010_82/0.15)]"
                      >
                        <CheckCircle className="h-4 w-4" /> Accept Candidate
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[oklch(0.12_0.034_248/0.8)] border border-[oklch(0.20_0.044_248/0.4)] p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        This application is <span className="font-semibold">{selectedApp.status}</span>.
                      </p>
                      {selectedApp.employerNote && (
                        <p className="text-[11px] text-[oklch(0.70_0.020_82)] mt-1.5 italic">
                          &ldquo;{selectedApp.employerNote}&rdquo;
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'Pending')}
                      className="text-[9px] tracking-widest uppercase border border-[oklch(0.24_0.044_248/0.5)] px-3 py-1.5 rounded-lg text-[oklch(0.60_0.022_82)] hover:bg-muted transition-all"
                    >
                      Reconsider
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
