"use client"
import React, { useState, useEffect } from 'react';
import { getCommunityPosts, Post } from '@/services/postService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Heart, Share2, MoreHorizontal, Loader2, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createPost } from '@/services/postService';
import { toast } from 'sonner';

interface CommunityFeedProps {
  communityId: string;
}

export default function CommunityFeed({ communityId }: CommunityFeedProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPostMessage, setNewPostMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

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

  const handleCreatePost = async (parentId?: string) => {
    if (!user) {
      toast.error('You must be logged in to post');
      return;
    }
    const message = parentId ? replyMessage : newPostMessage;
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      await createPost({
        communityId,
        authorId: user.uid,
        message: message.trim(),
        category: 'general',
        authorName: user.displayName || '',
        authorImage: user.photoURL || '',
        parentId
      });
      
      if (parentId) {
        setReplyMessage('');
        setReplyingTo(null);
      } else {
        setNewPostMessage('');
      }
      toast.success('Posted successfully');
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error(error);
      toast.error('Failed to post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rootPosts = posts.filter(p => !p.parentId);

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
      {user && (
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm mb-6">
          <Textarea 
            placeholder="Share your thoughts..." 
            className="w-full resize-none border-0 focus-visible:ring-0 shadow-none bg-transparent"
            rows={3}
            value={newPostMessage}
            onChange={(e) => setNewPostMessage(e.target.value)}
          />
          <div className="flex justify-end mt-2 pt-2 border-t border-border/50">
            <Button 
              size="sm" 
              onClick={() => handleCreatePost()} 
              disabled={isSubmitting || !newPostMessage.trim()}
            >
              {isSubmitting && !replyingTo ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Post
            </Button>
          </div>
        </div>
      )}

      {rootPosts.map((post) => {
        const postReplies = posts.filter(p => p.parentId === post.id).sort((a,b) => a.createdAt.toMillis() - b.createdAt.toMillis());
        return (
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
                <button 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group/btn"
                  onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                >
                  <div className="p-1.5 rounded-full group-hover/btn:bg-primary/10 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold tabular-nums">{postReplies.length}</span>
                </button>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-500 transition-colors group/btn">
                  <div className="p-1.5 rounded-full group-hover/btn:bg-blue-500/10 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </div>
                </button>
              </div>

              {/* Replies Section */}
              {postReplies.length > 0 && (
                <div className="mt-4 space-y-4 border-l-2 border-border/50 pl-4">
                  {postReplies.map(reply => (
                    <div key={reply.id} className="flex flex-col gap-2">
                       <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={reply.authorImage} />
                            <AvatarFallback>{reply.authorName?.[0] || 'U'}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-bold">{reply.authorName}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true })}
                          </span>
                       </div>
                       <p className="text-sm text-foreground/80">{reply.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {replyingTo === post.id && (
                <div className="mt-4 flex gap-3 items-start animate-in slide-in-from-top-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={user?.photoURL || ''} />
                    <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea 
                      placeholder="Write a reply..."
                      className="min-h-[60px] resize-none text-sm"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancel</Button>
                      <Button size="sm" onClick={() => handleCreatePost(post.id)} disabled={isSubmitting || !replyMessage.trim()}>Reply</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      )})}
    </div>
  );
}
