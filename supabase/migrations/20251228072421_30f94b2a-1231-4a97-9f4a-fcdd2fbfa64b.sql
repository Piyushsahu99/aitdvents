-- Add column to track user-submitted events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS submitted_by_user boolean DEFAULT false;

-- Drop existing insert policy
DROP POLICY IF EXISTS "Only admins can insert events" ON public.events;

-- Create new policy allowing authenticated users to insert events as draft
CREATE POLICY "Authenticated users can submit events"
ON public.events
FOR INSERT
TO authenticated
WITH CHECK (
  status = 'draft'::event_status 
  AND created_by = auth.uid()
);

-- Update select policy to include user's own draft events
DROP POLICY IF EXISTS "Anyone can view live events" ON public.events;

CREATE POLICY "Users can view live events or their own"
ON public.events
FOR SELECT
USING (
  status = 'live'::event_status 
  OR created_by = auth.uid() 
  OR is_admin()
);