'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Briefcase, Building2, User as UserIcon, UserRoundCog } from 'lucide-react';
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

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Employer', 'Usher']),
  gender: z.enum(['Male', 'Female']).optional(),
}).refine((data) => {
  if (data.role === 'Usher' && !data.gender) return false;
  return true;
}, {
  message: 'Please select your gender',
  path: ['gender'],
});

interface ApiError {
  response?: { data?: { message?: string } };
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'employer' ? 'Employer' : 'Usher';
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', role: defaultRole, gender: undefined },
  });

  const watchedRole = form.watch('role');

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      const payload = { ...values, gender: values.role === 'Usher' ? values.gender : undefined };
      await api.post('/auth/register', payload);
      toast.success('Account created. Please sign in.');
      router.push('/login');
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Role selector */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-normal">
                I want to
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {[
                    { value: 'Usher', icon: <Briefcase className="h-5 w-5" />, label: 'I am a usher', sub: 'Browse event jobs' },
                    { value: 'Employer', icon: <Building2 className="h-5 w-5" />, label: 'I am a company', sub: 'Post event jobs' },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => field.onChange(opt.value)}
                      className={`cursor-pointer rounded-xl border p-4 flex flex-col items-center text-center transition-all duration-200 ${
                        field.value === opt.value
                          ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.94_0.010_82/0.06)]'
                          : 'border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      <div className={`mb-2 p-2 rounded-lg ${field.value === opt.value ? 'bg-primary' : 'bg-muted'}`}>
                        {opt.icon}
                      </div>
                      <div className="text-sm font-medium">{opt.label}</div>
                      <div className="text-[10px] tracking-wider mt-0.5 opacity-60">{opt.sub}</div>
                    </div>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gender selector — only for Ushers */}
        {watchedRole === 'Usher' && (
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-normal">
                  Gender
                </FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {[
                      { value: 'Male', icon: <UserIcon className="h-4 w-4" />, label: 'Male' },
                      { value: 'Female', icon: <UserRoundCog className="h-4 w-4" />, label: 'Female' },
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => field.onChange(opt.value)}
                        className={`cursor-pointer rounded-xl border py-2.5 px-4 flex items-center justify-center gap-2 transition-all duration-200 ${
                          field.value === opt.value
                            ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.94_0.010_82/0.06)]'
                            : 'border-border bg-secondary text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        }`}
                      >
                        {opt.icon}
                        <span className="text-sm font-medium">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage className="text-[oklch(0.70_0.191_22)]" />
              </FormItem>
            )}
          />
        )}

        {/* Name row */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-normal">
                  First Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="h-11 bg-input border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-[oklch(0.70_0.020_82/0.2)] focus-visible:border-[oklch(0.50_0.030_82/0.4)] rounded-xl transition-all"
                    placeholder="Sara"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[oklch(0.70_0.191_22)]" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-normal">
                  Last Name
                </FormLabel>
                <FormControl>
                  <Input
                    className="h-11 bg-input border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-[oklch(0.70_0.020_82/0.2)] focus-visible:border-[oklch(0.50_0.030_82/0.4)] rounded-xl transition-all"
                    placeholder="Ahmed"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[oklch(0.70_0.191_22)]" />
              </FormItem>
            )}
          />
        </div>

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
                  type="email"
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
              <FormLabel className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-normal">
                Password
              </FormLabel>
              <FormControl>
                <Input
                  className="h-11 bg-input border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-[oklch(0.70_0.020_82/0.2)] focus-visible:border-[oklch(0.50_0.030_82/0.4)] rounded-xl transition-all"
                  type="password"
                  placeholder="Min. 6 characters"
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-background">

      {/* ── Left brand panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col items-center justify-center p-16 overflow-hidden bg-background border-r border-border">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[oklch(0.18_0.048_248/0.7)] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-card blur-[100px] pointer-events-none" />

        <motion.div 
          className="relative z-10 text-center flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Keyhole motif */}
          <div className="mb-10 flex justify-center">
            <Logo size="lg" className="drop-shadow-[0_0_40px_oklch(0.94_0.010_82/0.06)]" />
          </div>

          <div className="space-y-4 text-left max-w-xs mx-auto mt-4">
            {[
              'Access Egypt\'s largest usher talent pool',
              'Post jobs and receive applications in minutes',
              'Review profiles, photos and ratings',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[oklch(0.55_0.025_248)] flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <motion.div 
          className="lg:hidden mb-8 text-center flex justify-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Logo size="sm" />
        </motion.div>

        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div className="mb-8">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-3">
              Join the platform
            </p>
            <h2
              className="text-3xl font-light text-foreground tracking-tight"
              style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
            >
              Create your account
            </h2>
          </div>

          <div className="rounded-2xl border border-border bg-secondary backdrop-blur-xl p-8 shadow-[0_8px_40px_oklch(0.08_0.030_248/0.6)]">
            <Suspense fallback={
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            }>
              <RegisterForm />
            </Suspense>
          </div>

          <motion.p 
            className="mt-6 text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[oklch(0.72_0.018_82)] hover:text-foreground transition-colors font-medium"
            >
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
