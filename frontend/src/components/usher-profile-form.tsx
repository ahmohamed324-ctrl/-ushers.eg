'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2, Upload, Camera, Save } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import api, { getBackendOrigin } from '@/lib/axios';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Required'),
  lastName: z.string().min(2, 'Required'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  age: z.coerce.number().optional(),
  university: z.string().optional(),
  school: z.string().optional(),
  skills: z.string().optional(),
  languages: z.string().optional(),
  nationality: z.string().optional(),
  yearsOfExperience: z.coerce.number().optional(),
  height: z.string().optional(),
  appearance: z.string().optional(),
  expectedSalaryPerDay: z.coerce.number().optional(),
  hasTransportation: z.boolean().default(false),
  availableWeekends: z.boolean().default(true),
});

export function UsherProfileForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formalPhoto, setFormalPhoto] = useState<string | null>(null);
  const [casualPhoto, setCasualPhoto] = useState<string | null>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      hasTransportation: false,
      availableWeekends: true,
    } as any,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        const data = res.data.data;
        
        form.reset({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          bio: data.bio || '',
          location: data.location || '',
          age: data.usherProfile?.age || undefined,
          university: data.usherProfile?.university || '',
          school: data.usherProfile?.school || '',
          skills: data.usherProfile?.skills || '',
          languages: data.usherProfile?.languages || '',
          nationality: data.usherProfile?.nationality || '',
          yearsOfExperience: data.usherProfile?.yearsOfExperience || undefined,
          height: data.usherProfile?.height || '',
          appearance: data.usherProfile?.appearance || '',
          expectedSalaryPerDay: data.usherProfile?.expectedSalaryPerDay || undefined,
          hasTransportation: data.usherProfile?.hasTransportation || false,
          availableWeekends: data.usherProfile?.availableWeekends ?? true,
        });

        const timestamp = new Date().getTime();
        const origin = getBackendOrigin();
        if (data.usherProfile?.formalPhotoUrl) {
          setFormalPhoto(`${origin}${data.usherProfile.formalPhotoUrl}?t=${timestamp}`);
        }
        if (data.usherProfile?.casualPhotoUrl) {
          setCasualPhoto(`${origin}${data.usherProfile.casualPhotoUrl}?t=${timestamp}`);
        }
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [form]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsSaving(true);
    try {
      // 1. Update basic profile
      await api.put('/users/profile', {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        bio: values.bio,
        location: values.location,
      });

      // 2. Update usher specific profile
      await api.put('/users/usher-profile', {
        age: values.age,
        university: values.university,
        school: values.school,
        skills: values.skills,
        languages: values.languages,
        nationality: values.nationality,
        yearsOfExperience: values.yearsOfExperience,
        height: values.height,
        appearance: values.appearance,
        hasTransportation: values.hasTransportation,
        availableWeekends: values.availableWeekends,
        expectedSalaryPerDay: values.expectedSalaryPerDay,
      });

      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'formal' | 'casual') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading(`Uploading ${type} photo...`);
    try {
      const endpoint = type === 'formal' ? '/users/upload-formal-photo' : '/users/upload-casual-photo';
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const timestamp = new Date().getTime();
      const origin = getBackendOrigin();
      const newUrl = `${origin}${res.data.data}?t=${timestamp}`;
      if (type === 'formal') setFormalPhoto(newUrl);
      else setCasualPhoto(newUrl);
      
      toast.success('Photo uploaded successfully!', { id: toastId });
    } catch {
      toast.error('Failed to upload photo', { id: toastId });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Photo Uploads */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 bg-muted/20">
          <h3 className="font-medium">Formal / Professional Photo</h3>
          <p className="text-sm text-muted-foreground text-center">A clear, well-lit headshot in professional attire.</p>
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-background shadow-lg bg-muted flex items-center justify-center">
            {formalPhoto ? (
              <Image src={formalPhoto} alt="Formal Photo" fill className="object-cover" />
            ) : (
              <Camera className="h-10 w-10 text-muted-foreground opacity-50" />
            )}
          </div>
          <div>
            <input type="file" id="formal-upload" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => handlePhotoUpload(e, 'formal')} />
            <Button variant="outline" onClick={() => document.getElementById('formal-upload')?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Upload Formal
            </Button>
          </div>
        </div>

        <div className="border rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 bg-muted/20">
          <h3 className="font-medium">Casual / Full Body Photo</h3>
          <p className="text-sm text-muted-foreground text-center">A high-quality full body or casual photo.</p>
          <div className="relative w-40 h-40 rounded-xl overflow-hidden border-4 border-background shadow-lg bg-muted flex items-center justify-center">
            {casualPhoto ? (
              <Image src={casualPhoto} alt="Casual Photo" fill className="object-cover" />
            ) : (
              <Camera className="h-10 w-10 text-muted-foreground opacity-50" />
            )}
          </div>
          <div>
            <input type="file" id="casual-upload" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={(e) => handlePhotoUpload(e, 'casual')} />
            <Button variant="outline" onClick={() => document.getElementById('casual-upload')?.click()}>
              <Upload className="mr-2 h-4 w-4" /> Upload Casual
            </Button>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="age" render={({ field }) => (
                <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>City / Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="nationality" render={({ field }) => (
                <FormItem><FormLabel>Nationality</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary">Education & Appearance</h3>
              <FormField control={form.control} name="university" render={({ field }) => (
                <FormItem><FormLabel>University</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="school" render={({ field }) => (
                <FormItem><FormLabel>School (if applicable)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="appearance" render={({ field }) => (
                  <FormItem><FormLabel>Appearance / Build</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-primary">Professional Details</h3>
            <FormField control={form.control} name="bio" render={({ field }) => (
              <FormItem><FormLabel>Professional Bio</FormLabel><FormControl><Textarea className="h-24" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <div className="grid md:grid-cols-2 gap-6">
              <FormField control={form.control} name="skills" render={({ field }) => (
                <FormItem><FormLabel>Skills (comma separated)</FormLabel><FormControl><Input placeholder="e.g. VIP Hosting, Registration, Fluent English" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="languages" render={({ field }) => (
                <FormItem><FormLabel>Languages</FormLabel><FormControl><Input placeholder="e.g. English, Arabic, French" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="yearsOfExperience" render={({ field }) => (
                <FormItem><FormLabel>Years of Experience</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="expectedSalaryPerDay" render={({ field }) => (
                <FormItem><FormLabel>Expected Salary per Day (EGP)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4">
              <FormField control={form.control} name="hasTransportation" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Transportation</FormLabel>
                    <p className="text-sm text-muted-foreground">Do you have your own car?</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="availableWeekends" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Weekend Availability</FormLabel>
                    <p className="text-sm text-muted-foreground">Are you available to work on weekends?</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button type="submit" size="lg" className="px-8 rounded-full" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
