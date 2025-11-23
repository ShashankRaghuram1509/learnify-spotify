import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export default function useProctoring(submissionId: string | null, enabled: boolean) {
  const { user } = useAuth();
  const [violations, setViolations] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const logEvent = useCallback(async (eventType: string, eventData?: any) => {
    if (!submissionId || !user || !enabled) return;

    try {
      await supabase.from("proctoring_logs").insert({
        submission_id: submissionId,
        student_id: user.id,
        event_type: eventType,
        event_data: eventData || {},
      });
      setViolations((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to log proctoring event:", error);
    }
  }, [submissionId, user, enabled]);

  useEffect(() => {
    if (!enabled || !isActive) return;

    // Track tab switches and window blur
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logEvent("tab_switch", { timestamp: new Date().toISOString() });
      }
    };

    const handleWindowBlur = () => {
      logEvent("window_blur", { timestamp: new Date().toISOString() });
    };

    // Track copy attempts
    const handleCopy = (e: ClipboardEvent) => {
      logEvent("copy_attempt", {
        timestamp: new Date().toISOString(),
        text: window.getSelection()?.toString().substring(0, 100),
      });
    };

    // Track paste attempts
    const handlePaste = (e: ClipboardEvent) => {
      logEvent("paste_attempt", { timestamp: new Date().toISOString() });
    };

    // Track right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logEvent("right_click", { timestamp: new Date().toISOString() });
    };

    // Track fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logEvent("fullscreen_exit", { timestamp: new Date().toISOString() });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Request fullscreen
    document.documentElement.requestFullscreen().catch(() => {
      logEvent("fullscreen_denied", { timestamp: new Date().toISOString() });
    });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);

      // Exit fullscreen when component unmounts
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [enabled, isActive, logEvent]);

  const startProctoring = useCallback(() => {
    setIsActive(true);
    setViolations(0);
  }, []);

  const stopProctoring = useCallback(() => {
    setIsActive(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  return {
    violations,
    isActive,
    startProctoring,
    stopProctoring,
  };
}
