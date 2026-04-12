"use client";

import React, { useState, useEffect } from 'react';
import { getUserByUsername } from '@/services/userService';
import { getSocialProfileByUsername } from '@/lib/social-data';
import { useParams } from 'next/navigation';

export default function LinksPage() {
  const { slug } = useParams<{ slug: string }>();
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [firebaseProfile, socialProfile] = await Promise.all([
          getUserByUsername(slug),
          getSocialProfileByUsername(slug),
        ]);
        const profile = firebaseProfile || socialProfile;
        setLinks((profile?.links || []).filter((l: any) => l.active));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {links.length > 0 ? links.map((link: any) => (
        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center gap-3 border border-border rounded-lg p-4 text-base hover:bg-muted/50 hover:border-muted-foreground transition-colors">
          <img src={link.thumbnail} alt={link.title} className="w-5 h-5 object-contain"
            onError={e => { e.currentTarget.src = '/images/pages/website.svg' }} />
          <span className="font-medium text-foreground">{link.title}</span>
        </a>
      )) : (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No links yet.</div>
      )}
    </div>
  );
}
