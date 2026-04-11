"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Clock, MapPin, Video, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getUserByUsername } from '@/services/userService';
import { getUserProducts, Product } from '@/services/productsService';
import { useCurrency } from '@/context/CurrencyContext';
import { formatCurrency, EXCHANGE_RATE } from '@/utils/currency';

const LOCATION_LABELS: Record<string, string> = {
  zoom: 'Zoom',
  google_meet: 'Google Meet',
  skype: 'Skype',
  physical: 'In-Person',
  other: 'Online',
};

export default function BookingsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { currency: userCurrency } = useCurrency();
  const [bookings, setBookings] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const profile = await getUserByUsername(slug ?? '');
        const uid = profile?.userId || profile?.id;
        if (uid) {
          const all = await getUserProducts(uid);
          setBookings(
            all.filter((p) => p.category === 'booking' && p.status === 'active')
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [slug]);

  const formatPrice = (price: number, productCurrency: string) => {
    if (price === 0) return 'Free';
    let displayPrice = price;
    let displayCurrency = productCurrency as any;
    if (productCurrency === 'NGN' && userCurrency === 'USD') {
      displayPrice = price / EXCHANGE_RATE;
      displayCurrency = 'USD';
    } else if (productCurrency === 'USD' && userCurrency === 'NGN') {
      displayPrice = price * EXCHANGE_RATE;
      displayCurrency = 'NGN';
    }
    return formatCurrency(displayPrice, displayCurrency);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-foreground">Book a Session</h2>

      {/* Session grid */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
          Available Sessions
        </h3>
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No booking sessions available right now. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.map((product) => {
              const details = product.details || {};
              const locationType = details.locationType || 'other';
              const sessionLen = details.sessionLength;
              const hasIntake = (details.intakeForm?.length ?? 0) > 0;
              const isPhysical = locationType === 'physical';

              return (
                <Link
                  key={product.id}
                  href={`/${slug}/bookings/${product.slug || product.id}`}
                  className="group block rounded-2xl border border-border hover:border-primary/40 hover:shadow-lg bg-card/30 backdrop-blur-sm transition-all duration-300 overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="w-full h-40 overflow-hidden bg-muted relative">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-10 h-10 text-muted-foreground/40" />
                      </div>
                    )}
                    {/* Location badge */}
                    <div className="absolute top-2 left-2">
                      <Badge
                        className={`text-[10px] font-bold uppercase gap-1 border-none shadow-md ${
                          isPhysical
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        {isPhysical ? (
                          <MapPin className="h-2.5 w-2.5" />
                        ) : (
                          <Video className="h-2.5 w-2.5" />
                        )}
                        {LOCATION_LABELS[locationType] || locationType}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">
                      {product.name}
                    </h4>
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {product.description.replace(/<[^>]+>/g, '')}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {sessionLen && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {sessionLen} min
                        </span>
                      )}
                      {hasIntake && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Intake form
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-sm text-foreground">
                        {formatPrice(product.price, product.currency || 'NGN')}
                      </span>
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wide group-hover:underline">
                        Book now →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
