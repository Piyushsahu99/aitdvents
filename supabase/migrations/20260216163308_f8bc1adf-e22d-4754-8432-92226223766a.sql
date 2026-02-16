-- Allow any authenticated user to insert their own blogs (as draft/published)
CREATE POLICY "Authenticated users can create blogs"
ON public.blogs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to update their own blogs (by author name match via auth email)
-- For simplicity, allow authenticated users to update blogs they authored
CREATE POLICY "Users can update their own blogs"
ON public.blogs
FOR UPDATE
TO authenticated
USING (author = (SELECT COALESCE(sp.full_name, au.email) FROM auth.users au LEFT JOIN public.student_profiles sp ON sp.user_id = au.id WHERE au.id = auth.uid()))
WITH CHECK (author = (SELECT COALESCE(sp.full_name, au.email) FROM auth.users au LEFT JOIN public.student_profiles sp ON sp.user_id = au.id WHERE au.id = auth.uid()));
