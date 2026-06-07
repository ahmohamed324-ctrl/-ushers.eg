'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

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

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', values);
      setIsSent(true);
    } catch {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background relative overflow-hidden px-6">
      {/* Ambient orbs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[oklch(0.18_0.048_248/0.6)] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] rounded-full bg-card blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {isSent ? (
          /* ── Success state ── */
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center border border-[oklch(0.30_0.040_248/0.5)]">
                <CheckCircle className="h-7 w-7 text-[oklch(0.75_0.018_82)]" />
              </div>
            </div>
            <h1
              className="text-3xl font-light text-foreground mb-3 tracking-tight"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              Check your inbox
            </h1>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed max-w-xs mx-auto">
              If an account exists for that email, we&apos;ve sent a password reset link. Check your spam folder if you don&apos;t see it.
            </p>
            <button
              onClick={() => setIsSent(false)}
              className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              Try another email
            </button>
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            {/* Header */}
            <div className="mb-8 flex flex-col items-center">
              <div className="mb-6">
                <Logo size="lg" />
              </div>
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground text-center mb-3">
                Account Recovery
              </p>
              <h1
                className="text-3xl font-light text-foreground text-center tracking-tight"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Forgot your password?
              </h1>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-border bg-secondary backdrop-blur-xl p-8 shadow-[0_8px_40px_oklch(0.08_0.030_248/0.6)]">
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
                  <div className="pt-1">
                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl text-sm font-medium tracking-widest uppercase bg-primary text-primary-foreground hover:bg-white border-0 shadow-[0_4px_20px_oklch(0.94_0.010_82/0.15)] hover:shadow-[0_8px_32px_oklch(0.94_0.010_82/0.25)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
