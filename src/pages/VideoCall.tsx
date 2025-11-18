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
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      console.log('⏭️ VideoCall - Already initialized, skipping');
      return;
    }
    initializedRef.current = true;
    const sessionId = searchParams.get('sessionId');
    const roomId = searchParams.get('roomId') || roomID || null;

    console.log('🎥 VideoCall - Starting initialization', { sessionId, roomId, roomID });

    if (!sessionId || !roomId) {
      console.error('❌ VideoCall - Missing parameters', { sessionId, roomId });
      toast.error('Invalid video call link');
      navigate('/');
      return;
    }

    const initializeVideoCall = async () => {
      try {
        console.log('🔐 VideoCall - Getting session');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('❌ VideoCall - No session found');
          toast.error('Please login to join video call');
          navigate('/auth');
          return;
        }

        console.log('✅ VideoCall - Session found, user:', session.user.id);

        console.log('👤 VideoCall - Fetching profile');
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();

        const userName = profile?.full_name || session.user.email || 'User';
        console.log('✅ VideoCall - User name:', userName);

        // For now, use test token generation (simpler approach)
        console.log('🔑 VideoCall - Generating test token directly');
        const appID = 257830719;
        const serverSecret = "41bebb56e82bab2523a61b1174eac258";
        
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomId,
          session.user.id,
          userName
        );

        console.log('✅ VideoCall - Kit token generated');

        if (containerRef.current) {
          console.log('📦 VideoCall - Container ref found, creating ZegoUIKit instance');
          const zp = ZegoUIKitPrebuilt.create(kitToken);
          console.log('✅ VideoCall - ZegoUIKit instance created');
          
          console.log('🚀 VideoCall - Joining room with config');
          zp.joinRoom({
            container: containerRef.current,
            turnOnMicrophoneWhenJoining: true,
            turnOnCameraWhenJoining: true,
            showMyCameraToggleButton: true,
            showMyMicrophoneToggleButton: true,
            showAudioVideoSettingsButton: true,
            showScreenSharingButton: true,
            showTextChat: true,
            showUserList: true,
            maxUsers: 2,
            layout: "Auto",
            showLayoutButton: false,
            scenario: {
              mode: ZegoUIKitPrebuilt.OneONoneCall,
              config: {
                role: ZegoUIKitPrebuilt.Host,
              },
            },
          });
          console.log('✅ VideoCall - joinRoom called successfully');
        } else {
          console.error('❌ VideoCall - Container ref is null');
        }

        setLoading(false);
        console.log('✅ VideoCall - Initialization complete');
      } catch (error: any) {
        console.error('💥 VideoCall - Fatal error:', error);
        console.error('💥 VideoCall - Error message:', error.message);
        console.error('💥 VideoCall - Error stack:', error.stack);
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
