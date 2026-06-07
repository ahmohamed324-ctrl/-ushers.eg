'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

interface ApiError {
  response?: { data?: { message?: string } };
}

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', values);
      const { accessToken, refreshToken, user } = res.data.data;
      login(accessToken, refreshToken, user);
      toast.success(`Welcome back, ${user.firstName}`);
      router.push(`/dashboard/${user.role.toLowerCase()}`);
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err.response?.data?.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-background">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col items-center justify-center p-16 overflow-hidden bg-background border-r border-border">
        {/* Ambient orbs */}
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-[oklch(0.18_0.048_248/0.7)] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-card blur-[100px] pointer-events-none" />

        {/* Keyhole motif — large decorative */}
        <motion.div 
          className="relative z-10 mb-12 flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Logo size="xl" className="drop-shadow-[0_0_60px_oklch(0.94_0.010_82/0.08)] mb-8" />

          <div className="h-px w-16 bg-[oklch(0.30_0.044_248)] mb-8 mt-4" />

          <p
            className="text-center text-muted-foreground text-sm leading-relaxed max-w-xs italic"
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            &ldquo;Smooth events start with ushers.&rdquo;
          </p>
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <motion.div 
          className="lg:hidden mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Logo size="md" />
        </motion.div>

        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          {/* Header */}
          <div className="mb-10">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">
              Welcome back
            </p>
            <h2
              className="text-3xl font-light text-foreground tracking-tight"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              Sign in to your account
            </h2>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-border bg-secondary backdrop-blur-xl p-8 shadow-[0_8px_40px_oklch(0.08_0.030_248/0.6)]">
            {/* Shine line */}
            <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-[oklch(0.94_0.010_82/0.06)] to-transparent" />

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-normal">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-11 bg-input border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-[oklch(0.70_0.020_82/0.2)] focus-visible:border-[oklch(0.50_0.030_82/0.4)] rounded-xl transition-all"
                          placeholder="name@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[oklch(0.70_0.191_22)]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-normal">
                          Password
                        </FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Forgot?
                        </Link>
                      </div>
                      <FormControl>
                        <Input
                          className="h-11 bg-input border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-[oklch(0.70_0.020_82/0.2)] focus-visible:border-[oklch(0.50_0.030_82/0.4)] rounded-xl transition-all"
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[oklch(0.70_0.191_22)]" />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl text-sm font-medium tracking-widest uppercase bg-primary text-primary-foreground hover:bg-white border-0 shadow-[0_4px_20px_oklch(0.94_0.010_82/0.15)] hover:shadow-[0_8px_32px_oklch(0.94_0.010_82/0.25)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <motion.p 
            className="mt-6 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-[oklch(0.72_0.018_82)] hover:text-foreground transition-colors font-medium"
            >
              Create account
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
