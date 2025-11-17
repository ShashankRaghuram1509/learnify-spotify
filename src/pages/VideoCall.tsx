import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function VideoCall() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { roomID } = useParams();

  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    const roomId = searchParams.get('roomId') || roomID || null;

    if (!sessionId || !roomId) {
      toast.error('Invalid video call link');
      navigate('/');
      return;
    }

    const initializeVideoCall = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error('Please login to join video call');
          navigate('/auth');
          return;
        }

        // Get video token from Edge Function
        const { data, error } = await supabase.functions.invoke('generate-video-token', {
          body: { session_id: sessionId, room_id: roomId },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        if (!data?.token || !data?.appId) {
          throw new Error('Failed to get video credentials');
        }

        // Initialize ZegoCloud with the token
        if (containerRef.current) {
          const zp = ZegoUIKitPrebuilt.create(data.token);
          zp.joinRoom({
            container: containerRef.current,
            scenario: {
              mode: ZegoUIKitPrebuilt.GroupCall,
            },
            showPreJoinView: false,
          });
        }

        setLoading(false);
      } catch (error: any) {
        console.error('Video call error:', error);
        if (error.message === 'Not authorized to join this video call') {
          toast.error('You are not authorized to join this video call');
        } else if (error.message === 'Payment required') {
          toast.error('Please purchase the course to access video calls');
        } else {
          toast.error('Failed to join video call');
        }
        navigate('/');
      }
    };

    initializeVideoCall();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-spotify-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify mx-auto mb-4"></div>
          <p className="text-spotify-text">Joining video call...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen"
    />
  );
}
