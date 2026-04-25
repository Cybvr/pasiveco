'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCommunityBySlug } from '@/services/communityService';
import { Community } from '@/types/community';
import { Loader2, Users, Lock, Globe, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getDicebearAvatar } from '@/lib/avatar';
import Link from 'next/link';

export default function InvitePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    getCommunityBySlug(slug)
      .then((data) => {
        if (!data) setNotFound(true);
        else setCommunity(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAcceptInvite = () => {
    if (!community) return;
    // Redirect to the community page; auth will be required there to actually join
    router.push(`/dashboard/communities/${community.slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (notFound || !community) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 text-center px-6">
        <div className="p-4 rounded-2xl bg-muted">
          <ShieldCheck className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-black tracking-tight">Invite not found</h1>
        <p className="text-muted-foreground max-w-sm text-sm">
          This invite link may have expired or the space no longer exists.
        </p>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    );
  }

  const avatarSrc = community.image || getDicebearAvatar(community.id || community.name);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Nav */}
      <header className="border-b bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo.svg" alt="Pasive" className="h-5 w-5" />
            <span className="font-black text-lg tracking-tight">PASIVE</span>
          </Link>
          <Button asChild size="sm" variant="ghost" className="text-xs font-bold">
            <Link href="/auth/login">Sign in</Link>
          </Button>
        </div>
      </header>

      {/* Hero Banner */}
      <div
        className="w-full h-52 md:h-72 bg-gradient-to-br from-primary/20 via-primary/5 to-background relative overflow-hidden"
        style={community.bannerImage ? {
          backgroundImage: `url(${community.bannerImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      </div>

      {/* Main Card */}
      <main className="max-w-xl mx-auto w-full px-4 -mt-20 pb-16 relative z-10">
        <div className="bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden">
          {/* Space Identity */}
          <div className="p-6 pb-4 flex flex-col items-center text-center gap-4">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg ring-2 ring-primary/10">
              <AvatarImage src={avatarSrc} alt={community.name} className="object-cover" />
              <AvatarFallback className="text-2xl font-black bg-primary/10 text-primary">
                {community.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight leading-tight">{community.name}</h1>
              {community.description && (
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                  {community.description}
                </p>
              )}
            </div>

            {/* Meta Badges */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-xs font-semibold rounded-full">
                <Users className="h-3 w-3" />
                {community.memberCount.toLocaleString()} members
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs font-semibold rounded-full capitalize">
                {community.privacy === 'private'
                  ? <Lock className="h-3 w-3" />
                  : <Globe className="h-3 w-3" />
                }
                {community.privacy}
              </Badge>
              {community.category && (
                <Badge className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border-0">
                  {community.category}
                </Badge>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-dashed border-border/60" />

          {/* CTA */}
          <div className="p-6 space-y-3">
            {community.isPaid && community.price ? (
              <div className="text-center p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-600 text-sm font-semibold">
                Paid Space — ₦{community.price.toLocaleString()}/mo
              </div>
            ) : (
              <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10 text-primary text-sm font-semibold">
                Free to Join
              </div>
            )}

            <Button
              className="w-full h-12 rounded-xl font-bold text-base gap-2 shadow-sm"
              onClick={handleAcceptInvite}
            >
              Accept Invite
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              You&apos;ll be asked to sign in or create an account to join.
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Pasive Spaces &mdash; where your community lives
        </p>
      </main>
    </div>
  );
}
