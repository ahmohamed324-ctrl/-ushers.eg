'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Upload, Building, Save } from 'lucide-react';
import Image from 'next/image';

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
import { Textarea } from '@/components/ui/textarea';
import api, { getBackendOrigin } from '@/lib/axios';

const companySchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().optional(),
  website: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  companySize: z.string().optional(),
  companyDescription: z.string().optional(),
  location: z.string().optional(),
});

export function CompanyProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const form = useForm<z.infer<typeof companySchema>>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: '',
      industry: '',
      website: '',
      companySize: '',
      companyDescription: '',
      location: '',
    },
  });

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get('/companies/my');
        const data = res.data.data;
        if (data) {
          form.reset({
            companyName: data.name || '',
            industry: data.industry || '',
            website: data.website || '',
            companySize: data.companySize || '',
            companyDescription: data.description || '',
            location: data.location || '',
          });
          if (data.logoUrl) {
            const origin = getBackendOrigin();
            setLogoUrl(`${origin}${data.logoUrl}`);
          }
        }
      } catch {
        // It's okay if company doesn't exist yet
        console.log("No company profile found yet");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompany();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof companySchema>) => {
    setIsSaving(true);
    try {
      // Assuming you have an endpoint like POST/PUT /companies to update company info
      // I will map the payload to match what a typical company DTO might look like
      const payload = {
        name: values.companyName,
        industry: values.industry,
        website: values.website,
        companySize: values.companySize,
        description: values.companyDescription,
        location: values.location,
      };
      
      // using POST for create/update as defined in backend CompaniesController
      await api.post('/companies', payload);
      toast.success('Company profile saved successfully!');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save company profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Uploading company logo...');
    try {
      const res = await api.post('/companies/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const origin = getBackendOrigin();
      const newUrl = `${origin}${res.data.data}`;
      setLogoUrl(newUrl);
      toast.success('Logo uploaded successfully!', { id: toastId });
    } catch {
      toast.error('Failed to upload logo', { id: toastId });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Logo Upload */}
      <div className="border rounded-2xl p-8 flex flex-col items-center justify-center space-y-4 bg-muted/20">
        <h3 className="font-medium text-lg">Company Logo</h3>
        <p className="text-sm text-muted-foreground text-center">Upload your company logo for brand visibility.</p>
        <div className="relative w-32 h-32 rounded-xl overflow-hidden border-4 border-background shadow-lg bg-white flex items-center justify-center">
          {logoUrl ? (
            <Image src={logoUrl} alt="Company Logo" fill className="object-contain p-2" priority />
          ) : (
            <Building className="h-10 w-10 text-muted-foreground opacity-30" />
          )}
        </div>
        <div>
          <input type="file" id="logo-upload" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleLogoUpload} />
          <Button variant="outline" onClick={() => document.getElementById('logo-upload')?.click()}>
            <Upload className="mr-2 h-4 w-4" /> Upload Logo
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <FormField control={form.control} name="companyName" render={({ field }) => (
              <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input className="bg-muted/30" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="industry" render={({ field }) => (
              <FormItem><FormLabel>Industry</FormLabel><FormControl><Input className="bg-muted/30" placeholder="e.g. Event Management, Technology" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem><FormLabel>Website</FormLabel><FormControl><Input className="bg-muted/30" type="url" placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="companySize" render={({ field }) => (
              <FormItem><FormLabel>Company Size</FormLabel><FormControl><Input className="bg-muted/30" placeholder="e.g. 1-10, 50-100" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>

          <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem><FormLabel>Headquarters / Location</FormLabel><FormControl><Input className="bg-muted/30" {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          <FormField control={form.control} name="companyDescription" render={({ field }) => (
            <FormItem><FormLabel>About the Company</FormLabel><FormControl><Textarea className="h-32 bg-muted/30" placeholder="Tell us about what you do..." {...field} /></FormControl><FormMessage /></FormItem>
          )} />

          <div className="flex justify-end pt-6 border-t">
            <Button type="submit" size="lg" className="px-8 rounded-full" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Save Profile
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
