"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSocialProfileByUsername, getSocialPosts } from '@/lib/social-data';

export default function PostsPage() {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [socialProfile, allPosts] = await Promise.all([
          getSocialProfileByUsername(slug),
          getSocialPosts(),
        ]);
        if (socialProfile) {
          setPosts(allPosts.filter((p: any) => p.authorId === socialProfile.id));
        }
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
      {posts.length > 0 ? posts.map((post: any) => (
        <Link key={post.id} href={`/dashboard/posts/${post.id}`}
          className="block rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
          <p className="text-sm font-medium text-foreground line-clamp-3">{post.message}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(post.createdAt))} · {post.likeCount} likes · {post.commentCount} comments
          </p>
        </Link>
      )) : (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No posts yet.</div>
      )}
    </div>
  );
}
