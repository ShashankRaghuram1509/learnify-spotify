import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function VideoCall() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { roomID } = useParams();
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    const sessionId = searchParams.get('sessionId');
    const roomId = searchParams.get('roomId') || roomID || null;

    console.log('🎥 VideoCall - Initializing', { sessionId, roomId });

    if (!sessionId || !roomId) {
      toast.error('Invalid video call link');
      navigate('/');
      return;
    }

    const initializeVideoCall = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
        if (sessionError || !session) {
          toast.error('Session expired. Please login again');
          navigate('/auth');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();

        const userName = profile?.full_name || session.user.email || 'User';

        // Get token from backend
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('generate-video-token', {
          body: { session_id: sessionId, room_id: roomId }
        });

        if (tokenError || !tokenData) {
          toast.error('Failed to generate video token');
          navigate('/');
          return;
        }

        const { token: token04, appId, userId, roomId: serverRoomId } = tokenData;

        await new Promise(resolve => setTimeout(resolve, 100));

        if (!containerRef.current) {
          toast.error('Video container not ready');
          navigate('/');
          return;
        }

        // Convert Token04 from backend to KitToken (required for ZegoUIKitPrebuilt)
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          Number(appId),
          token04,
          serverRoomId || roomId,
          userId,
          userName
        );
        
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        
        zp.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall, // Can be changed to GroupCall for group calls
          },
          turnOnCameraWhenJoining: true,
          turnOnMicrophoneWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: true,
          showTextChat: true,
          showUserList: true,
          maxUsers: 10, // Support for group calls
          layout: "Auto",
          showLayoutButton: true,
          onJoinRoom: () => {
            console.log('✅ Joined room successfully');
            setLoading(false);
            toast.success('Connected to video call');
          },
          onLeaveRoom: () => {
            console.log('👋 Left room');
            navigate('/dashboard/student');
          },
        });

      } catch (error: any) {
        console.error('💥 VideoCall error:', error);
        toast.error(error.message || 'Failed to join video call');
        navigate('/');
      }
    };

    initializeVideoCall();
  }, [searchParams, navigate, roomID]);

  return (
    <div className="w-screen h-screen bg-background">
      {loading && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground">Joining video call...</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  );
}
