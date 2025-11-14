import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface VideoCall {
  id: string;
  scheduled_at: string;
  teacher_name: string;
  course_title: string;
  meeting_url: string | null;
  status: string;
}

export default function VideoCallReminders() {
  const { user } = useAuth();
  const [upcomingSessions, setUpcomingSessions] = useState<VideoCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUpcomingSessions();
    }
  }, [user]);

  const fetchUpcomingSessions = async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("video_call_schedules")
        .select(`
          id,
          scheduled_at,
          meeting_url,
          status,
          courses (
            title
          ),
          profiles!video_call_schedules_teacher_id_fkey (
            full_name,
            email
          )
        `)
        .eq("student_id", user?.id)
        .eq("status", "scheduled")
        .gte("scheduled_at", now)
        .order("scheduled_at", { ascending: true })
        .limit(3);

      if (error) throw error;

      const formattedSessions = data?.map((session: any) => ({
        id: session.id,
        scheduled_at: session.scheduled_at,
        teacher_name: session.profiles?.full_name || session.profiles?.email || "Teacher",
        course_title: session.courses?.title || "Course",
        meeting_url: session.meeting_url,
        status: session.status,
      })) || [];

      setUpcomingSessions(formattedSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCall = (meetingUrl: string | null) => {
    if (meetingUrl) {
      window.open(meetingUrl, "_blank");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="text-primary" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="text-primary" />
          Upcoming Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingSessions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No upcoming sessions scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="p-3 bg-secondary/20 rounded-lg space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{session.course_title}</p>
                    <p className="text-sm text-muted-foreground">
                      with {session.teacher_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(session.scheduled_at), "PPp")}
                    </div>
                  </div>
                </div>
                {session.meeting_url && (
                  <Button
                    onClick={() => handleJoinCall(session.meeting_url)}
                    size="sm"
                    className="w-full"
                  >
                    <Video className="mr-2 h-4 w-4" />
                    Join Session
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
