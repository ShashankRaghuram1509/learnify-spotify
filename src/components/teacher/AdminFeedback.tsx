import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Star, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function AdminFeedback() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFeedback();

      const channel = supabase
        .channel('teacher-feedback-changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'admin_course_feedback' 
        }, fetchFeedback)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);

      // Fetch feedback for teacher's courses
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('admin_course_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (feedbackError) throw feedbackError;

      if (feedbackData && feedbackData.length > 0) {
        // Fetch courses
        const courseIds = [...new Set(feedbackData.map(f => f.course_id))];
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title')
          .in('id', courseIds)
          .eq('teacher_id', user?.id);

        // Filter feedback to only include teacher's courses
        const teacherCourseIds = coursesData?.map(c => c.id) || [];
        const filteredFeedback = feedbackData.filter(f => 
          teacherCourseIds.includes(f.course_id)
        );

        // Enrich with course data
        const enrichedFeedback = filteredFeedback.map(fb => ({
          ...fb,
          course: coursesData?.find(c => c.id === fb.course_id)
        }));

        setFeedback(enrichedFeedback);
      } else {
        setFeedback([]);
      }
    } catch (error) {
      console.error('Error fetching admin feedback:', error);
      toast.error('Failed to load admin feedback');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
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

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading feedback...</div>
        </CardContent>
      </Card>
    );
  }

  if (feedback.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Feedback</CardTitle>
          <CardDescription>Review feedback from administrators</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No admin feedback yet. Keep up the good work!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Feedback on Your Courses</CardTitle>
          <CardDescription>
            Review feedback and improvement suggestions from administrators
          </CardDescription>
        </CardHeader>
      </Card>

      {feedback.map((fb) => (
        <Card key={fb.id} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg">{fb.course?.title || 'Course'}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(fb.created_at).toLocaleDateString()}
                </div>
              </div>
              {fb.rating && (
                <div>
                  <div className="flex items-center gap-2">
                    {renderStars(fb.rating)}
                    <Badge variant="outline">{fb.rating}/5</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Admin Assessment</div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">Feedback:</div>
              <p className="text-sm text-muted-foreground p-3 border rounded-lg bg-muted/50">
                {fb.feedback_text}
              </p>
            </div>

            {fb.improvement_suggestions && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-1">Improvement Suggestions:</div>
                  <div className="text-sm">{fb.improvement_suggestions}</div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
