-- Create a security definer function for public certificate verification
-- This returns only safe fields (no email, no linkedin_credential_id, no metadata)
CREATE OR REPLACE FUNCTION public.verify_certificate(cert_number text)
RETURNS TABLE (
  certificate_number text,
  recipient_name text,
  issue_date timestamp with time zone,
  valid_until timestamp with time zone,
  is_valid boolean,
  verification_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ic.certificate_number,
    ic.recipient_name,
    ic.issue_date,
    ic.valid_until,
    ic.is_valid,
    ic.verification_url
  FROM public.issued_certificates ic
  WHERE ic.certificate_number = cert_number;
END;
$$;

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Anyone can verify certificates by number" ON public.issued_certificates;

-- The remaining policies allow:
-- 1. Admins can manage all certificates
-- 2. Users can view their own certificates (by user_id or email match)
-- 3. Authenticated users can request certificates
-- Public verification should now use the verify_certificate function