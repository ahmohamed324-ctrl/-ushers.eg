'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Building2,
  Clock,
  ArrowLeft,
  Calendar,
  Award,
  Users,
  Briefcase,
  CheckCircle2,
  Bookmark,
  Send,
  Loader2,
} from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';

const getImageUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const apiBase = api.defaults.baseURL || 'http://localhost:5125/api/v1';
  const origin = apiBase.replace('/api/v1', '');
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
};

interface Job {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  location: string;
  type: string;
  status: string;
  experienceLevel: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  category: string;
  openingsCount?: number;
  createdAt: string;
  viewsCount: number;
  isSaved?: boolean;
  hasApplied?: boolean;
  isRemote?: boolean;
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    location?: string;
    isVerified: boolean;
  };
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const { user } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data.data);
    } catch (error) {
      console.error('Failed to fetch job details', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply for this job');
      router.push('/login');
      return;
    }
    setApplying(true);
    try {
      await api.post(`/applications`, { jobId: id });
      toast.success('Application submitted successfully!');
      fetchJob(); // refresh state
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      toast.error('Please login to save this job');
      router.push('/login');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post(`/jobs/${id}/save`);
      const saved = res.data.data;
      toast.success(saved ? 'Job saved to bookmarks' : 'Job removed from bookmarks');
      setJob(prev => prev ? { ...prev, isSaved: saved } : null);
    } catch (error) {
      toast.error('Failed to toggle save job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          Loading job details...
        </p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Briefcase className="h-16 w-16 text-[oklch(0.30_0.040_248)] mb-6" />
        <h1 className="text-2xl font-light text-foreground mb-2" style={{ fontFamily: 'var(--font-display), Georgia, serif' }}>
          Job Not Found
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          The job listing you are looking for might have been closed or removed.
        </p>
        <Link href="/jobs">
          <Button variant="outline" className="rounded-xl px-6 py-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Browse Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const isUsher = user?.role === 'Usher';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Back Header */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs tracking-wider uppercase text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          {isUsher && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleSave}
              disabled={saving}
              className={`rounded-xl border ${
                job.isSaved
                  ? 'bg-primary border-[oklch(0.94_0.010_82/0.3)] text-[oklch(0.80_0.018_82)]'
                  : 'border-border text-muted-foreground hover:text-white'
              }`}
            >
              <Bookmark className={`h-4 w-4 mr-2 ${job.isSaved ? 'fill-current' : ''}`} />
              {job.isSaved ? 'Saved' : 'Save Job'}
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative rounded-2xl border border-border bg-card p-8 overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.94_0.010_82/0.06)] to-transparent" />
              
              <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-6">
                <div>
                  <span className="px-3 py-1 rounded-full text-[10px] tracking-wider uppercase bg-muted text-[oklch(0.60_0.022_248)] border border-[oklch(0.26_0.044_248/0.4)]">
                    {job.category}
                  </span>
                  <h1
                    className="text-2xl md:text-3xl font-light text-foreground tracking-tight mt-3 mb-1"
                    style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                  >
                    {job.title}
                  </h1>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Building2 className="mr-2 h-4 w-4" />
                    {job.company.name}
                  </div>
                </div>

                {job.company.logoUrl ? (
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[oklch(0.24_0.044_248/0.6)] bg-white p-1">
                    <img src={getImageUrl(job.company.logoUrl)} alt={job.company.name} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-primary border border-input flex items-center justify-center text-[oklch(0.75_0.018_82)] font-medium text-2xl"
                    style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                  >
                    {job.company.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-6 border-t border-border">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {job.location || 'Cairo, Egypt'}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {job.type}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Posted {new Date(job.createdAt).toLocaleDateString('en-EG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-8 space-y-6"
            >
              <div>
                <h3 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Job Description</h3>
                <p className="text-sm font-light text-[oklch(0.80_0.018_82)] leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {job.requirements && (
                <div>
                  <h3 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Requirements</h3>
                  <p className="text-sm font-light text-[oklch(0.80_0.018_82)] leading-relaxed whitespace-pre-wrap">
                    {job.requirements}
                  </p>
                </div>
              )}

              {job.benefits && (
                <div>
                  <h3 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Benefits</h3>
                  <p className="text-sm font-light text-[oklch(0.80_0.018_82)] leading-relaxed whitespace-pre-wrap">
                    {job.benefits}
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick Info (Right) */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-6 space-y-6"
            >
              <h3 className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground pb-3 border-b border-border">
                Position Summary
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-start text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider">Salary Offer</span>
                  <span className="text-[oklch(0.85_0.010_82)] text-right font-medium">
                    {job.salaryMin} – {job.salaryMax} EGP / {job.salaryPeriod || 'day'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider">Experience</span>
                  <span className="text-[oklch(0.85_0.010_82)] font-medium">
                    {job.experienceLevel} Level
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider">Openings</span>
                  <span className="text-[oklch(0.85_0.010_82)] font-medium">
                    {job.openingsCount || 1} Positions
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground uppercase tracking-wider">Workplace</span>
                  <span className="text-[oklch(0.85_0.010_82)] font-medium">
                    {job.isRemote ? 'Remote' : 'On-Site'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {isUsher ? (
                job.hasApplied ? (
                  <div className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[oklch(0.30_0.08_142/0.1)] border border-[oklch(0.30_0.08_142/0.3)] text-[oklch(0.60_0.08_142)] text-xs uppercase tracking-widest font-medium">
                    <CheckCircle2 className="h-4 w-4" /> Applied Successfully
                  </div>
                ) : (
                  <Button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-white text-xs uppercase tracking-widest font-medium border-0 transition-all duration-300"
                  >
                    {applying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Applying...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" /> Apply Now
                      </>
                    )}
                  </Button>
                )
              ) : user?.role === 'Employer' ? (
                <div className="text-center p-4 rounded-xl border border-border bg-background text-xs text-muted-foreground font-light leading-relaxed">
                  You are viewing this listing as an Employer. Active candidates' applications can be managed in the Applications tab of your dashboard.
                </div>
              ) : (
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground hover:bg-white text-xs uppercase tracking-widest font-medium border-0 transition-all duration-300"
                >
                  Login to Apply
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
