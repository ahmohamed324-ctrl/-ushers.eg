'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';

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

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      router.push('/login');
    }
  }, [token, router]);

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    if (!token) return;
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: values.newPassword });
      toast.success('Password reset successfully!');
      router.push('/login');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Link may have expired. Please request a new one.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-normal">
                New Password
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    className="h-11 bg-input border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-[oklch(0.70_0.020_82/0.2)] focus-visible:border-[oklch(0.50_0.030_82/0.4)] rounded-xl transition-all pr-10"
                    placeholder="Min. 8 characters"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage className="text-[oklch(0.70_0.191_22)]" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-normal">
                Confirm Password
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  className="h-11 bg-input border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-[oklch(0.70_0.020_82/0.2)] focus-visible:border-[oklch(0.50_0.030_82/0.4)] rounded-xl transition-all"
                  placeholder="••••••••"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[oklch(0.70_0.191_22)]" />
            </FormItem>
          )}
        />
        <div className="pt-1">
          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-sm font-medium tracking-widest uppercase bg-primary text-primary-foreground hover:bg-white border-0 shadow-[0_4px_20px_oklch(0.94_0.010_82/0.15)] hover:shadow-[0_8px_32px_oklch(0.94_0.010_82/0.25)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? 'Resetting...' : 'Set New Password'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background relative overflow-hidden px-6">
      {/* Ambient orbs */}
      <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[oklch(0.18_0.048_248/0.6)] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[40%] h-[40%] rounded-full bg-card blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-6">
            <Logo size="lg" />
          </div>
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground text-center mb-3">
            Account Security
          </p>
          <h1
            className="text-3xl font-light text-foreground text-center tracking-tight"
            style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
          >
            Set a new password
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Choose a strong password to secure your account.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-border bg-secondary backdrop-blur-xl p-8 shadow-[0_8px_40px_oklch(0.08_0.030_248/0.6)]">
          <Suspense
            fallback={
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
