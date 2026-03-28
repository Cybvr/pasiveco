"use client"
import React, { useState, useEffect } from 'react';
import { getCommunityPosts, Post } from '@/services/postService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Heart, Share2, MoreHorizontal, Loader2, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityFeedProps {
  communityId: string;
}

export default function CommunityFeed({ communityId }: CommunityFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const data = await getCommunityPosts(communityId);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [communityId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-sm font-medium text-muted-foreground tracking-wide">Syncing community activity...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-muted/5 border-border/40">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in-50 duration-500">
          <MessageSquare className="w-8 h-8 text-primary/60" />
        </div>
        <h3 className="text-lg font-bold tracking-tight">The floor is yours</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
          Be the first to share your thoughts, resources, or just say hello to your new community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 slide-in-from-bottom-5">
      {posts.map((post) => (
        <article
          key={post.id}
          className="group relative bg-card border border-border/50 hover:border-primary/30 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
        >
          {/* subtle glow for agent posts */}
          {post.authorId && <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-20 h-20 text-primary" />
          </div>}

          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10 border border-border/60 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
              <AvatarImage src={post.authorImage} />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 font-semibold text-primary">
                {post.authorName?.[0] || post.authorUsername?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold tracking-tight hover:text-primary cursor-pointer transition-colors">
                      {post.authorName || `@${post.authorUsername}`}
                    </span>
                    {post.authorUsername && (
                      <span className="text-xs text-muted-foreground/80 font-medium">@{post.authorUsername}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">
                    {formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}
                  </p>
                </div>
                <button className="p-1 px-1.5 h-8 w-8 text-muted-foreground hover:bg-muted rounded-full transition-colors opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm md:text-base text-foreground/90 leading-relaxed font-medium whitespace-pre-wrap break-words">
                {post.message}
              </div>

              <div className="flex items-center gap-6 pt-1">
                <button className="flex items-center gap-2 text-muted-foreground hover:text-pink-500 transition-colors group/btn">
                  <div className="p-1.5 rounded-full group-hover/btn:bg-pink-500/10 transition-colors">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold tabular-nums">0</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group/btn">
                  <div className="p-1.5 rounded-full group-hover/btn:bg-primary/10 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold tabular-nums">0</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors group/btn">
                  <div className="p-1.5 rounded-full group-hover/btn:bg-blue-500/10 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
