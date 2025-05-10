
import { toast } from "sonner";
import { getHeaders } from './base.service';
import type { PaymentFormData, VideoCallSchedule } from './types';

export const premiumService = {
  subscribe: async (paymentDetails: PaymentFormData) => {
    try {
      const response = await fetch(`/api/premium/subscribe`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(paymentDetails),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Subscription failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error("Failed to process subscription. Please try again.");
      throw error;
    }
  },
  
  sendAiMessage: async (message: string) => {
    try {
      const response = await fetch(`/api/premium/ai-assistant`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('AI request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('AI request error:', error);
      toast.error("Failed to get AI response. Please try again.");
      throw error;
    }
  },
  
  scheduleVideoCall: async (scheduleData: VideoCallSchedule) => {
    try {
      const response = await fetch(`/api/premium/schedule-call`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(scheduleData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Scheduling failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Scheduling error:', error);
      toast.error("Failed to schedule video call. Please try again.");
      throw error;
    }
  },
  
  getScheduledCalls: async () => {
    try {
      const response = await fetch(`/api/premium/scheduled-calls`, {
        method: 'GET',
        headers: getHeaders(),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch scheduled calls');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching scheduled calls:', error);
      toast.error("Failed to fetch scheduled calls.");
      throw error;
    }
  }
};
