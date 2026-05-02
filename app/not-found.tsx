"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Ambient background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full opacity-15 blur-3xl"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.7) 0%, transparent 70%)' }}
      />

      <div
        className="relative z-10 flex w-full max-w-lg flex-col items-center text-center"
        style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}
      >
        {/* 404 number */}
        <div className="relative mb-6 select-none">
          <span
            className="block text-[9rem] font-black leading-none tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--foreground)) 30%, hsl(var(--primary)) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            404
          </span>
          {/* Glitch shadow layer */}
          <span
            aria-hidden
            className="absolute inset-0 block text-[9rem] font-black leading-none tracking-tighter opacity-[0.06]"
            style={{
              transform: 'translate(3px, 3px)',
              color: 'hsl(var(--primary))',
            }}
          >
            404
          </span>
        </div>

        {/* Divider */}
        <div
          className="mb-6 h-px w-16"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)' }}
        />

        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-muted-foreground">
          The page you're looking for doesn't exist, was moved, or the username
          hasn't been claimed yet.
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-medium text-foreground transition-all hover:bg-muted hover:scale-[1.02] active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>

        {/* Footer hint */}
        <p className="mt-10 text-xs text-muted-foreground/60">
          If you expected a creator profile here, they may not have signed up yet.
        </p>
      </div>
    </main>
  );
}
