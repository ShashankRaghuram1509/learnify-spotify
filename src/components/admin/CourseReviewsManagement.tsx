import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, MessageSquare, Search, TrendingUp, MessageCircle } from "lucide-react";

export default function CourseReviewsManagement() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, avgRating: 0 });
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [improvementSuggestions, setImprovementSuggestions] = useState("");
  const [adminRating, setAdminRating] = useState(0);

  useEffect(() => {
    fetchReviews();

    const channel = supabase
      .channel('admin-reviews-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, fetchReviews)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = reviews.filter(review => 
        review.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReviews(filtered);
    } else {
      setFilteredReviews(reviews);
    }
  }, [searchTerm, reviews]);

  const fetchReviews = async () => {
    try {
      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      if (reviewsData && reviewsData.length > 0) {
        // Fetch related courses
        const courseIds = [...new Set(reviewsData.map(r => r.course_id))];
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title')
          .in('id', courseIds);

        // Fetch related profiles
        const userIds = [...new Set(reviewsData.map(r => r.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);

        // Enrich reviews with course and profile data
        const enrichedReviews = reviewsData.map(review => ({
          ...review,
          courses: coursesData?.find(c => c.id === review.course_id),
          profiles: profilesData?.find(p => p.id === review.user_id)
        }));

        setReviews(enrichedReviews);
        setFilteredReviews(enrichedReviews);

        // Calculate stats
        const total = enrichedReviews.length;
        const avgRating = total > 0 
          ? enrichedReviews.reduce((sum, r) => sum + r.rating, 0) / total 
          : 0;
        
        setStats({ total, avgRating });
      } else {
        setReviews([]);
        setFilteredReviews([]);
        setStats({ total: 0, avgRating: 0 });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    }
  };

  const handleProvideFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReview || !feedbackText) {
      toast.error("Please provide feedback");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('admin_course_feedback')
        .insert({
          course_id: selectedReview.course_id,
          admin_id: user?.id,
          review_id: selectedReview.id,
          feedback_text: feedbackText,
          improvement_suggestions: improvementSuggestions || null,
          rating: adminRating > 0 ? adminRating : null
        });

      if (error) throw error;

      toast.success("Feedback sent to course instructor");
      setShowFeedbackDialog(false);
      setSelectedReview(null);
      setFeedbackText("");
      setImprovementSuggestions("");
      setAdminRating(0);
    } catch (error) {
      console.error('Error providing feedback:', error);
      toast.error('Failed to send feedback');
    }
  };

  const openFeedbackDialog = (review: any) => {
    setSelectedReview(review);
    setShowFeedbackDialog(true);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <div className="flex gap-0.5 mt-1">
              {renderStars(Math.round(stats.avgRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">With Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter(r => r.comment).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Reviews & Feedback</CardTitle>
          <CardDescription>View all student feedback and ratings</CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by course, student, or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    {searchTerm ? 'No reviews found matching your search' : 'No reviews yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{review.profiles?.full_name || 'Unknown'}</div>
                        <div className="text-xs text-muted-foreground">{review.profiles?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{review.courses?.title || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <Badge variant="outline">{review.rating}/5</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      {review.comment ? (
                        <p className="text-sm line-clamp-2">{review.comment}</p>
                      ) : (
                        <span className="text-muted-foreground text-sm">No comment</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openFeedbackDialog(review)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Feedback
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Provide Feedback to Instructor</DialogTitle>
            <DialogDescription>
              Send feedback about this review to the course instructor
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="p-3 border rounded-lg bg-muted/50">
                <div className="text-sm font-medium mb-2">Review Details:</div>
                <div className="text-sm text-muted-foreground">
                  <div>Course: {selectedReview.courses?.title}</div>
                  <div>Student Rating: {renderStars(selectedReview.rating)}</div>
                  {selectedReview.comment && (
                    <div className="mt-2">Comment: "{selectedReview.comment}"</div>
                  )}
                </div>
              </div>

              <form onSubmit={handleProvideFeedback} className="space-y-4">
                <div className="space-y-2">
                  <Label>Your Assessment (Optional)</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setAdminRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            star <= adminRating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback to Instructor *</Label>
                  <Textarea
                    id="feedback"
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Provide feedback about this student review and course quality..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="improvements">Improvement Suggestions (Optional)</Label>
                  <Textarea
                    id="improvements"
                    value={improvementSuggestions}
                    onChange={(e) => setImprovementSuggestions(e.target.value)}
                    placeholder="Suggest specific improvements for the course..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit">Send Feedback</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowFeedbackDialog(false);
                      setSelectedReview(null);
                      setFeedbackText("");
                      setImprovementSuggestions("");
                      setAdminRating(0);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
