
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS home_position integer DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events (is_featured, home_position);
