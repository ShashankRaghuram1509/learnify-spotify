
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, Video, Mic, MicOff, VideoOff, PhoneOff, Phone } from "lucide-react";
import { premiumService } from "@/services";
import { toast } from "sonner";

const VideoCall = () => {
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const handleScheduleCall = async () => {
    try {
      // This would call our Spring Boot backend in a real app
      await premiumService.scheduleVideoCall({
        date: selectedDate,
        time: selectedTime,
      });
      
      toast.success("Video call scheduled successfully!");
      setShowScheduleDialog(false);
      setSelectedDate("");
      setSelectedTime("");
    } catch (error) {
      toast.error("Failed to schedule call. Please try again.");
      console.error(error);
    }
  };

  const handleStartCall = () => {
    setIsCallActive(true);
    // In a real app, this would connect to video call service
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setShowCallDialog(false);
    setIsMicMuted(false);
    setIsVideoOn(true);
    // In a real app, this would disconnect from video call service
  };

  const availableTimes = [
    "09:00 AM", "10:00 AM", "11:00 AM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"
  ];

  return (
    <>
      <Card className="h-[500px] flex flex-col border-spotify/20 bg-spotify-gray/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Video className="h-5 w-5 text-spotify" />
            Video Call Support
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-32 h-32 mx-auto bg-spotify-dark/80 rounded-full flex items-center justify-center">
              <Video className="h-14 w-14 text-spotify" />
            </div>
            <div>
              <h3 className="text-xl font-medium">Expert Video Support</h3>
              <p className="text-sm text-gray-400 mt-2">
                Get personalized help from our instructors through one-on-one video calls.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 justify-center p-6">
          <Button
            variant="outline"
            className="border-spotify/40 text-white hover:bg-spotify/20"
            onClick={() => setShowScheduleDialog(true)}
          >
            <Calendar className="mr-2 h-4 w-4" /> Schedule Call
          </Button>
          <Button
            className="bg-spotify hover:bg-spotify-light"
            onClick={() => setShowCallDialog(true)}
          >
            <Phone className="mr-2 h-4 w-4" /> Start Now
          </Button>
        </CardFooter>
      </Card>

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[425px] bg-spotify-gray border-spotify-gray/90">
          <DialogHeader>
            <DialogTitle>Schedule Video Call</DialogTitle>
            <DialogDescription>
              Choose a date and time for your session with an instructor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            
            {selectedDate && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      type="button"
                      className={`px-3 py-2 text-sm rounded-md transition-colors ${
                        selectedTime === time
                          ? "bg-spotify text-white"
                          : "bg-spotify-gray/50 hover:bg-spotify/20"
                      }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowScheduleDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleCall}
              className="bg-spotify hover:bg-spotify-light"
              disabled={!selectedDate || !selectedTime}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Call Dialog */}
      <Dialog open={showCallDialog} onOpenChange={(open) => {
        if (!open && isCallActive) {
          // Ask for confirmation before closing if call is active
          if (window.confirm("Are you sure you want to end the call?")) {
            handleEndCall();
          } else {
            setShowCallDialog(true);
            return;
          }
        }
        setShowCallDialog(open);
      }}>
        <DialogContent className="sm:max-w-[600px] h-[500px] p-0 overflow-hidden bg-spotify-dark border-spotify-gray/90">
          {!isCallActive ? (
            <div className="flex flex-col h-full">
              <DialogHeader className="p-4">
                <DialogTitle>Start Video Call</DialogTitle>
                <DialogDescription>
                  Connect with an instructor immediately for personalized help.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-grow flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-spotify-gray/30 rounded-full flex items-center justify-center">
                    <Video className="h-10 w-10 text-spotify" />
                  </div>
                  <p className="text-sm text-gray-400">
                    Ready to start your video session? An instructor will join shortly after you connect.
                  </p>
                </div>
              </div>
              <DialogFooter className="p-4 border-t border-spotify-gray/30">
                <Button
                  variant="ghost"
                  onClick={() => setShowCallDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStartCall}
                  className="bg-spotify hover:bg-spotify-light"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Connect Now
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-grow p-0 bg-black relative">
                {/* Mock video UI */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isVideoOn ? (
                    <img 
                      src="https://images.unsplash.com/photo-1544531585-9847b68c8c86?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                      alt="Instructor video" 
                      className="w-full h-full object-cover opacity-70"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-spotify-dark">
                      <VideoOff className="h-16 w-16 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                  {isVideoOn ? (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <Video className="h-8 w-8 text-gray-400" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <VideoOff className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>
              <div className="h-16 bg-spotify-gray/90 flex items-center justify-center gap-3 px-4">
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full h-10 w-10 ${isMicMuted ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-transparent'}`}
                  onClick={() => setIsMicMuted(!isMicMuted)}
                >
                  {isMicMuted ? <MicOff /> : <Mic />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full h-10 w-10 ${!isVideoOn ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-transparent'}`}
                  onClick={() => setIsVideoOn(!isVideoOn)}
                >
                  {isVideoOn ? <Video /> : <VideoOff />}
                </Button>
                <Button
                  size="icon"
                  className="rounded-full h-12 w-12 bg-red-600 hover:bg-red-700"
                  onClick={handleEndCall}
                >
                  <PhoneOff />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoCall;
