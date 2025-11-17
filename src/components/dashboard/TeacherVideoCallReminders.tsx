import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface VideoCall {
  id: string;
  scheduled_at: string;
  student_name: string;
  course_title: string;
  meeting_url: string | null;
  status: string;
}

export default function TeacherVideoCallReminders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingSessions, setUpcomingSessions] = useState<VideoCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchUpcomingSessions();
    const cleanup = setupRealtimeSubscription();
    return () => cleanup && cleanup();
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
          student_id,
          courses (
            title
          )
        `)
        .eq("teacher_id", user?.id)
        .eq("status", "scheduled")
        .gte("scheduled_at", now)
        .order("scheduled_at", { ascending: true })
        .limit(5);

      if (error) throw error;

      const studentIds = data?.map((s: any) => s.student_id).filter(Boolean) || [];
      let studentProfiles: any = {};
      
      if (studentIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", studentIds);
        
        studentProfiles = profiles?.reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {}) || {};
      }

      const formattedSessions = data?.map((session: any) => ({
        id: session.id,
        scheduled_at: session.scheduled_at,
        student_name: studentProfiles[session.student_id]?.full_name || studentProfiles[session.student_id]?.email || "Student",
        course_title: session.courses?.title || "Course",
        meeting_url: session.meeting_url,
        status: session.status,
      })) || [];

      setUpcomingSessions(formattedSessions);
      
      // Check for upcoming sessions in the next 5 minutes
      checkUpcomingNotifications(formattedSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('teacher-video-calls')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_call_schedules',
          filter: `teacher_id=eq.${user?.id}`
        },
        () => {
          fetchUpcomingSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const checkUpcomingNotifications = (sessions: VideoCall[]) => {
    sessions.forEach((session) => {
      const scheduledTime = new Date(session.scheduled_at).getTime();
      const now = new Date().getTime();
      const timeDiff = scheduledTime - now;
      
      // Notify if session is within 5 minutes
      if (timeDiff > 0 && timeDiff <= 5 * 60 * 1000) {
        toast.info(`Upcoming session with ${session.student_name}`, {
          description: `Starts in ${Math.round(timeDiff / 60000)} minutes`,
          icon: <Bell className="h-4 w-4" />,
          duration: 10000,
        });
      }
    });
  };

  const handleStartCall = (session: VideoCall) => {
    if (session.meeting_url) {
      // Open existing meeting (supports both full URL and room code)
      const url = session.meeting_url.includes('/')
        ? session.meeting_url
        : `/video-call/${session.meeting_url}?sessionId=${session.id}`;
      window.open(url, "_blank");
      toast.success("Starting video call...");
    } else {
      // Generate a room id and store it; student will get realtime update
      const roomId = `room_${session.id}`;

      supabase
        .from("video_call_schedules")
        .update({ 
          meeting_url: roomId
        })
        .eq("id", session.id)
        .then(() => {
          const url = `/video-call/${roomId}?sessionId=${session.id}`;
          navigate(url);
          toast.success("Starting video call...");
        });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="text-primary" />
            Scheduled Sessions
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
          Scheduled Sessions
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
                      with {session.student_name}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(session.scheduled_at), "PPp")}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleStartCall(session)}
                  size="sm"
                  className="w-full"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Start Session
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
