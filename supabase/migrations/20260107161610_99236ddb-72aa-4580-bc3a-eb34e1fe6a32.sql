-- Certificate templates (admin managed)
CREATE TABLE public.certificate_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL DEFAULT 'event',
  background_color TEXT DEFAULT '#ffffff',
  primary_color TEXT DEFAULT '#7c3aed',
  logo_url TEXT,
  badge_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Issued certificates (verified records)
CREATE TABLE public.issued_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT UNIQUE NOT NULL,
  template_id UUID REFERENCES public.certificate_templates(id) ON DELETE SET NULL,
  user_id UUID,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  issue_date TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  verification_url TEXT,
  linkedin_credential_id TEXT,
  metadata JSONB DEFAULT '{}',
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Event RSVPs
CREATE TABLE public.event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  attending_mode TEXT NOT NULL DEFAULT 'online',
  dietary_requirements TEXT,
  additional_notes TEXT,
  status TEXT DEFAULT 'confirmed',
  check_in_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, email)
);

-- Enable RLS
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issued_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- Certificate templates policies (admin only for write, public read for active)
CREATE POLICY "Anyone can view active certificate templates"
ON public.certificate_templates FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage certificate templates"
ON public.certificate_templates FOR ALL
USING (public.is_admin());

-- Issued certificates policies
CREATE POLICY "Users can view their own certificates"
ON public.issued_certificates FOR SELECT
USING (user_id = auth.uid() OR recipient_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Anyone can verify certificates by number"
ON public.issued_certificates FOR SELECT
USING (true);

CREATE POLICY "Admins can manage all certificates"
ON public.issued_certificates FOR ALL
USING (public.is_admin());

CREATE POLICY "Authenticated users can request certificates"
ON public.issued_certificates FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Event RSVPs policies
CREATE POLICY "Users can view their own RSVPs"
ON public.event_rsvps FOR SELECT
USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins can view all RSVPs"
ON public.event_rsvps FOR SELECT
USING (public.is_admin());

CREATE POLICY "Anyone can create RSVP"
ON public.event_rsvps FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own RSVPs"
ON public.event_rsvps FOR UPDATE
USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage all RSVPs"
ON public.event_rsvps FOR ALL
USING (public.is_admin());

-- Create storage bucket for certificates
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for certificates bucket
CREATE POLICY "Public can view certificate assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');

CREATE POLICY "Admins can upload certificate assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'certificates' AND public.is_admin());

CREATE POLICY "Admins can update certificate assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'certificates' AND public.is_admin());

CREATE POLICY "Admins can delete certificate assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'certificates' AND public.is_admin());

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_number TEXT;
  counter INTEGER := 0;
BEGIN
  LOOP
    new_number := 'AITD-CERT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.issued_certificates WHERE certificate_number = new_number);
    counter := counter + 1;
    IF counter > 100 THEN
      RAISE EXCEPTION 'Could not generate unique certificate number';
    END IF;
  END LOOP;
  RETURN new_number;
END;
$$;