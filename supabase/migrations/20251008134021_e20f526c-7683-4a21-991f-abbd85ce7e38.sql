-- Create hackathons table
CREATE TABLE public.hackathons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  organizer TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('online', 'offline', 'hybrid')),
  category TEXT NOT NULL,
  prize_pool TEXT NOT NULL,
  max_team_size INTEGER NOT NULL DEFAULT 4,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  themes JSONB,
  banner_url TEXT,
  external_link TEXT,
  total_participants INTEGER DEFAULT 0,
  status event_status NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view live hackathons" 
ON public.hackathons 
FOR SELECT 
USING (status = 'live' OR is_admin());

CREATE POLICY "Only admins can manage hackathons" 
ON public.hackathons 
FOR ALL 
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_hackathons_updated_at
BEFORE UPDATE ON public.hackathons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample hackathons
INSERT INTO public.hackathons (title, organizer, description, start_date, end_date, registration_deadline, location, mode, category, prize_pool, difficulty, themes, status) VALUES
('AI Innovation Challenge 2025', 'Tech Giants Inc', 'Build the next generation of AI applications that solve real-world problems. Teams will compete across multiple tracks including healthcare, education, and sustainability.', '2025-04-15 10:00:00+00', '2025-04-17 18:00:00+00', '2025-04-10 23:59:00+00', 'Bangalore, India', 'hybrid', 'Artificial Intelligence', '₹10,00,000', 'advanced', '["Machine Learning", "Deep Learning", "NLP", "Computer Vision"]'::jsonb, 'live'),
('Web3 Builders Hackathon', 'Blockchain Foundation', 'Create decentralized applications that revolutionize finance, gaming, and social media. Learn from industry experts and win amazing prizes.', '2025-03-20 09:00:00+00', '2025-03-22 20:00:00+00', '2025-03-15 23:59:00+00', 'Online', 'online', 'Blockchain', '₹5,00,000', 'intermediate', '["DeFi", "NFTs", "DAOs", "Smart Contracts"]'::jsonb, 'live'),
('Mobile App Challenge', 'App Developers Guild', 'Design and develop innovative mobile applications for Android and iOS. Focus on user experience, performance, and creativity.', '2025-05-01 08:00:00+00', '2025-05-03 22:00:00+00', '2025-04-25 23:59:00+00', 'Mumbai, India', 'offline', 'Mobile Development', '₹3,00,000', 'beginner', '["Android", "iOS", "Flutter", "React Native"]'::jsonb, 'live'),
('Cybersecurity CTF', 'Security First', 'Test your hacking skills in this Capture The Flag competition. Solve challenges in cryptography, web security, reverse engineering, and more.', '2025-03-28 10:00:00+00', '2025-03-30 18:00:00+00', '2025-03-22 23:59:00+00', 'Online', 'online', 'Cybersecurity', '₹2,50,000', 'advanced', '["Web Security", "Cryptography", "Forensics", "Reverse Engineering"]'::jsonb, 'live');