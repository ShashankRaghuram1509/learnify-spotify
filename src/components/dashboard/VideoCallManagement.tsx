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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";

type VideoSession = Database["public"]["Tables"]["video_call_schedules"]["Row"];

interface EnrolledStudent {
  id: string;
  student_id: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

export default function VideoCallManagement() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("14:00");
  const [upcomingSessions, setUpcomingSessions] = useState<VideoSession[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Fetch enrolled students for the teacher's courses
        const { data: courses } = await supabase
          .from("courses")
          .select("id")
          .eq("teacher_id", user.id);

        if (courses && courses.length > 0) {
          const courseIds = courses.map((c) => c.id);
          const { data: enrollments } = await supabase
            .from("enrollments")
            .select("id, student_id")
            .in("course_id", courseIds);

          if (enrollments) {
            // Fetch profile data separately
            const studentIds = enrollments.map(e => e.student_id);
            const { data: profilesData } = await supabase
              .from("profiles")
              .select("id, full_name, email")
              .in("id", studentIds);

            // Combine the data
            const enriched = enrollments.map(enrollment => ({
              ...enrollment,
              profiles: profilesData?.find(p => p.id === enrollment.student_id) || null
            }));
            
            setEnrolledStudents(enriched as EnrolledStudent[]);
          }
        }

        // Fetch upcoming sessions
        const { data, error } = await supabase
          .from("video_call_schedules")
          .select("*")
          .eq("teacher_id", user.id);
        if (error) throw error;
        setUpcomingSessions(data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [user]);

  const handleSchedule = async () => {
    if (!date || !time || !user) {
      toast.error("Please select a date and time.");
      return;
    }

    if (!selectedStudentId) {
      toast.error("Please select a student.");
      return;
    }

    const roomID = Math.random().toString(36).substring(2, 9);
    const sessionTime = `${format(date, "yyyy-MM-dd")}T${time}`;
    
    try {
      const { error } = await supabase
        .from("video_call_schedules")
        .insert({
          teacher_id: user.id,
          student_id: selectedStudentId,
          scheduled_at: sessionTime,
          meeting_url: roomID,
          status: 'scheduled'
        });
      
      if (error) throw error;
      toast.success(`Session scheduled for ${format(date, "PPP")} at ${time}`);
      
      // Refresh sessions
      const { data } = await supabase
        .from("video_call_schedules")
        .select("*")
        .eq("teacher_id", user.id);
      
      setUpcomingSessions(data || []);
      setSelectedStudentId("");
    } catch (error) {
      console.error("Error scheduling session:", error);
      toast.error("Failed to schedule session.");
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
          <Label>Student</Label>
          <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              {enrolledStudents.map((enrollment) => (
                <SelectItem key={enrollment.id} value={enrollment.student_id}>
                  {enrollment.profiles?.full_name || enrollment.profiles?.email || "Unknown Student"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming sessions scheduled.</p>
          ) : (
            upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">Session with {session.student_id || "a student"}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(session.scheduled_at), "PPP p")}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleJoinCall(session.id, session.meeting_url || "")}
                >
                  <Video className="h-5 w-5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
