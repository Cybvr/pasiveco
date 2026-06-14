import React, { useEffect, useState } from 'react';
import { Globe, Wallet } from 'lucide-react';
import { getUserCount } from '@/services/userService';

const CurrencyPayoutSection = () => {
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserCount = async () => {
      const count = await getUserCount();
      setUserCount(count);
    };
    fetchUserCount();
  }, []);

  const displayCount = userCount !== null ? (userCount >= 1000 ? `${(userCount / 1000).toFixed(1)}k+` : userCount) : '...';

  return (
    <section className="relative overflow-hidden border-t border-border bg-background px-6 py-40">
      <div className="mx-auto grid max-w-7xl items-center gap-20 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="inline-block bg-primary/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Global Infrastructure
          </div>
          <h2 className="text-5xl font-bold uppercase leading-[0.9] tracking-tight text-foreground md:text-7xl lg:text-8xl">
            Receive funds in your <br />
            <span className="text-foreground">preferred</span> <br />
            <span className="italic text-foreground">currency</span>
          </h2>
          <p className="max-w-lg text-xl leading-relaxed text-muted-foreground">
            Your audience is global. Your payouts should be too. Whether you&apos;re in Lagos or London, New York or Nairobi, Pasive ensures your earnings land exactly where you want them.
          </p>

          <div className="grid gap-8 pt-8 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center bg-primary/10 text-primary">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold uppercase text-foreground">Stripe Payouts</h3>
              <p className="text-sm text-muted-foreground">Seamless USD, EUR, and GBP collections for creators targeting Western markets via Stripe Connect.</p>
            </div>
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center bg-emerald-500/10 text-emerald-500">
                <Wallet className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold uppercase text-foreground">Local Payouts</h3>
              <p className="text-sm text-muted-foreground">Direct Naira, KES, and GHS payouts via Flutterwave integration for African creators.</p>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="relative z-10 grid grid-cols-2 gap-4">
            {[
              { symbol: '$', label: 'USD', accent: 'bg-blue-500/10', border: 'border-blue-500/20' },
              { symbol: '₦', label: 'NGN', accent: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
              { symbol: '£', label: 'GBP', accent: 'bg-purple-500/10', border: 'border-purple-500/20' },
              { symbol: '€', label: 'EUR', accent: 'bg-amber-500/10', border: 'border-amber-500/20' },
            ].map((item, i) => (
              <div
                key={i}
                className={`relative aspect-square overflow-hidden border bg-card/50 backdrop-blur-sm ${item.border} ${item.accent} flex flex-col items-center justify-center transition-transform duration-500 group-hover:scale-105`}
              >
                <div className="absolute -bottom-4 -right-4 select-none text-8xl font-black italic text-muted-foreground/20">
                  {item.symbol}
                </div>
                <span className="z-10 text-4xl font-bold text-foreground md:text-6xl">{item.symbol}</span>
                <span className="z-10 mt-3 font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 animate-pulse rounded-full bg-primary/10 blur-[120px]" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 animate-pulse rounded-full bg-blue-500/5 blur-[150px] delay-1000" />

          <div className="absolute -bottom-6 -right-6 z-20 hidden bg-card p-6 text-foreground shadow-2xl md:block">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-foreground bg-zinc-800" />
                ))}
              </div>
              <div className="text-xs font-bold uppercase tracking-tight text-foreground">
                Used by {displayCount} <br /> global creators
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrencyPayoutSection;
