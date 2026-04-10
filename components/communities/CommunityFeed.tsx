"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { deletePost, getCommunityPosts, Post } from '@/services/postService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Heart, Share2, MoreHorizontal, Loader2, Smile, Image as ImageIcon, Trash2 } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import dynamic from 'next/dynamic';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

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
  const [gifSearch, setGifSearch] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(null);
  const [replyMediaUrl, setReplyMediaUrl] = useState<{[key: string]: string | null}>({});
  const [uploadLoading, setUploadLoading] = useState(false);
  const [replyUploadLoading, setReplyUploadLoading] = useState<{[key: string]: boolean}>({});

  const handleImageUpload = async (file: File, pId?: string) => {
    if (!file) return;
    
    if (pId) {
      setReplyUploadLoading(prev => ({ ...prev, [pId]: true }));
    } else {
      setUploadLoading(true);
    }

    try {
      const storageRef = ref(storage, `community_posts/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      if (pId) {
        setReplyMediaUrl(prev => ({ ...prev, [pId]: url }));
      } else {
        setSelectedMediaUrl(url);
      }
      toast.success('Image uploaded');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      if (pId) {
        setReplyUploadLoading(prev => ({ ...prev, [pId]: false }));
      } else {
        setUploadLoading(false);
      }
    }
  };

  // Fallback GIFs in case API fails
  const FALLBACK_GIFS = [
    { id: '1', images: { fixed_height: { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZndueXp6ZndueXp6ZndueXp6ZndueXp6ZndueXp6ZndueXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxVfV9v6NnO/giphy.gif' }, fixed_height_small: { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZndueXp6ZndueXp6ZndueXp6ZndueXp6ZndueXp6ZndueXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxVfV9v6NnO/giphy.gif' } } },
    { id: '2', images: { fixed_height: { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZndueXp6ZndueXp6ZndueXp6ZndueXp6ZndueXp6ZndueXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlU7eS0p/giphy.gif' }, fixed_height_small: { url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZndueXp6ZndueXp6ZndueXp6ZndueXp6ZndueXp6ZndueXp6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l0HlU7eS0p/giphy.gif' } } },
    { id: '3', images: { fixed_height: { url: 'https://media.giphy.com/media/3o7abKhOpu0NPG9o5O/giphy.gif' }, fixed_height_small: { url: 'https://media.giphy.com/media/3o7abKhOpu0NPG9o5O/giphy.gif' } } }
  ];

  const fetchGifs = async (query = '') => {
    setGifLoading(true);
    try {
      const key = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'dc6zaTOxFJmzC';
      const endpoint = query 
        ? `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(query)}&limit=12&rating=g`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${key}&limit=12&rating=g`;
      
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('API failed');
      const { data } = await res.json();
      setGifs(data && data.length > 0 ? data : FALLBACK_GIFS);
    } catch (err) {
      console.error('Giphy API failed, using fallbacks:', err);
      setGifs(FALLBACK_GIFS);
    } finally {
      setGifLoading(false);
    }
  };

  useEffect(() => {
    fetchGifs();
  }, []);

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
    const mediaUrl = parentId ? replyMediaUrl[parentId] : selectedMediaUrl;
    
    if (!message.trim() && !mediaUrl) return;
    setIsSubmitting(true);
    try {
      const profile = await getUser(user.uid).catch(() => null);

      const postPayload: any = {
        communityId,
        authorId: user.uid,
        message: message.trim(),
        category: 'general',
        authorName: profile?.displayName || user.displayName || '',
        authorUsername: profile?.username || '',
        authorSlug: profile?.slug || profile?.username || '',
        authorImage: profile?.profilePicture || profile?.photoURL || user.photoURL || '',
      };

      if (parentId) postPayload.parentId = parentId;
      if (mediaUrl) {
        postPayload.mediaUrl = mediaUrl;
        postPayload.mediaType = 'gif';
      }

      await createPost(postPayload);
      if (parentId) {
        setReplyMessage('');
        setReplyingTo(null);
        setReplyMediaUrl(prev => ({ ...prev, [parentId]: null }));
      } else {
        setNewPostMessage('');
        setSelectedMediaUrl(null);
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

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      toast.success('Post deleted');
      fetchPosts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete post');
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
          Be the first to share your thoughts, resources, or just say hello to your new space!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {user && (
        <div className="bg-card border border-border/40 rounded-md overflow-hidden mb-3">
          <div className="p-2">
            <Textarea
              placeholder="Start a discussion..."
              className="w-full min-h-[60px] resize-none border-0 focus-visible:ring-0 shadow-none bg-transparent text-sm p-0 placeholder:text-muted-foreground/50"
              value={newPostMessage}
              onChange={(e) => setNewPostMessage(e.target.value)}
            />
            
            {/* Media Attachment Preview */}
            {selectedMediaUrl && (
              <div className="relative mt-2 group max-w-[200px]">
                <div className="rounded-md overflow-hidden border border-border/30 bg-muted/20">
                  <img src={selectedMediaUrl} alt="selected" className="w-full h-auto object-contain max-h-[150px]" />
                </div>
                <button 
                  onClick={() => setSelectedMediaUrl(null)}
                  className="absolute -top-1.5 -right-1.5 bg-black/80 text-white rounded-full p-0.5"
                >
                  <MoreHorizontal className="w-3 h-3 rotate-45" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-2 py-1.5 border-t border-border/30 bg-muted/5">
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/5">
                    <Smile className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="p-0 border-none bg-transparent shadow-none">
                  <EmojiPicker 
                    onEmojiClick={(emojiData) => setNewPostMessage(prev => prev + emojiData.emoji)}
                    autoFocusSearch={false}
                    lazyLoadEmojis={true}
                    width={320}
                    height={400}
                    previewConfig={{ showPreview: false }}
                  />
                </PopoverContent>
              </Popover>

              <Popover onOpenChange={(open) => open && fetchGifs()}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/5">
                    <div className="text-[10px] font-bold border border-current rounded px-0.5 leading-none py-0.5">GIF</div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" align="start" className="w-[300px] p-0 overflow-hidden shadow-xl border-border/40">
                  <div className="p-2 border-b bg-card">
                    <input 
                      type="text" 
                      placeholder="Search Giphy..." 
                      className="w-full bg-muted border-0 text-xs px-2 py-1.5 rounded outline-none focus:ring-1 ring-primary/20" 
                      value={gifSearch}
                      onChange={(e) => {
                        setGifSearch(e.target.value);
                        fetchGifs(e.target.value);
                      }}
                    />
                  </div>
                  <div className="h-60 overflow-y-auto p-2 bg-muted/10">
                    {gifLoading ? (
                      <div className="h-full flex items-center justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-primary/40" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {gifs.map(gif => (
                          <button
                            key={gif.id}
                            onClick={() => {
                              setSelectedMediaUrl(gif.images.fixed_height.url);
                            }}
                            className="relative aspect-video rounded overflow-hidden hover:ring-2 ring-primary transition-all shadow-sm"
                          >
                            <img 
                              src={gif.images.fixed_height_small.url} 
                              alt={gif.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <input
                type="file"
                id="image-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/5"
                disabled={uploadLoading}
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                {uploadLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              </Button>
            </div>
            <Button
              size="sm"
              className="h-7 text-[10px] px-3 font-bold uppercase tracking-wider"
              onClick={() => handleCreatePost()}
              disabled={isSubmitting || (!newPostMessage.trim() && !selectedMediaUrl)}
            >
              {isSubmitting && !replyingTo ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : null}
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
            className="py-2.5 border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors px-1"
          >
            <div className="flex items-start gap-2.5">
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
                <Avatar className="h-7 w-7 border border-border/60">
                  <AvatarImage src={post.authorImage} />
                  <AvatarFallback className="bg-muted font-bold text-[9px] text-primary">
                    {post.authorName?.[0] || post.authorUsername?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {authorHref ? (
                      <>
                        <Link href={authorHref} className="text-[13px] font-bold tracking-tight hover:underline">
                          {post.authorName || `@${post.authorUsername}`}
                        </Link>
                        {post.authorUsername && (
                          <Link href={authorHref} className="text-[10px] text-muted-foreground">
                            @{post.authorUsername.replace(/^@/, '')}
                          </Link>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-[13px] font-bold tracking-tight">
                          {post.authorName || `@${post.authorUsername}`}
                        </span>
                        {post.authorUsername && (
                          <span className="text-[10px] text-muted-foreground">@{post.authorUsername.replace(/^@/, '')}</span>
                        )}
                      </>
                    )}
                    <span className="text-[10px] text-muted-foreground uppercase opacity-50">· {formatDistanceToNow(post.createdAt.toDate(), { addSuffix: false })}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-muted-foreground hover:bg-muted rounded-full p-0.5">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => void handleCopyPostLink(post.id)} className="text-xs">
                        Copy Link
                      </DropdownMenuItem>
                      {user?.uid === post.authorId && (
                        <DropdownMenuItem
                          onClick={() => void handleDeletePost(post.id)}
                          className="text-xs text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Delete Post
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="text-sm text-foreground/90 leading-normal whitespace-pre-wrap break-words">
                  {post.message}
                  {post.mediaUrl && (
                    <div className="my-1.5 rounded-md overflow-hidden border border-border/30 max-w-sm">
                      <img src={post.mediaUrl} alt="Shared media" className="w-full h-auto object-contain max-h-[300px]" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-1.5 pb-1">
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <Heart className="w-3 h-3" />
                    <span className="text-[10px] font-bold tabular-nums">0</span>
                  </button>
                  <button
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span className="text-[10px] font-bold tabular-nums">{postReplies.length}</span>
                  </button>
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <Share2 className="w-3 h-3" />
                  </button>
                </div>

                {postReplies.length > 0 && (
                  <div className="mt-2 space-y-2 border-l border-border/30 pl-3 ml-1">
                    {postReplies.map((reply) => {
                      const replyAuthorHref = getAuthorHref(reply);

                      return (
                        <div key={reply.id} className="flex flex-col gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {replyAuthorHref ? (
                                <Link href={replyAuthorHref}>
                                  <Avatar className="h-7 w-7 border border-border/50 transition-opacity hover:opacity-80">
                                    <AvatarImage src={reply.authorImage} />
                                    <AvatarFallback className="bg-muted font-semibold text-[9px] text-primary">{reply.authorName?.[0] || reply.authorUsername?.[0] || 'U'}</AvatarFallback>
                                  </Avatar>
                                </Link>
                              ) : (
                                <Avatar className="h-7 w-7 border border-border/50">
                                  <AvatarImage src={reply.authorImage} />
                                  <AvatarFallback className="bg-muted font-semibold text-[9px] text-primary">{reply.authorName?.[0] || reply.authorUsername?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                              )}
                              <div className="flex items-center gap-1">
                                <span className="text-[13px] font-bold tracking-tight">{reply.authorName}</span>
                                <span className="text-[10px] text-muted-foreground uppercase opacity-50">{formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: false })}</span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-muted-foreground hover:bg-muted rounded-full p-0.5">
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => void handleCopyPostLink(reply.id)} className="text-xs">
                                  Copy Link
                                </DropdownMenuItem>
                                {user?.uid === reply.authorId && (
                                  <DropdownMenuItem
                                    onClick={() => void handleDeletePost(reply.id)}
                                    className="text-xs text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Delete Reply
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="pl-[2.125rem]">
                            <div className="text-sm text-foreground/90 whitespace-pre-wrap break-words leading-normal">
                              {reply.message}
                            </div>
                            {reply.mediaUrl && (
                              <div className="mt-1.5 rounded-md overflow-hidden border border-border/30 max-w-sm">
                                <img src={reply.mediaUrl} alt="Reply media" className="w-full h-auto object-contain max-h-[300px]" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {replyingTo === post.id && (
                  <div className="mt-4 flex gap-3 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="border border-border/30 rounded-md overflow-hidden bg-card">
                        <Textarea
                          placeholder="Write a reply..."
                          className="min-h-[50px] w-full resize-none text-[13px] border-0 focus-visible:ring-0 shadow-none bg-transparent p-2"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          autoFocus
                        />
                        {/* Reply Media Attachment Preview */}
                        {replyMediaUrl[post.id] && (
                          <div className="relative mt-2 p-2 group max-w-[150px]">
                            <div className="rounded-md overflow-hidden border border-border/20 bg-muted/10">
                              <img src={replyMediaUrl[post.id]!} alt="reply preview" className="w-full h-auto object-contain max-h-[100px]" />
                            </div>
                            <button 
                              onClick={() => setReplyMediaUrl(prev => ({ ...prev, [post.id]: null }))}
                              className="absolute top-0.5 right-0.5 bg-black/80 text-white rounded-full p-0.5"
                            >
                              <MoreHorizontal className="w-2.5 h-2.5 rotate-45" />
                            </button>
                          </div>
                        )}
                        <div className="flex justify-between items-center bg-muted/30 p-1 border-t border-border/20">
                          <div className="flex items-center gap-0.5">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-primary">
                                  <Smile className="w-3.5 h-3.5" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent side="top" align="start" className="p-0 border-none bg-transparent shadow-none">
                                <EmojiPicker 
                                  onEmojiClick={(emojiData) => setReplyMessage(prev => prev + emojiData.emoji)}
                                  autoFocusSearch={false}
                                  lazyLoadEmojis={true}
                                  width={300}
                                  height={350}
                                  previewConfig={{ showPreview: false }}
                                />
                              </PopoverContent>
                            </Popover>

                            <Popover onOpenChange={(open) => open && fetchGifs()}>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-primary">
                                  <div className="text-[9px] font-bold border border-current rounded px-0.5 leading-none py-0.5">GIF</div>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent side="top" align="start" className="w-[280px] p-0 overflow-hidden shadow-xl border-border/40">
                                <div className="p-2 border-b bg-card">
                                  <input 
                                    type="text" 
                                    placeholder="Search GIFs..." 
                                    className="w-full bg-muted border-0 text-[11px] px-2 py-1 rounded outline-none" 
                                    onChange={(e) => fetchGifs(e.target.value)}
                                  />
                                </div>
                                <div className="h-48 overflow-y-auto p-1.5 bg-muted/10">
                                  {gifLoading ? (
                                    <div className="h-full flex items-center justify-center">
                                      <Loader2 className="w-3 h-3 animate-spin text-primary/40" />
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-1.5">
                                      {gifs.map(gif => (
                                        <button
                                          key={gif.id}
                                          onClick={() => {
                                            setReplyMediaUrl(prev => ({ ...prev, [post.id]: gif.images.fixed_height.url }));
                                          }}
                                          className="relative aspect-video rounded overflow-hidden hover:ring-2 ring-primary transition-all shadow-sm"
                                        >
                                          <img 
                                            src={gif.images.fixed_height_small.url} 
                                            alt="gif"
                                            className="w-full h-full object-cover"
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>

                            <input
                              type="file"
                              id={`reply-image-upload-${post.id}`}
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, post.id);
                              }}
                            />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                              disabled={replyUploadLoading[post.id]}
                              onClick={() => document.getElementById(`reply-image-upload-${post.id}`)?.click()}
                            >
                              {replyUploadLoading[post.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] font-medium" onClick={() => setReplyingTo(null)}>Cancel</Button>
                            <Button
                              size="sm"
                              className="h-6 px-3 text-[10px] font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={() => handleCreatePost(post.id)}
                              disabled={isSubmitting || (!replyMessage.trim() && !replyMediaUrl[post.id])}
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
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
