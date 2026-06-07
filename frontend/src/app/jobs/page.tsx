'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Building2, Clock, Loader2, Star } from 'lucide-react';
import api from '@/lib/axios';

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  type: string;
  genderPreference: string;
  salaryMin: number;
  salaryMax: number;
  isFeatured: boolean;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/jobs?search=${search}`);
        setJobs(res.data.data.items || []);
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      } finally {
        setLoading(false);
      }
    };
    const timeout = setTimeout(fetchJobs, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Page Header ─────────────────────────────── */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-12">
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">
            Opportunities
          </p>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <h1
              className="text-[clamp(2rem,5vw,3.2rem)] font-light text-foreground tracking-tight leading-none"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              Browse Positions
            </h1>
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-11 h-11 rounded-xl bg-secondary border-[oklch(0.26_0.046_248/0.6)] text-foreground placeholder:text-muted-foreground focus-visible:ring-[oklch(0.70_0.020_82/0.15)] focus-visible:border-[oklch(0.45_0.030_82/0.35)] transition-all"
                placeholder="Search title, company, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────── */}
      <div className="container mx-auto px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              Loading positions...
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 border border-border rounded-2xl bg-card"
          >
            <Search className="mx-auto h-10 w-10 text-[oklch(0.30_0.040_248)] mb-5" />
            <h3
              className="text-xl font-light text-[oklch(0.70_0.022_82)] mb-2"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              No positions found
            </h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search criteria.</p>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job, i) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-border bg-card hover:border-[oklch(0.32_0.040_248)] hover:bg-secondary transition-all duration-300 overflow-hidden">
      {/* Top shine */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.94_0.010_82/0.06)] to-transparent" />

      <div className="p-6 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          {/* Company avatar */}
          <div className="h-11 w-11 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground font-medium text-lg"
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            {job.companyName?.charAt(0) || 'C'}
          </div>
          {job.isFeatured && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent border border-border">
              <Star className="h-3 w-3 text-accent-foreground" fill="currentColor" />
              <span className="text-[10px] tracking-[0.15em] uppercase text-accent-foreground">Featured</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-lg font-light text-foreground mb-1 group-hover:text-white transition-colors line-clamp-1 leading-snug"
          style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
        >
          {job.title}
        </h3>
        <div className="flex items-center text-muted-foreground text-sm mb-4">
          <Building2 className="mr-1.5 h-3.5 w-3.5" />
          {job.companyName}
        </div>

        {/* Meta */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center text-muted-foreground text-xs gap-2">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            {job.location || 'Cairo, Egypt'}
          </div>
          <div className="flex items-center text-muted-foreground text-xs gap-2">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            {job.type}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] tracking-wider uppercase bg-muted text-[oklch(0.60_0.022_248)] border border-[oklch(0.26_0.044_248/0.4)]">
            {job.genderPreference}
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] tracking-wider bg-muted text-[oklch(0.65_0.020_82)] border border-[oklch(0.26_0.040_248/0.4)]">
            {job.salaryMin}–{job.salaryMax} EGP/day
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <Link href={`/jobs/${job.id}`} className="block">
          <Button
            variant="outline"
            className="w-full h-10 rounded-xl text-xs tracking-widest uppercase border-input text-[oklch(0.65_0.022_82)] hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all duration-300"
          >
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
}
