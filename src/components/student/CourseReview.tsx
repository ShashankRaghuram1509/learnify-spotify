import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Star, MessageSquare, Edit2, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CourseReviewProps {
  courseId: string;
  courseName: string;
}

export default function CourseReview({ courseId, courseName }: CourseReviewProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [existingReview, setExistingReview] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchExistingReview();
    }
  }, [user, courseId]);

  const fetchExistingReview = async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', user?.id)
      .maybeSingle();

    if (data) {
      setExistingReview(data);
      setRating(data.rating);
      setComment(data.comment || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (existingReview) {
      // Update existing review
      const { error } = await supabase
        .from('reviews')
        .update({
          rating,
          comment,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingReview.id);

      if (error) {
        toast.error("Failed to update review");
      } else {
        toast.success("Review updated successfully");
        setIsEditing(false);
        fetchExistingReview();
      }
    } else {
      // Create new review
      const { error } = await supabase
        .from('reviews')
        .insert({
          course_id: courseId,
          user_id: user?.id,
          rating,
          comment
        });

      if (error) {
        toast.error("Failed to submit review");
      } else {
        toast.success("Review submitted successfully");
        setShowDialog(false);
        fetchExistingReview();
      }
    }
  };

  const StarRating = ({ interactive = true }: { interactive?: boolean }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive || (existingReview && !isEditing)}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className="focus:outline-none disabled:cursor-default"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (existingReview && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Your Review
                <Badge variant="secondary">Submitted</Badge>
              </CardTitle>
              <CardDescription>Your feedback for {courseName}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Rating</Label>
            <StarRating interactive={false} />
          </div>
          
          {existingReview.comment && (
            <div>
              <Label>Your Feedback</Label>
              <p className="text-sm text-muted-foreground mt-2 p-3 border rounded-lg bg-muted/50">
                {existingReview.comment}
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(existingReview.updated_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Your Review</CardTitle>
          <CardDescription>Update your feedback for {courseName}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating *</Label>
              <StarRating />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Feedback (Optional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this course..."
                rows={6}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Check className="h-4 w-4 mr-1" />
                Update Review
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setRating(existingReview.rating);
                  setComment(existingReview.comment || "");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Course Review
          </CardTitle>
          <CardDescription>Share your feedback about {courseName}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setShowDialog(true)}>
            Write a Review
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Write Your Review</DialogTitle>
            <DialogDescription>Share your experience with {courseName}</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Rating *</Label>
              <StarRating />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment-dialog">Your Feedback (Optional)</Label>
              <Textarea
                id="comment-dialog"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this course..."
                rows={6}
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Review
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
