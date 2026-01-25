-- Strengthen chat_messages RLS policy to require authentication for viewing messages
-- This prevents unauthenticated access even to public rooms

-- Drop the existing policy
DROP POLICY IF EXISTS "Anyone can view messages in public rooms" ON public.chat_messages;

-- Create new policy that requires authentication to view messages in public rooms
CREATE POLICY "Authenticated users can view messages in public rooms"
ON public.chat_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE id = chat_messages.room_id AND is_public = true
  )
  OR 
  -- Users can always view their own messages
  auth.uid() = user_id
);

-- Add admin access to all messages
CREATE POLICY "Admins can view all chat messages"
ON public.chat_messages FOR SELECT
TO authenticated
USING (is_admin());