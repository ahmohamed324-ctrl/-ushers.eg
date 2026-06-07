'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowRight, Users, Shield, Zap } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
  }),
} as any;

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">

      {/* ─── Hero Section ─────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden bg-background">

        {/* Ambient background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-[oklch(0.18_0.048_248/0.6)] blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-[oklch(0.16_0.042_248/0.5)] blur-[100px]" />
          <div className="absolute top-[30%] right-[20%] w-[25%] h-[30%] rounded-full bg-primary blur-[80px]" />
        </div>

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(oklch(0.94_0.010_82) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.94_0.010_82) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="container relative z-10 mx-auto px-6 py-24">
          <div className="max-w-5xl mx-auto text-center">

            {/* Eyebrow label */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2.5 mb-8"
            >
              <div className="h-px w-12 bg-primary" />
              <span
                className="text-xs font-medium tracking-[0.25em] uppercase text-muted-foreground"
              >
                Egypt&apos;s Premium Staffing Marketplace
              </span>
              <div className="h-px w-12 bg-primary" />
            </motion.div>

            {/* Main headline / Logo Reveal */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="flex justify-center mb-10"
            >
              <Logo size="xl" className="drop-shadow-2xl" />
            </motion.div>

            {/* Subheading */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.2}
              className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed font-light"
            >
              Connect with Egypt&apos;s most professional ushers and event staff.
              Effortless hiring. Seamless events.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.3}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link href="/register?role=employer">
                <Button
                  size="lg"
                  className="h-13 px-8 text-sm font-medium tracking-widest uppercase rounded-full bg-primary text-primary-foreground hover:bg-white border-0 shadow-[0_8px_32px_oklch(0.94_0.010_82/0.25)] hover:shadow-[0_12px_40px_oklch(0.94_0.010_82/0.35)] transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  Hire Staff <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register?role=usher">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 px-8 text-sm font-medium tracking-widest uppercase rounded-full bg-transparent text-[oklch(0.78_0.020_82)] border border-input hover:bg-muted hover:border-[oklch(0.40_0.038_248)] hover:text-foreground transition-all duration-300 w-full sm:w-auto"
                >
                  Find Work
                </Button>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.45}
              className="mt-20 pt-10 border-t border-border grid grid-cols-3 gap-8 max-w-lg mx-auto"
            >
              {[
                { value: '2,400+', label: 'Verified Ushers' },
                { value: '680+', label: 'Events Staffed' },
                { value: '98%', label: 'Client Satisfaction' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="text-2xl font-light text-foreground mb-1"
                    style={{ fontFamily: 'var(--font-display), Georgia, serif', letterSpacing: '-0.03em' }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[oklch(0.13_0.038_248)] to-transparent pointer-events-none" />
      </section>

      {/* ─── Features Section ─────────────────────────── */}
      <section className="py-28 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
              Why ushers.eg
            </p>
            <h2
              className="text-[clamp(2rem,5vw,3.5rem)] font-light text-foreground tracking-tight"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              Built for excellence.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="Vetted Professionals"
              description="Every candidate is carefully screened, verified, and rated by real employers."
            />
            <FeatureCard
              icon={<Users className="h-5 w-5" />}
              title="Tailored Matching"
              description="Filter by appearance, experience, language, and availability for perfect fit."
            />
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Seamless Hiring"
              description="Post a job, receive applications, and confirm staff — all in minutes."
            />
          </div>
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────── */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[oklch(0.17_0.044_248/0.5)] blur-[100px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2
            className="text-[clamp(2rem,5vw,3.5rem)] font-light text-foreground mb-4 tracking-tight"
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            Ready to elevate your event?
          </h2>
          <p className="text-[oklch(0.50_0.028_248)] mb-10 max-w-md mx-auto">
            Join hundreds of event companies who trust ushers.eg for their premium staffing needs.
          </p>
          <Link href="/register?role=employer">
            <Button
              size="lg"
              className="h-13 px-10 text-sm font-medium tracking-widest uppercase rounded-full bg-primary text-primary-foreground hover:bg-white border-0 shadow-[0_8px_32px_oklch(0.94_0.010_82/0.2)] hover:shadow-[0_12px_40px_oklch(0.94_0.010_82/0.30)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Start Hiring Today
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────── */}
      <footer className="bg-sidebar border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link href="/" className="group">
              <Logo size="sm" className="opacity-80 transition-opacity group-hover:opacity-100" />
            </Link>
            <p className="text-xs text-muted-foreground tracking-wider">
              © {new Date().getFullYear()} ushers.eg · All rights reserved
            </p>
            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Contact'].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase()}`}
                  className="text-xs tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="group relative p-8 rounded-2xl border border-border bg-card hover:border-[oklch(0.30_0.040_248)] hover:bg-secondary transition-all duration-300 overflow-hidden"
    >
      {/* Subtle top shine */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.94_0.010_82/0.08)] to-transparent" />

      <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-[oklch(0.75_0.018_82)] group-hover:bg-accent hover:text-accent-foreground transition-colors">
        {icon}
      </div>
      <h3
        className="text-lg font-medium text-foreground mb-2"
        style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
      >
        {title}
      </h3>
      <p className="text-sm text-[oklch(0.52_0.025_248)] leading-relaxed">{description}</p>
    </motion.div>
  );
}
