import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ScheduledCall {
  id: string;
  scheduled_at: string;
  student_name: string;
  course_title: string;
  duration_minutes: number;
}

export default function TeacherUpcomingCalls() {
  const { user } = useAuth();
  const [calls, setCalls] = useState<ScheduledCall[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchCalls();

    const channel = supabase
      .channel('teacher-schedule-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_call_schedules',
          filter: `teacher_id=eq.${user.id}`
        },
        () => {
          fetchCalls();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchCalls = async () => {
    if (!user) return;
    
    try {
      const now = new Date();
      const { data, error } = await supabase
        .from("video_call_schedules")
        .select(`
          id,
          scheduled_at,
          duration_minutes,
          student_id,
          course_id
        `)
        .eq("teacher_id", user.id)
        .eq("status", "scheduled")
        .gte("scheduled_at", now.toISOString())
        .order("scheduled_at", { ascending: true })
        .limit(5);

      if (error) throw error;

      if (data && data.length > 0) {
        // Fetch student names
        const studentIds = [...new Set(data.map(d => d.student_id))];
        const { data: students } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", studentIds);

        const studentMap = students?.reduce((acc: any, s: any) => {
          acc[s.id] = s.full_name || s.email;
          return acc;
        }, {}) || {};

        // Fetch course titles
        const courseIds = [...new Set(data.map(d => d.course_id).filter(Boolean))];
        const { data: courses } = await supabase
          .from("courses")
          .select("id, title")
          .in("id", courseIds);

        const courseMap = courses?.reduce((acc: any, c: any) => {
          acc[c.id] = c.title;
          return acc;
        }, {}) || {};

        const formattedCalls = data.map(call => ({
          id: call.id,
          scheduled_at: call.scheduled_at,
          student_name: studentMap[call.student_id] || "Student",
          course_title: courseMap[call.course_id] || "Course",
          duration_minutes: call.duration_minutes,
        }));

        setCalls(formattedCalls);
      } else {
        setCalls([]);
      }
    } catch (error) {
      console.error("Error fetching calls:", error);
      toast.error("Failed to load scheduled calls");
    } finally {
      setLoading(false);
    }
  };

  const isCallAvailable = (scheduledAt: string) => {
    const now = new Date();
    const scheduledTime = new Date(scheduledAt);
    const minutesUntil = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);
    return minutesUntil <= 5 && minutesUntil >= -15;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Calls
        </CardTitle>
      </CardHeader>
      <CardContent>
        {calls.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No upcoming calls</p>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate("/dashboard/teacher/schedule")}
              className="mt-2"
            >
              Schedule a call
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {calls.map((call) => {
              const scheduledTime = new Date(call.scheduled_at);
              const canStart = isCallAvailable(call.scheduled_at);

              return (
                <div
                  key={call.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{call.student_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {call.course_title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(scheduledTime, "MMM d, p")}
                      </span>
                    </div>
                  </div>
                  {canStart && (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/video-call/room-${call.id}?sessionId=${call.id}`)}
                      className="gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Start
                    </Button>
                  )}
                </div>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard/teacher/schedule")}
              className="w-full"
            >
              View All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
