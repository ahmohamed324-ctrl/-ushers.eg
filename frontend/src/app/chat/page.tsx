'use client';

import { MessageSquare } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function ChatPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-background px-4">
      {/* Background watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none select-none">
        <Logo size="xl" withText={false} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center max-w-sm">
        {/* Icon */}
        <div className="h-20 w-20 rounded-full bg-muted border border-[oklch(0.24_0.044_248/0.5)] flex items-center justify-center">
          <MessageSquare className="h-9 w-9 text-muted-foreground" />
        </div>

        {/* Label */}
        <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
          Messaging
        </p>

        {/* Title */}
        <h1
          className="text-3xl font-light text-card-foreground tracking-tight"
          style={{ fontFamily: 'var(--font-display), Georgia, serif' }}
        >
          Chat Coming Soon
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Direct messaging between employers and ushers is on the way.
          You&apos;ll be able to coordinate events and interviews right here.
        </p>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-[oklch(0.22_0.044_248/0.4)]" />
          <div className="h-1 w-1 rounded-full bg-primary" />
          <div className="flex-1 h-px bg-[oklch(0.22_0.044_248/0.4)]" />
        </div>

        <p className="text-xs text-[oklch(0.38_0.026_248)]">
          We&apos;re building something great — stay tuned.
        </p>
      </div>
    </div>
  );
}
