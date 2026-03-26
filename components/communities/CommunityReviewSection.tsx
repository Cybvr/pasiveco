import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StarRating from '../products/StarRating';
import { Review, addReview, getReviews, canUserReview } from '@/services/reviewsService';
import { formatDistanceToNow } from 'date-fns';

interface CommunityReviewSectionProps {
  communityId: string;
  user: any;
}

export default function CommunityReviewSection({ communityId, user }: CommunityReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [canReviewState, setCanReviewState] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getReviews(communityId, 'community');
        setReviews(data);
        
        if (user) {
          const eligible = await canUserReview(user.uid, communityId, 'community');
          setCanReviewState(eligible);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [communityId, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      const reviewData: Omit<Review, 'id' | 'createdAt'> = {
        targetId: communityId,
        targetType: 'community',
        userId: user.uid,
        userName: user.displayName || user.email.split('@')[0],
        userImage: user.photoURL,
        rating,
        comment: comment.trim()
      };
      
      await addReview(reviewData);
      toast.success('Review submitted successfully!');
      
      // Refresh reviews
      const data = await getReviews(communityId, 'community');
      setReviews(data);
      setCanReviewState(false);
      setComment('');
      setRating(0);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>;

  return (
    <div className="space-y-8 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Community Reviews ({reviews.length})</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating 
              rating={reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length} 
              count={reviews.length} 
              className="scale-110"
            />
          </div>
        )}
      </div>

      {!user ? (
        <div className="bg-muted/10 p-6 rounded-2xl border border-dashed border-border/60 text-center">
          <p className="text-sm text-muted-foreground">Please <Link href="/auth/login" className="text-primary font-bold hover:underline">log in</Link> to leave a review.</p>
        </div>
      ) : canReviewState ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-muted/20 p-6 rounded-2xl border border-border/50 transition-all hover:bg-muted/30 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Your Rating</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHoveredRating(s)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(s)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star 
                    className={`w-8 h-8 ${
                      s <= (hoveredRating || rating) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-muted-foreground/30'
                    } transition-colors`} 
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Your Comment</p>
            <Textarea
              placeholder="What do you think of this community?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] rounded-xl border-border/60 bg-background/50 focus:bg-background"
            />
          </div>
          <Button type="submit" disabled={submitting} className="w-full sm:w-auto px-8 h-11 rounded-xl shadow-lg shadow-primary/20">
            {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
            Submit Review
          </Button>
        </form>
      ) : !loading && (
        <div className="bg-muted/10 p-6 rounded-2xl border border-dashed border-border/60 text-center">
          <p className="text-sm text-muted-foreground">You have already reviewed this community. Thank you for your feedback!</p>
        </div>
      )}

      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="group space-y-3 pb-6 border-b border-border/40 last:border-0 last:pb-0">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10 border border-border/60">
                    <AvatarImage src={review.userImage} />
                    <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold">{review.userName}</p>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-tighter">
                        {formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed font-medium pl-[52px]">
                {review.comment}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border/60">
            <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">No reviews yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
