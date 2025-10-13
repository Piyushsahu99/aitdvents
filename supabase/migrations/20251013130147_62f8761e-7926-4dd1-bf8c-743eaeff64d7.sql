-- Fix function search path by recreating with CASCADE
DROP FUNCTION IF EXISTS public.update_updated_at_column_community() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column_community()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_community_links_updated_at
BEFORE UPDATE ON public.community_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column_community();

CREATE TRIGGER update_student_profiles_updated_at
BEFORE UPDATE ON public.student_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column_community();

CREATE TRIGGER update_student_groups_updated_at
BEFORE UPDATE ON public.student_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column_community();