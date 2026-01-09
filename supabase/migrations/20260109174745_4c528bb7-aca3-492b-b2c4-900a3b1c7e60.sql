-- Add college field to events table for On Campus / Beyond Campus filtering
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS college TEXT;

-- Add index for faster college-based queries
CREATE INDEX IF NOT EXISTS idx_events_college ON public.events(college);

-- Comment explaining the usage
COMMENT ON COLUMN public.events.college IS 'College name for On Campus events. NULL means event is for everyone (Beyond Campus).';