import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface VideoSession {
  id: string;
  teacher_id: string;
  student_id: string | null;
  scheduled_at: string;
  meeting_url: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function VideoCallManagement() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("14:00");
  const [upcomingSessions, setUpcomingSessions] = useState<VideoSession[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("video_call_schedules")
          .select("*")
          .eq("teacher_id", user.id);
        if (error) throw error;
        setUpcomingSessions(data);
      } catch (error) {
        // Silent fail - sessions will show as empty
      }
    };
    fetchSessions();
  }, [user]);

  const handleSchedule = async () => {
    if (date && time && user) {
      const roomID = Math.random().toString(36).substring(2, 9);
      const sessionTime = `${format(date, "yyyy-MM-dd")}T${time}`;
      try {
        const { data: newSession, error } = await supabase
          .from("video_call_schedules")
          .insert({
            teacher_id: user.id,
            student_id: null, // FIXME: hardcoded student_id
            scheduled_at: sessionTime,
            meeting_url: roomID,
            status: 'scheduled'
          })
          .select()
          .single();
        
        if (error) throw error;
        toast.success(`Session scheduled for ${format(date, "PPP")} at ${time}`);
        
        // Refresh sessions
        const { data, error: fetchError } = await supabase
          .from("video_call_schedules")
          .select("*")
          .eq("teacher_id", user.id);
        if (fetchError) throw fetchError;
        setUpcomingSessions(data);
      } catch (error) {
        toast.error("Failed to schedule session.");
      }
    } else {
      toast.error("Please select a date and time.");
    }
  };

  const handleJoinCall = (sessionId: string, roomId: string) => {
    navigate(`/video-call?sessionId=${sessionId}&roomId=${roomId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule a Session</CardTitle>
        <CardDescription>
          Select a date and time for a new video call.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
        <Button onClick={handleSchedule} className="w-full">
          Schedule
        </Button>
      </CardContent>

      <div className="px-6 pb-6">
        <h3 className="text-lg font-semibold mt-6 mb-4">Upcoming Sessions</h3>
        <div className="space-y-3">
          {upcomingSessions.map((session: VideoSession) => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-spotify-gray/20 rounded-lg">
              <div>
                <p className="font-semibold">Session with {session.student_id || "a student"}</p>
                <p className="text-sm text-spotify-text/70">{format(new Date(session.scheduled_at), "PPP p")}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleJoinCall(session.id, session.meeting_url)}
              >
                <Video className="h-5 w-5 text-spotify" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
