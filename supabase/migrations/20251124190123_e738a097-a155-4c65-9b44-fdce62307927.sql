-- Update RLS policy for job_roles to match actual subscription tier values
DROP POLICY IF EXISTS "Premium students can view job roles" ON job_roles;

CREATE POLICY "Premium students can view job roles" 
ON job_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid() 
    AND (
      profiles.subscription_tier IN ('pro', 'premium', 'Lite', 'Premium', 'Premium Pro')
      OR profiles.subscription_tier IS NOT NULL
    )
    AND (
      profiles.subscription_expires_at IS NULL 
      OR profiles.subscription_expires_at > now()
    )
  )
);