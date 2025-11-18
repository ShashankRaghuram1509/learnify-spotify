import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Calendar, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ScheduledSlot {
  id: string;
  scheduled_at: string;
  teacher_name: string;
  course_title: string;
  status: string;
  duration_minutes: number;
}

export default function StudentTimetable() {
  const { user } = useAuth();
  const [scheduledSlots, setScheduledSlots] = useState<ScheduledSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchScheduledSlots();
    
    const channel = supabase
      .channel('student-schedule-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_call_schedules',
          filter: `student_id=eq.${user.id}`
        },
        () => {
          fetchScheduledSlots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchScheduledSlots = async () => {
    try {
      const now = new Date();
      const { data, error } = await supabase
        .from("video_call_schedules")
        .select(`
          id,
          scheduled_at,
          status,
          duration_minutes,
          teacher_id,
          courses (
            title
          )
        `)
        .eq("student_id", user?.id)
        .eq("status", "scheduled")
        .gte("scheduled_at", now.toISOString())
        .order("scheduled_at", { ascending: true });

      if (error) throw error;

      // Fetch teacher profiles
      const teacherIds = data?.map((s: any) => s.teacher_id).filter(Boolean) || [];
      let teacherProfiles: any = {};
      
      if (teacherIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", teacherIds);
        
        teacherProfiles = profiles?.reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {}) || {};
      }

      const formattedSlots = data?.map((slot: any) => ({
        id: slot.id,
        scheduled_at: slot.scheduled_at,
        teacher_name: teacherProfiles[slot.teacher_id]?.full_name || 
                     teacherProfiles[slot.teacher_id]?.email || "Teacher",
        course_title: slot.courses?.title || "Course",
        status: slot.status,
        duration_minutes: slot.duration_minutes,
      })) || [];

      setScheduledSlots(formattedSlots);

      // Check for imminent sessions
      checkUpcomingNotifications(formattedSlots);
    } catch (error) {
      console.error("Error fetching scheduled slots:", error);
      toast.error("Failed to load your schedule");
    } finally {
      setLoading(false);
    }
  };

  const checkUpcomingNotifications = (slots: ScheduledSlot[]) => {
    const now = new Date();
    slots.forEach(slot => {
      const scheduledTime = new Date(slot.scheduled_at);
      const minutesUntil = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);
      
      if (minutesUntil > 0 && minutesUntil <= 5) {
        toast.info(`Video call starting soon with ${slot.teacher_name}`, {
          description: `Scheduled for ${format(scheduledTime, "p")}`,
          duration: 8000,
        });
      }
    });
  };

  const getTimeUntil = (scheduledAt: string) => {
    const now = new Date();
    const scheduledTime = new Date(scheduledAt);
    const minutesUntil = Math.floor((scheduledTime.getTime() - now.getTime()) / (1000 * 60));
    
    if (minutesUntil < 0) return "In progress";
    if (minutesUntil === 0) return "Starting now";
    if (minutesUntil < 60) return `In ${minutesUntil} minutes`;
    
    const hours = Math.floor(minutesUntil / 60);
    return `In ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading your schedule...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Your Scheduled Sessions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {scheduledSlots.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No upcoming sessions scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scheduledSlots.map((slot) => {
              const scheduledTime = new Date(slot.scheduled_at);
              const now = new Date();
              const minutesUntil = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);
              const isJoinable = minutesUntil <= 5 && minutesUntil >= -slot.duration_minutes;

              return (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{slot.course_title}</p>
                    <p className="text-sm text-muted-foreground">
                      with {slot.teacher_name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(scheduledTime, "PPP")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(scheduledTime, "p")}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm font-medium text-primary">
                      {getTimeUntil(slot.scheduled_at)}
                    </div>
                    
                    {isJoinable ? (
                      <Button 
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => navigate(`/video-call/room-${slot.id}?sessionId=${slot.id}`)}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Join Call
                      </Button>
                    ) : (
                      <div className="text-xs text-muted-foreground mt-1">
                        {slot.duration_minutes} minutes
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
