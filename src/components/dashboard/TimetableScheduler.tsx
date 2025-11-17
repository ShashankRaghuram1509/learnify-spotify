import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Video, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface ScheduleSlot {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  student_name: string;
  student_id: string;
  course_id: string;
  status: string;
}

interface EnrolledStudent {
  id: string;
  student_id: string;
  course_id: string;
  profiles: {
    full_name: string | null;
    email: string;
  } | null;
}

export default function TimetableScheduler() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("14:00");
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      // Fetch teacher's courses
      const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select("id")
        .eq("teacher_id", user.id);

      if (coursesError) throw coursesError;

      if (courses && courses.length > 0) {
        const courseIds = courses.map((c) => c.id);
        
        // Fetch enrollments
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from("enrollments")
          .select("id, student_id, course_id")
          .in("course_id", courseIds);

        if (enrollmentsError) throw enrollmentsError;

        if (enrollments && enrollments.length > 0) {
          const studentIds = [...new Set(enrollments.map(e => e.student_id))];
          
          // Fetch student profiles
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", studentIds);

          if (profilesError) throw profilesError;

          const uniqueStudents = studentIds.map(studentId => {
            const enrollment = enrollments.find(e => e.student_id === studentId);
            const profile = profilesData?.find(p => p.id === studentId);
            
            return {
              id: enrollment?.id || studentId,
              student_id: studentId,
              course_id: enrollment?.course_id || "",
              profiles: profile ? {
                full_name: profile.full_name,
                email: profile.email
              } : null
            } as EnrolledStudent;
          });

          setEnrolledStudents(uniqueStudents);
        }

        // Fetch scheduled slots
        const { data: slots, error: slotsError } = await supabase
          .from("video_call_schedules")
          .select("*")
          .eq("teacher_id", user.id)
          .gte("scheduled_at", new Date().toISOString())
          .order("scheduled_at", { ascending: true });

        if (slotsError) throw slotsError;

        if (slots) {
          // Enrich with student names
          const enrichedSlots = await Promise.all(
            slots.map(async (slot) => {
              const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, email")
                .eq("id", slot.student_id)
                .single();

              return {
                ...slot,
                student_name: profile?.full_name || profile?.email || "Unknown",
              };
            })
          );

          setScheduleSlots(enrichedSlots);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load schedule data");
    }
  };

  const handleSchedule = async () => {
    if (!date || !time || !selectedStudentId) {
      toast.error("Please select date, time, and student");
      return;
    }

    const student = enrolledStudents.find(s => s.student_id === selectedStudentId);
    if (!student) {
      toast.error("Invalid student selected");
      return;
    }

    try {
      const [hours, minutes] = time.split(':');
      const scheduledDateTime = new Date(date);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { error } = await supabase
        .from("video_call_schedules")
        .insert({
          teacher_id: user!.id,
          student_id: student.student_id,
          course_id: student.course_id,
          scheduled_at: scheduledDateTime.toISOString(),
          duration_minutes: 60,
          status: 'scheduled'
        });

      if (error) throw error;

      toast.success("Time slot scheduled successfully");
      fetchData();
      setSelectedStudentId("");
    } catch (error) {
      console.error("Error scheduling:", error);
      toast.error("Failed to schedule time slot");
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from("video_call_schedules")
        .delete()
        .eq("id", slotId);

      if (error) throw error;

      toast.success("Time slot deleted");
      fetchData();
    } catch (error) {
      console.error("Error deleting slot:", error);
      toast.error("Failed to delete time slot");
    }
  };

  const handleStartCall = async (slot: ScheduleSlot) => {
    const now = new Date();
    const scheduledTime = new Date(slot.scheduled_at);
    const minutesUntil = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);

    if (minutesUntil > 5) {
      toast.error(`Call can only be started 5 minutes before scheduled time`);
      return;
    }

    // Generate unique room ID for this session
    const roomId = `room-${slot.id}-${Date.now()}`;
    
    // Navigate to video call page with session info
    navigate(`/video-call/${roomId}?sessionId=${slot.id}`);
  };

  const isCallAvailable = (scheduledAt: string) => {
    const now = new Date();
    const scheduledTime = new Date(scheduledAt);
    const minutesUntil = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);
    return minutesUntil <= 5 && minutesUntil >= -15;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Time Slots</CardTitle>
          <CardDescription>
            Create availability slots for video calls with your students
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {enrolledStudents.map((student) => (
                    <SelectItem key={student.student_id} value={student.student_id}>
                      {student.profiles?.full_name || student.profiles?.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
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
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Select Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSchedule} className="w-full">
            Add to Timetable
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Time Slots</CardTitle>
          <CardDescription>
            Your upcoming availability slots. Start calls when the time arrives.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduleSlots.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No scheduled slots</p>
          ) : (
            <div className="space-y-3">
              {scheduleSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{slot.student_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(slot.scheduled_at), "PPP 'at' p")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {isCallAvailable(slot.scheduled_at) && (
                      <Button
                        onClick={() => handleStartCall(slot)}
                        size="sm"
                        className="gap-2"
                      >
                        <Video className="h-4 w-4" />
                        Start Call
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDeleteSlot(slot.id)}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
