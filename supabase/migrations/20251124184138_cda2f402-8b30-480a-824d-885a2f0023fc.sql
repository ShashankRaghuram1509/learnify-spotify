-- Add partner companies (MOU) table
CREATE TABLE IF NOT EXISTS public.partner_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  mou_signed_date DATE,
  website TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.partner_companies ENABLE ROW LEVEL SECURITY;

-- Everyone can view partner companies
CREATE POLICY "Anyone can view partner companies"
ON public.partner_companies
FOR SELECT
USING (true);

-- Admins can manage partner companies
CREATE POLICY "Admins can manage partner companies"
ON public.partner_companies
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add experience_level to profiles for teachers
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS experience_level TEXT;

-- Add recommendation_letter_url to student_applications
ALTER TABLE public.student_applications
ADD COLUMN IF NOT EXISTS recommendation_letter_url TEXT,
ADD COLUMN IF NOT EXISTS recommendation_generated_at TIMESTAMP WITH TIME ZONE;

-- Update trigger for partner_companies
CREATE TRIGGER update_partner_companies_updated_at
BEFORE UPDATE ON public.partner_companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing payments to INR (assuming 1 USD = 83 INR)
UPDATE public.payments 
SET 
  amount = CASE 
    WHEN currency = 'USD' THEN amount * 83
    ELSE amount
  END,
  currency = 'INR'
WHERE currency != 'INR' OR currency IS NULL;

-- Insert sample partner companies
INSERT INTO public.partner_companies (name, description, mou_signed_date, website)
VALUES 
  ('TechCorp Solutions', 'Leading IT services company specializing in cloud computing and AI', '2024-01-15', 'https://techcorp.example.com'),
  ('InnovateSoft India', 'Software product development company', '2024-03-20', 'https://innovatesoft.example.com'),
  ('DataDrive Analytics', 'Data analytics and business intelligence firm', '2024-06-10', 'https://datadrive.example.com'),
  ('CloudScale Technologies', 'Cloud infrastructure and DevOps solutions provider', '2024-08-05', 'https://cloudscale.example.com')
ON CONFLICT DO NOTHING;