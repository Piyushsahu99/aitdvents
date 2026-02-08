-- Add apply_link column to jobs table for external application URLs
ALTER TABLE public.jobs 
ADD COLUMN apply_link text;

COMMENT ON COLUMN public.jobs.apply_link IS 'External URL where users can apply for the job';