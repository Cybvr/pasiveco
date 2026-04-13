'use client';

import { useCurrency } from '@/context/CurrencyContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type CurrencyCode, CURRENCIES } from '@/utils/currency';
import { cn } from '@/lib/utils';

const CURRENCY_OPTIONS = Object.entries(CURRENCIES).map(([code, { flag, label }]) => ({
  code: code as CurrencyCode,
  flag,
  label,
}));

interface CurrencySelectorProps {
  /** Tailwind classes applied to the trigger button */
  className?: string;
  /** Show the full country name next to the code */
  showLabel?: boolean;
}

/**
 * Reusable currency switcher that reads/writes to CurrencyContext.
 * Can be placed in any layout – marketing header, dashboard header, etc.
 */
export function CurrencySelector({ className, showLabel = false }: CurrencySelectorProps) {
  const { currency, setCurrency } = useCurrency();

  const selected = CURRENCY_OPTIONS.find((o) => o.code === currency);

  return (
    <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
      <SelectTrigger
        className={cn(
          'h-8 w-[105px] rounded-md border-border/60 bg-transparent text-xs font-medium focus:ring-0 focus:ring-offset-0',
          className
        )}
        aria-label="Select currency"
      >
        <SelectValue>
          <span className="flex items-center gap-1.5 leading-none">
            <span>{selected?.flag}</span>
            <span>{currency}</span>
            {showLabel && selected ? (
              <span className="text-muted-foreground">{selected.label}</span>
            ) : null}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {CURRENCY_OPTIONS.map(({ code, flag, label }) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              <span>{flag}</span>
              <span className="font-medium">{code}</span>
              <span className="text-xs text-muted-foreground">{label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
