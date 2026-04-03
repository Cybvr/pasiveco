import React, { useEffect, useState } from 'react';
import { Globe, Wallet, DollarSign, CreditCard } from 'lucide-react';
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
    <section className="px-6 py-40 bg-background relative overflow-hidden border-t border-border">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <div className="inline-block px-3 py-1 border border-primary/20 text-[10px] uppercase tracking-[0.3em] text-primary font-mono bg-primary/5">
            Global Infrastructure
          </div>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] uppercase">
            Receive funds in your <br />
            <span className="opacity-40">preferred</span> <br />
            <span className="italic font-light">currency</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
            Your audience is global. Your payouts should be too. Whether you're in Lagos or London, New York or Nairobi, Pasive ensures your earnings land exactly where you want them.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-8 pt-8">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-primary">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold uppercase">Stripe Payouts</h3>
              <p className="text-sm text-muted-foreground">Seamless USD, EUR, and GBP collections for creators targeting Western markets via Stripe Connect.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold uppercase">Local Payouts</h3>
              <p className="text-sm text-muted-foreground">Direct Naira, KES, and GHS payouts via Flutterwave integration for African creators.</p>
            </div>
          </div>
        </div>

        <div className="relative group">
          {/* Visual representation of currency symbols */}
          <div className="grid grid-cols-2 gap-4 relative z-10">
            {[
              { symbol: '$', label: 'USD', color: 'bg-blue-500/10 text-blue-500', border: 'border-blue-500/20' },
              { symbol: '₦', label: 'NGN', color: 'bg-emerald-500/10 text-emerald-500', border: 'border-emerald-500/20' },
              { symbol: '£', label: 'GBP', color: 'bg-purple-500/10 text-purple-500', border: 'border-purple-500/20' },
              { symbol: '€', label: 'EUR', color: 'bg-amber-500/10 text-amber-500', border: 'border-amber-500/20' },
            ].map((item, i) => (
              <div 
                key={i} 
                className={`aspect-square flex flex-col items-center justify-center border ${item.border} ${item.color} group-hover:scale-105 transition-transform duration-500 relative overflow-hidden bg-card/50 backdrop-blur-sm`}
              >
                <div className="absolute -bottom-4 -right-4 opacity-10 text-8xl font-black italic select-none">
                  {item.symbol}
                </div>
                <span className="text-4xl md:text-6xl font-bold z-10">{item.symbol}</span>
                <span className="text-xs font-mono tracking-[0.2em] mt-3 uppercase opacity-60 z-10 font-bold">{item.label}</span>
              </div>
            ))}
          </div>
          
          {/* Decorative floating elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[150px] animate-pulse delay-1000 pointer-events-none" />
          
          {/* Added a floating card for "Trusted" */}
          <div className="absolute -bottom-6 -right-6 bg-foreground text-background p-6 shadow-2xl z-20 hidden md:block">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-foreground bg-zinc-800" />
                ))}
              </div>
              <div className="text-xs font-bold uppercase tracking-tight">
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
