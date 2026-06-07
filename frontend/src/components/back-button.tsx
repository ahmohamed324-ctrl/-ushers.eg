'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from './ui/button';

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide the back button on the homepage since there's nowhere to go back to.
  if (pathname === '/') return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
      onClick={() => router.back()}
      aria-label="Go back"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  );
}
