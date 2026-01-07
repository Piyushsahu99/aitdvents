-- Create chat rooms table
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat rooms policies
CREATE POLICY "Anyone can view public chat rooms"
ON public.chat_rooms FOR SELECT
USING (is_public = true);

CREATE POLICY "Authenticated users can create chat rooms"
ON public.chat_rooms FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Chat messages policies
CREATE POLICY "Anyone can view messages in public rooms"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms 
    WHERE id = chat_messages.room_id AND is_public = true
  )
);

CREATE POLICY "Authenticated users can send messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Add replica identity for realtime updates
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

-- Create default global chat room
INSERT INTO public.chat_rooms (name, description, is_public)
VALUES ('Global Chat', 'Connect with all AITD students', true);