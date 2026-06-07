'use client';

import { Mail } from 'lucide-react';
import { Logo } from './logo';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <footer className={`border-t border-border bg-background py-8 mt-auto transition-all duration-300 ${isDashboard ? 'md:pl-60' : ''}`}>
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-center md:items-start gap-2">
          <Logo size="sm" withText={true} />
          <p className="text-xs text-muted-foreground mt-2 text-center md:text-left max-w-sm">
            The premium staffing marketplace for elite event professionals in Egypt.
          </p>
        </div>
        
        <div className="flex items-center gap-6 mt-4 md:mt-0">
          <a
            href="https://www.instagram.com/ushers.eg/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center p-2 bg-muted rounded-full border border-border hover:border-[oklch(0.35_0.044_248)]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect height="20" rx="5" ry="5" width="20" x="2" y="2" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <span className="sr-only">Instagram</span>
          </a>
          <a
            href="https://www.linkedin.com/in/ushers-eg-0809ab40a/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center p-2 bg-muted rounded-full border border-border hover:border-[oklch(0.35_0.044_248)]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect height="12" width="4" x="2" y="9" />
              <circle cx="4" cy="4" r="2" />
            </svg>
            <span className="sr-only">LinkedIn</span>
          </a>
          <a
            href="mailto:ushers.recruting@gmail.com"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center p-2 bg-muted rounded-full border border-border hover:border-[oklch(0.35_0.044_248)]"
          >
            <Mail className="h-5 w-5" />
            <span className="sr-only">Email</span>
          </a>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center text-[10px] text-muted-foreground tracking-wider">
        <p>© {new Date().getFullYear()} ushers.eg. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Powered by ushers.eg Team</p>
      </div>
    </footer>
  );
}
