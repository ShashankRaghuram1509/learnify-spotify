-- Add subscription tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN subscription_tier TEXT DEFAULT 'free',
ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster subscription queries
CREATE INDEX idx_profiles_subscription ON public.profiles(subscription_tier, subscription_expires_at);