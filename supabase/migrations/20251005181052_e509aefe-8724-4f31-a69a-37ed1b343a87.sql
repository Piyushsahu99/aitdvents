-- Create bounties table
CREATE TABLE public.bounties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    prize_amount TEXT NOT NULL,
    prize_currency TEXT DEFAULT 'INR',
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    max_submissions INTEGER DEFAULT 1,
    status event_status NOT NULL DEFAULT 'draft',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    banner_url TEXT,
    rules TEXT,
    judging_criteria TEXT,
    tags TEXT[],
    total_participants INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view live bounties"
ON public.bounties FOR SELECT
USING (status = 'live' OR public.is_admin());

CREATE POLICY "Only admins can manage bounties"
ON public.bounties FOR ALL
TO authenticated
USING (public.is_admin());

-- Create bounty submissions table
CREATE TABLE public.bounty_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bounty_id UUID REFERENCES public.bounties(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    submission_url TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    feedback TEXT,
    score INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    UNIQUE (bounty_id, user_id)
);

-- Enable RLS
ALTER TABLE public.bounty_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for submissions
CREATE POLICY "Users can view their own submissions"
ON public.bounty_submissions FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can create submissions"
ON public.bounty_submissions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their pending submissions"
ON public.bounty_submissions FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Admins can manage all submissions"
ON public.bounty_submissions FOR ALL
TO authenticated
USING (public.is_admin());

-- Create payments table for tracking bounty payouts
CREATE TABLE public.bounty_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES public.bounty_submissions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    transaction_id TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bounty_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies for payments
CREATE POLICY "Users can view their own payments"
ON public.bounty_payments FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Only admins can manage payments"
ON public.bounty_payments FOR ALL
TO authenticated
USING (public.is_admin());

-- Add trigger for bounties updated_at
CREATE TRIGGER update_bounties_updated_at
    BEFORE UPDATE ON public.bounties
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();