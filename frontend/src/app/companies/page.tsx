'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Search, Building2, MapPin, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

interface Company {
  id: string;
  name: string;
  description: string;
  location: string;
  logoUrl: string;
  industry: string;
  activeJobsCount?: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/companies?search=${search}`);
        // Adjust according to actual paginated response
        setCompanies(res.data.data.items || res.data.data || []);
      } catch (error) {
        console.error('Failed to fetch companies', error);
      } finally {
        setLoading(false);
      }
    };
    const timeout = setTimeout(fetchCompanies, 500);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Page Header ─────────────────────────────── */}
      <div className="border-b border-border bg-background">
        <div className="container mx-auto px-6 py-12">
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">
            Partners
          </p>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <h1
              className="text-[clamp(2rem,5vw,3.2rem)] font-light text-foreground tracking-tight leading-none"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              Browse Companies
            </h1>
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-11 h-11 rounded-xl bg-secondary border-[oklch(0.26_0.046_248/0.6)] text-foreground placeholder:text-muted-foreground focus-visible:ring-[oklch(0.70_0.020_82/0.15)] focus-visible:border-[oklch(0.45_0.030_82/0.35)] transition-all"
                placeholder="Search companies, locations..."
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
              Loading companies...
            </p>
          </div>
        ) : companies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 border border-border rounded-2xl bg-card"
          >
            <Building2 className="mx-auto h-10 w-10 text-[oklch(0.30_0.040_248)] mb-5" />
            <h3
              className="text-xl font-light text-[oklch(0.70_0.022_82)] mb-2"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              No companies found
            </h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search criteria.</p>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company, i) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <CompanyCard company={company} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative flex flex-col rounded-2xl border border-border bg-card hover:border-[oklch(0.32_0.040_248)] hover:bg-secondary transition-all duration-300 overflow-hidden h-full">
      {/* Top shine */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.94_0.010_82/0.06)] to-transparent" />

      <div className="p-6 flex-1 flex flex-col">
        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          {/* Company avatar */}
          <div className="h-14 w-14 rounded-2xl bg-primary border border-input flex items-center justify-center text-[oklch(0.75_0.018_82)] font-medium text-2xl overflow-hidden shadow-sm"
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            {company.logoUrl && !imgError ? (
              <img 
                src={company.logoUrl.startsWith('http') ? company.logoUrl : `http://localhost:5000${company.logoUrl.startsWith('/') ? '' : '/'}${company.logoUrl}`} 
                alt={company.name} 
                className="h-full w-full object-cover" 
                onError={() => setImgError(true)} 
              />
            ) : (
              company.name?.charAt(0) || 'C'
            )}
          </div>
          {company.activeJobsCount && company.activeJobsCount > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary border border-[oklch(0.94_0.010_82/0.12)]">
              <span className="text-[10px] tracking-[0.15em] uppercase text-[oklch(0.72_0.018_82)] font-medium">{company.activeJobsCount} Active Jobs</span>
            </div>
          ) : null}
        </div>

        {/* Title */}
        <h3
          className="text-xl font-light text-foreground mb-2 group-hover:text-white transition-colors line-clamp-1 leading-snug"
          style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
        >
          {company.name}
        </h3>
        
        {/* Description */}
        <p className="text-muted-foreground text-sm mb-5 line-clamp-2 flex-1">
          {company.description || 'Premium event organizer in Egypt.'}
        </p>

        {/* Meta */}
        <div className="space-y-2 mt-auto">
          <div className="flex items-center text-muted-foreground text-xs gap-2">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            {company.location || 'Cairo, Egypt'}
          </div>
          {company.industry && (
            <div className="flex items-center text-muted-foreground text-xs gap-2">
              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
              {company.industry}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
