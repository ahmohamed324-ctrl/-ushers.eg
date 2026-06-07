'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, PlusCircle, CheckCircle2, MessageCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/axios';

const quoteSchema = z.object({
  eventType: z.string().min(2, 'Event type is required'),
  location: z.string().min(2, 'Location is required'),
  workingHours: z.string().min(1, 'Working hours are required'),
  numberOfUshers: z.coerce.number().min(1, 'Must have at least 1 usher'),
  gender: z.enum(['Male', 'Female', 'Mixed']),
  usherClass: z.enum(['A', 'B', 'C']),
  transportationProvided: z.enum(['Yes', 'No']),
  pocketMoneyIncluded: z.enum(['Yes', 'No']),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

// ─── Chat bubble component ───────────────────────────────────────────────────
function ChatBubble({ summary }: { summary: QuoteFormValues }) {
  return (
    <div className="flex flex-col gap-4">
      {/* User request bubble (right) */}
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary text-[oklch(0.12_0.040_248)] px-4 py-3 text-sm shadow-[0_4px_16px_oklch(0.94_0.010_82/0.15)]">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-[oklch(0.30_0.042_248)] mb-2">
            Your Request
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div><span className="font-semibold">Event type:</span> {summary.eventType}</div>
            <div><span className="font-semibold">Location:</span> {summary.location}</div>
            <div><span className="font-semibold">Working hours:</span> {summary.workingHours}</div>
            <div><span className="font-semibold">Ushers:</span> {summary.numberOfUshers}</div>
            <div><span className="font-semibold">Gender:</span> {summary.gender}</div>
            <div><span className="font-semibold">Class:</span> {summary.usherClass}</div>
            <div><span className="font-semibold">Transportation:</span> {summary.transportationProvided}</div>
            <div><span className="font-semibold">Pocket money:</span> {summary.pocketMoneyIncluded}</div>
          </div>
        </div>
      </div>

      {/* Team response bubble (left) */}
      <div className="flex items-end gap-3">
        <div className="h-8 w-8 rounded-full bg-muted border border-input flex items-center justify-center flex-shrink-0">
          <MessageCircle className="h-4 w-4 text-[oklch(0.70_0.020_82)]" />
        </div>
        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-muted border border-[oklch(0.26_0.044_248/0.4)] px-4 py-3 text-sm text-card-foreground shadow-[0_4px_16px_oklch(0.08_0.030_248/0.4)]">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-2">
            ushers.eg Team
          </p>
          <p className="leading-relaxed text-xs text-[oklch(0.85_0.012_82)]">
            Hi! Thanks for reaching out. We&apos;d love to help make your event a success! 😊
          </p>
          <p className="mt-2 leading-relaxed text-xs text-[oklch(0.85_0.012_82)]">
            We&apos;ve received your request and our team is reviewing it now. We&apos;ll get back to you with an accurate quote right away. Thanks!
          </p>
          <p className="mt-2 text-[10px] text-muted-foreground">Just now · ushers.eg</p>
        </div>
      </div>
    </div>
  );
}

export function PostJobDialog({
  onJobPosted,
  trigger,
}: {
  onJobPosted?: () => void;
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [submittedValues, setSubmittedValues] = useState<QuoteFormValues | null>(null);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema) as any,
    defaultValues: {
      eventType: '',
      location: '',
      workingHours: '',
      numberOfUshers: 1,
      gender: 'Mixed',
      usherClass: 'A',
      transportationProvided: 'No',
      pocketMoneyIncluded: 'No',
    },
  });

  async function onSubmit(values: QuoteFormValues) {
    setIsLoading(true);
    try {
      // Post the job using existing endpoint with quote-style payload
      await api.post('/jobs', {
        title: `Quote Request — ${values.eventType}`,
        description: [
          `Event type: ${values.eventType}`,
          `Location: ${values.location}`,
          `Working hours: ${values.workingHours}`,
          `Number of ushers: ${values.numberOfUshers}`,
          `Gender: ${values.gender}`,
          `Usher class: ${values.usherClass}`,
          `Transportation provided: ${values.transportationProvided}`,
          `Pocket money included: ${values.pocketMoneyIncluded}`,
        ].join('\n'),
        category: 'Ushering',
        location: values.location,
        type: 'Event',
        experienceLevel: 'Entry',
        isRemote: false,
        openingsCount: values.numberOfUshers,
      });

      setSubmittedValues(values);
      setStep('success');
      if (onJobPosted) onJobPosted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit quote request');
    } finally {
      setIsLoading(false);
    }
  }

  function handleClose(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setTimeout(() => {
        setStep('form');
        setSubmittedValues(null);
        form.reset();
      }, 300);
    }
  }

  const labelClass =
    'text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-normal';
  const inputClass =
    'h-10 bg-input border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-[oklch(0.70_0.020_82/0.2)] focus-visible:border-[oklch(0.50_0.030_82/0.4)] rounded-xl transition-all text-sm';
  const selectClass =
    'h-10 bg-input border-input text-foreground rounded-xl text-sm';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button
              size="lg"
              className="h-11 px-6 text-xs font-medium tracking-widest uppercase rounded-xl bg-primary text-primary-foreground hover:bg-white border-0 shadow-[0_4px_20px_oklch(0.94_0.010_82/0.12)] hover:shadow-[0_6px_28px_oklch(0.94_0.010_82/0.22)] transition-all duration-300 hover:-translate-y-0.5"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Request a Quote
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-[600px] max-h-[92vh] overflow-y-auto bg-card border-[oklch(0.26_0.046_248/0.6)] shadow-[0_24px_80px_oklch(0.08_0.030_248/0.9)]">
        {step === 'form' ? (
          <>
            <DialogHeader className="mb-2">
              <DialogTitle
                className="text-2xl font-light text-foreground tracking-tight"
                style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
              >
                Request a Quote
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Share your event details and we&apos;ll get back to you with an accurate quote.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                {/* Event Type */}
                <FormField
                  control={form.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Event Type</FormLabel>
                      <FormControl>
                        <Input className={inputClass} placeholder="e.g. Corporate Conference, Wedding, Exhibition" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location + Working Hours */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Location</FormLabel>
                        <FormControl>
                          <Input className={inputClass} placeholder="e.g. Cairo, New Capital" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Working Hours</FormLabel>
                        <FormControl>
                          <Input className={inputClass} placeholder="e.g. 9 AM – 5 PM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Number of Ushers + Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="numberOfUshers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Number of Ushers</FormLabel>
                        <FormControl>
                          <Input className={inputClass} type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={selectClass}>
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Usher Class + Transportation + Pocket Money */}
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="usherClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Usher Class</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={selectClass}>
                              <SelectValue placeholder="Class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">Class A</SelectItem>
                            <SelectItem value="B">Class B</SelectItem>
                            <SelectItem value="C">Class C</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transportationProvided"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Transportation?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={selectClass}>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pocketMoneyIncluded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Pocket Money?</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className={selectClass}>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[oklch(0.20_0.044_248/0.4)]">
                  <button
                    type="button"
                    onClick={() => handleClose(false)}
                    className="px-5 py-2 rounded-xl text-xs tracking-widest uppercase border border-[oklch(0.24_0.044_248/0.5)] text-muted-foreground hover:border-[oklch(0.34_0.040_248)] hover:text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-6 py-2 rounded-xl text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-white transition-all duration-300 font-semibold shadow-[0_4px_16px_oklch(0.94_0.010_82/0.15)] disabled:opacity-50"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoading ? 'Submitting...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </Form>
          </>
        ) : (
          <>
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[oklch(0.25_0.08_142/0.15)] border border-[oklch(0.30_0.08_142/0.25)] flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-[oklch(0.65_0.08_142)]" />
                </div>
                <div>
                  <DialogTitle
                    className="text-xl font-light text-foreground tracking-tight"
                    style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
                  >
                    Quote Request Sent!
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-xs mt-0.5">
                    Our team will review your request and respond shortly.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {submittedValues && (
              <div className="rounded-2xl border border-border bg-[oklch(0.12_0.034_248/0.5)] p-4">
                <ChatBubble summary={submittedValues} />
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => handleClose(false)}
                className="px-6 py-2 rounded-xl text-xs tracking-widest uppercase bg-primary text-primary-foreground hover:bg-white transition-all duration-300 font-semibold shadow-[0_4px_16px_oklch(0.94_0.010_82/0.15)]"
              >
                Done
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
