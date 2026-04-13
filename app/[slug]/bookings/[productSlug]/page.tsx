"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar, Clock, MapPin, Video, ChevronLeft, ChevronRight,
  CheckCircle2, Loader2, ArrowLeft, User, Mail, Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getUserByUsername } from '@/services/userService';
import { getUserProducts, Product } from '@/services/productsService';
import type { IntakeFormField } from '@/services/productsService';
import { getAvailableSlots, createAppointment } from '@/services/bookingService';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, convertAmount } from '@/utils/currency';
import Link from 'next/link';

const LOCATION_LABELS: Record<string, string> = {
  zoom: 'Zoom',
  google_meet: 'Google Meet',
  skype: 'Skype',
  physical: 'In-Person',
  other: 'Online',
};

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// ─── Tiny calendar component ─────────────────────────────────────────────────
function MiniCalendar({ selectedDate, onSelect, minDate }: {
  selectedDate: string | null;
  onSelect: (d: string) => void;
  minDate: string;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const isoDate = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${viewYear}-${m}-${d}`;
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(v => v - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(v => v + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="p-1 rounded hover:bg-muted transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="p-1 rounded hover:bg-muted transition-colors">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center">
        {DAYS_SHORT.map(d => (
          <span key={d} className="text-[10px] font-medium text-muted-foreground py-1">{d}</span>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const iso = isoDate(day);
          const isPast = iso < minDate;
          const isSelected = iso === selectedDate;
          return (
            <button
              key={day}
              disabled={isPast}
              onClick={() => onSelect(iso)}
              className={`aspect-square rounded-lg text-xs font-medium transition-colors
                ${isPast ? 'text-muted-foreground/30 cursor-not-allowed' : ''}
                ${isSelected ? 'bg-primary text-primary-foreground' : !isPast ? 'hover:bg-muted text-foreground' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Intake field renderer ────────────────────────────────────────────────────
function IntakeField({
  field,
  value,
  onChange,
}: {
  field: IntakeFormField;
  value: string | string[];
  onChange: (v: string | string[]) => void;
}) {
  const base = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  switch (field.type) {
    case 'textarea':
      return <textarea className={`${base} min-h-[80px] resize-none`} placeholder={field.placeholder} value={value as string} onChange={e => onChange(e.target.value)} required={field.required} />;
    case 'email':
      return <input type="email" className={base} placeholder={field.placeholder || 'you@example.com'} value={value as string} onChange={e => onChange(e.target.value)} required={field.required} />;
    case 'phone':
      return <input type="tel" className={base} placeholder={field.placeholder || '+234 800 000 0000'} value={value as string} onChange={e => onChange(e.target.value)} required={field.required} />;
    case 'date':
      return <input type="date" className={base} value={value as string} onChange={e => onChange(e.target.value)} required={field.required} />;
    case 'radio':
      return (
        <div className="space-y-1.5">
          {(field.options || []).map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(opt)}
                className="accent-primary"
                required={field.required}
              />
              {opt}
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="space-y-1.5">
          {(field.options || []).map(opt => {
            const arr = Array.isArray(value) ? value : [];
            return (
              <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  value={opt}
                  checked={arr.includes(opt)}
                  className="accent-primary"
                  onChange={e => {
                    if (e.target.checked) onChange([...arr, opt]);
                    else onChange(arr.filter(v => v !== opt));
                  }}
                />
                {opt}
              </label>
            );
          })}
        </div>
      );
    case 'select':
      return (
        <select className={base} value={value as string} onChange={e => onChange(e.target.value)} required={field.required}>
          <option value="">Select an option...</option>
          {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    default:
      return <input type="text" className={base} placeholder={field.placeholder} value={value as string} onChange={e => onChange(e.target.value)} required={field.required} />;
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BookingDetailPage() {
  const { slug, productSlug } = useParams<{ slug: string; productSlug: string }>();
  const router = useRouter();
  const { currency: userCurrency, rates } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [creatorId, setCreatorId] = useState('');
  const [loading, setLoading] = useState(true);

  // Wizard steps: 0 = pick date, 1 = pick slot, 2 = fill form, 3 = confirmed
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Intake answers: fieldId → value
  const [intakeAnswers, setIntakeAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // ── Load product ────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const profile = await getUserByUsername(slug ?? '');
        const uid = profile?.userId || profile?.id;
        if (!uid) return;
        setCreatorId(uid);
        const all = await getUserProducts(uid);
        const found = all.find(
          p => (p.slug === productSlug || p.id === productSlug) && p.category === 'booking' && p.status === 'active'
        );
        setProduct(found || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, productSlug]);

  // ── Fetch slots when date changes ───────────────────────────────────────────
  useEffect(() => {
    if (!selectedDate || !product) return;
    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSlots([]);
      try {
        const available = await getAvailableSlots(
          product.id!,
          selectedDate,
          product.details?.availability || [],
          product.details?.sessionLength || 60
        );
        setSlots(available);
      } catch (err) {
        console.error(err);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [selectedDate, product]);

  const formatPrice = (price: number, cur: string) => {
    if (price === 0) return 'Free';
    return formatCurrency(convertAmount(price, (cur || 'NGN') as any, userCurrency, rates), userCurrency);
  };

  const validateIntakeForm = () => {
    const fields = product?.details?.intakeForm || [];
    for (const field of fields) {
      if (field.required) {
        const ans = intakeAnswers[field.id];
        const empty = !ans || (Array.isArray(ans) ? ans.length === 0 : ans.trim() === '');
        if (empty) {
          toast.error(`Please answer: "${field.label}"`);
          return false;
        }
      }
    }
    return true;
  };

  const handleConfirm = async () => {
    if (!product || !selectedDate || !selectedSlot) return;
    if (!customerName.trim() || !customerEmail.trim()) {
      toast.error('Please enter your name and email.');
      return;
    }
    if (!validateIntakeForm()) return;

    setSubmitting(true);
    try {
      await createAppointment({
        productId: product.id!,
        creatorId,
        creatorSlug: slug,
        productName: product.name,
        date: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
        intakeAnswers,
        locationType: product.details?.locationType,
        locationDetail: product.details?.locationDetail,
        status: 'confirmed',
        price: product.price,
        currency: product.currency,
      });
      setStep(3);
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Loading / not found ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-muted-foreground">This booking session is not available.</p>
        <Link href={`/${slug}/bookings`} className="text-sm text-primary underline">← Back to bookings</Link>
      </div>
    );
  }

  const details = product.details || {};
  const intakeFields = details.intakeForm || [];
  const locationType = details.locationType || 'other';
  const isPhysical = locationType === 'physical';

  // ─── Step 3: Confirmed ─────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="max-w-lg mx-auto py-10">
        <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground">Booking Confirmed!</h2>
          <p className="text-sm text-muted-foreground">
            Your session with <span className="font-semibold text-foreground">@{slug}</span> is confirmed.
          </p>
          <div className="rounded-xl bg-muted/40 p-4 text-left space-y-2 text-sm">
            <div className="flex gap-2 items-center">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{new Date(selectedDate! + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex gap-2 items-center">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{selectedSlot?.start} – {selectedSlot?.end}</span>
            </div>
            <div className="flex gap-2 items-center">
              {isPhysical ? <MapPin className="h-4 w-4 text-muted-foreground shrink-0" /> : <Video className="h-4 w-4 text-muted-foreground shrink-0" />}
              <span>{LOCATION_LABELS[locationType]}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            A confirmation email has been sent to <strong>{customerEmail}</strong>. The creator will share the meeting details before your session.
          </p>
          <Button variant="outline" className="w-full" onClick={() => router.push(`/${slug}/bookings`)}>
            ← Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  // ─── Main wizard ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link href={`/${slug}/bookings`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3 w-3" /> Back to bookings
      </Link>

      {/* Product header */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {product.thumbnail && (
          <div className="w-full h-44 overflow-hidden">
            <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-foreground">{product.name}</h1>
              {product.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: product.description }} />
              )}
            </div>
            <span className="font-bold text-base text-primary whitespace-nowrap">
              {formatPrice(product.price, product.currency || 'NGN')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {details.sessionLength && (
              <span className="flex items-center gap-1 bg-muted rounded-full px-2 py-1">
                <Clock className="h-3 w-3" /> {details.sessionLength} min
              </span>
            )}
            <span className={`flex items-center gap-1 rounded-full px-2 py-1 ${isPhysical ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-500'}`}>
              {isPhysical ? <MapPin className="h-3 w-3" /> : <Video className="h-3 w-3" />}
              {LOCATION_LABELS[locationType]}
            </span>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {['Pick a date', 'Pick a time', 'Your details'].map((label, i) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-1.5 text-xs font-medium ${step === i ? 'text-primary' : step > i ? 'text-green-500' : 'text-muted-foreground'}`}>
              <div className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold border ${step === i ? 'border-primary bg-primary text-primary-foreground' : step > i ? 'border-green-500 bg-green-500 text-white' : 'border-muted-foreground/30'}`}>
                {step > i ? '✓' : i + 1}
              </div>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {i < 2 && <div className={`flex-1 h-px ${step > i ? 'bg-green-500/40' : 'bg-border'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* ── Step 0: Pick a date ── */}
      {step === 0 && (
        <div className="space-y-4">
          <MiniCalendar selectedDate={selectedDate} onSelect={setSelectedDate} minDate={today} />
          <Button
            className="w-full"
            disabled={!selectedDate}
            onClick={() => setStep(1)}
          >
            Continue to time selection →
          </Button>
        </div>
      )}

      {/* ── Step 1: Pick a time slot ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Available slots for {new Date(selectedDate! + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <button onClick={() => setStep(0)} className="text-xs text-muted-foreground underline">Change date</button>
          </div>

          {slotsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No available slots on this day. Please pick a different date.
              <div className="mt-3">
                <button onClick={() => setStep(0)} className="text-primary underline text-xs">← Change date</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {slots.map(slot => {
                const isSelected = selectedSlot?.start === slot.start;
                return (
                  <button
                    key={slot.start}
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors text-center ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border text-foreground hover:border-primary/40 hover:bg-muted/40'
                    }`}
                  >
                    {slot.start} – {slot.end}
                  </button>
                );
              })}
            </div>
          )}

          {selectedSlot && (
            <Button className="w-full" onClick={() => setStep(2)}>
              Continue with {selectedSlot.start} – {selectedSlot.end} →
            </Button>
          )}
        </div>
      )}

      {/* ── Step 2: Customer details + intake form ── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Your details</p>
            <button onClick={() => setStep(1)} className="text-xs text-muted-foreground underline">Change time</button>
          </div>

          {/* Summary pill */}
          <div className="rounded-xl bg-muted/40 border border-border p-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />
              {new Date(selectedDate! + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{selectedSlot?.start} – {selectedSlot?.end}</span>
            <span className={`flex items-center gap-1 ${isPhysical ? 'text-emerald-600' : 'text-blue-500'}`}>
              {isPhysical ? <MapPin className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
              {LOCATION_LABELS[locationType]}
            </span>
          </div>

          <div className="space-y-4">
            {/* Core customer fields */}
            <div>
              <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Full name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="booking-customer-name"
                placeholder="Ada Okafor"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="booking-customer-email"
                type="email"
                placeholder="you@example.com"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Phone (optional)
              </Label>
              <Input
                id="booking-customer-phone"
                type="tel"
                placeholder="+234 800 000 0000"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
            </div>

            {/* Dynamic intake form fields */}
            {intakeFields.length > 0 && (
              <div className="pt-2 border-t border-border space-y-4">
                <p className="text-sm font-medium text-foreground">A few more questions</p>
                {intakeFields.map(field => (
                  <div key={field.id}>
                    <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <IntakeField
                      field={field}
                      value={intakeAnswers[field.id] ?? (field.type === 'checkbox' ? [] : '')}
                      onChange={v => setIntakeAnswers(prev => ({ ...prev, [field.id]: v }))}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            className="w-full"
            disabled={submitting || !customerName.trim() || !customerEmail.trim()}
            onClick={handleConfirm}
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Confirming booking…</>
            ) : (
              `Confirm booking — ${formatPrice(product.price, product.currency || 'NGN')}`
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By confirming, you agree to the session terms. The creator will send location details before the session.
          </p>
        </div>
      )}
    </div>
  );
}
