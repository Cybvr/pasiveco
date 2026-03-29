"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCommunityPosts, Post } from '@/services/postService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Heart, Share2, MoreHorizontal, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createPost } from '@/services/postService';
import { getUser } from '@/services/userService';
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

  const getAuthorHref = (post: Pick<Post, 'authorUsername' | 'authorSlug'>) => {
    const handle = (post.authorUsername || post.authorSlug || '').replace(/^@/, '').trim();
    return handle ? `/${handle}` : null;
  };

  const handleCopyPostLink = async (postId: string) => {
    try {
      const postUrl = `${window.location.origin}${window.location.pathname}#post-${postId}`;
      await navigator.clipboard.writeText(postUrl);
      toast.success('Link copied');
    } catch (error) {
      console.error('Error copying post link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleCreatePost = async (parentId?: string) => {
    if (!user) {
      toast.error('You must be logged in to post');
      return;
    }
    const message = parentId ? replyMessage : newPostMessage;
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      const profile = await getUser(user.uid).catch(() => null);

      await createPost({
        communityId,
        authorId: user.uid,
        message: message.trim(),
        category: 'general',
        authorName: profile?.displayName || user.displayName || '',
        authorUsername: profile?.username || '',
        authorSlug: profile?.slug || profile?.username || '',
        authorImage: profile?.profilePicture || profile?.photoURL || user.photoURL || '',
        parentId
      });
      if (parentId) {
        setReplyMessage('');
        setReplyingTo(null);
      } else {
        setNewPostMessage('');
      }
      toast.success('Posted successfully');
      fetchPosts();
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
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-24 text-center border-2 border-dashed rounded-xl bg-muted/5 border-border/40">
        <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-bold tracking-tight">The floor is yours</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
          Be the first to share your thoughts, resources, or just say hello to your new community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {user && (
        <div className="bg-card border border-border/50 rounded-xl p-4 mb-6">
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
        const postReplies = posts
          .filter((p) => p.parentId === post.id)
          .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
        const authorHref = getAuthorHref(post);

        return (
          <article
            key={post.id}
            id={`post-${post.id}`}
            className="bg-card border border-border/50 rounded-xl p-5 md:p-6"
          >
            <div className="flex items-start gap-4">
              {authorHref ? (
                <Link href={authorHref} className="shrink-0">
                  <Avatar className="h-10 w-10 border border-border/60 transition-opacity hover:opacity-80">
                    <AvatarImage src={post.authorImage} />
                    <AvatarFallback className="bg-muted font-semibold text-primary">
                      {post.authorName?.[0] || post.authorUsername?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Avatar className="h-10 w-10 border border-border/60">
                  <AvatarImage src={post.authorImage} />
                  <AvatarFallback className="bg-muted font-semibold text-primary">
                    {post.authorName?.[0] || post.authorUsername?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="flex-1 space-y-3 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {authorHref ? (
                      <>
                        <Link href={authorHref} className="text-sm font-bold tracking-tight transition-colors hover:text-primary">
                          {post.authorName || `@${post.authorUsername}`}
                        </Link>
                        {post.authorUsername && (
                          <Link href={authorHref} className="text-xs text-muted-foreground transition-colors hover:text-primary">
                            @{post.authorUsername.replace(/^@/, '')}
                          </Link>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-bold tracking-tight">
                          {post.authorName || `@${post.authorUsername}`}
                        </span>
                        {post.authorUsername && (
                          <span className="text-xs text-muted-foreground">@{post.authorUsername.replace(/^@/, '')}</span>
                        )}
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true })}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className=" text-muted-foreground hover:bg-muted rounded-full">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => void handleCopyPostLink(post.id)}>
                        Copy Link
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="text-sm md:text-base text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
                  {post.message}
                </div>

                <div className="flex items-center gap-6 pt-1">
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-pink-500">
                    <Heart className="w-4 h-4" />
                    <span className="text-xs font-semibold tabular-nums">0</span>
                  </button>
                  <button
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary"
                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-semibold tabular-nums">{postReplies.length}</span>
                  </button>
                  <button className="flex items-center gap-2 text-muted-foreground hover:text-blue-500">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {postReplies.length > 0 && (
                  <div className="mt-4 space-y-4 border-l-2 border-border/50 pl-4">
                    {postReplies.map((reply) => {
                      const replyAuthorHref = getAuthorHref(reply);

                      return (
                        <div key={reply.id} className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {replyAuthorHref ? (
                              <>
                                <Link href={replyAuthorHref}>
                                  <Avatar className="h-6 w-6 transition-opacity hover:opacity-80">
                                    <AvatarImage src={reply.authorImage} />
                                    <AvatarFallback>{reply.authorName?.[0] || reply.authorUsername?.[0] || 'U'}</AvatarFallback>
                                  </Avatar>
                                </Link>
                                <Link href={replyAuthorHref} className="text-xs font-bold transition-colors hover:text-primary">
                                  {reply.authorName || `@${reply.authorUsername}`}
                                </Link>
                              </>
                            ) : (
                              <>
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={reply.authorImage} />
                                  <AvatarFallback>{reply.authorName?.[0] || reply.authorUsername?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-bold">{reply.authorName || `@${reply.authorUsername}`}</span>
                              </>
                            )}
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80">{reply.message}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {replyingTo === post.id && (
                  <div className="mt-4 flex gap-3 items-start">
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
                        <Button
                          size="sm"
                          onClick={() => handleCreatePost(post.id)}
                          disabled={isSubmitting || !replyMessage.trim()}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
