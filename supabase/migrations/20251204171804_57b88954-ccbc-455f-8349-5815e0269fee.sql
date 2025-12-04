-- Create product categories enum
CREATE TYPE public.product_category AS ENUM ('electronics', 'books', 'stationery', 'tasks', 'other');

-- Create product condition enum  
CREATE TYPE public.product_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'old');

-- Create product status enum
CREATE TYPE public.product_status AS ENUM ('pending', 'approved', 'rejected', 'sold', 'archived');

-- Create marketplace products table
CREATE TABLE public.marketplace_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  category product_category NOT NULL DEFAULT 'other',
  subcategory TEXT, -- For tasks: assignment, project, notes, etc.
  condition product_condition NOT NULL DEFAULT 'new',
  status product_status NOT NULL DEFAULT 'pending',
  images TEXT[] DEFAULT '{}',
  location TEXT,
  contact_info TEXT,
  is_admin_product BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view approved products"
ON public.marketplace_products
FOR SELECT
USING (status = 'approved' OR seller_id = auth.uid() OR is_admin());

CREATE POLICY "Authenticated users can create products"
ON public.marketplace_products
FOR INSERT
WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own products"
ON public.marketplace_products
FOR UPDATE
USING (seller_id = auth.uid() OR is_admin());

CREATE POLICY "Users can delete their own products"
ON public.marketplace_products
FOR DELETE
USING (seller_id = auth.uid() OR is_admin());

-- Create product inquiries table
CREATE TABLE public.product_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.marketplace_products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  message TEXT NOT NULL,
  seller_response TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.product_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inquiries
CREATE POLICY "Users can view their own inquiries"
ON public.product_inquiries
FOR SELECT
USING (buyer_id = auth.uid() OR EXISTS (
  SELECT 1 FROM marketplace_products WHERE id = product_id AND seller_id = auth.uid()
) OR is_admin());

CREATE POLICY "Authenticated users can create inquiries"
ON public.product_inquiries
FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can respond to inquiries"
ON public.product_inquiries
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM marketplace_products WHERE id = product_id AND seller_id = auth.uid()
) OR is_admin());

-- Create user points table for leaderboard
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  referrals_count INTEGER DEFAULT 0,
  bounties_completed INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for points
CREATE POLICY "Anyone can view points"
ON public.user_points
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own points"
ON public.user_points
FOR UPDATE
USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can insert their own points"
ON public.user_points
FOR INSERT
WITH CHECK (user_id = auth.uid() OR is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_marketplace_products_updated_at
BEFORE UPDATE ON public.marketplace_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at
BEFORE UPDATE ON public.user_points
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();