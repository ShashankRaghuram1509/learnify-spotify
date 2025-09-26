import { useState } from "react";
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

const upcomingSessions = [
  { student: "Alice Johnson", time: "2024-10-01 10:00 AM" },
  { student: "Bob Williams", time: "2024-10-02 02:30 PM" },
];

export default function VideoCallManagement() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("14:00");

  const handleSchedule = () => {
    if (date && time) {
      toast.success(`Session scheduled for ${format(date, "PPP")} at ${time}`);
    } else {
      toast.error("Please select a date and time.");
    }
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
          {upcomingSessions.map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-spotify-gray/20 rounded-lg">
              <div>
                <p className="font-semibold">{session.student}</p>
                <p className="text-sm text-spotify-text/70">{session.time}</p>
              </div>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5 text-spotify" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}