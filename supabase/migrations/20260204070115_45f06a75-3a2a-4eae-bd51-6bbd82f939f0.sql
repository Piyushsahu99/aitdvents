-- Allow authenticated users to create spin wheels
CREATE POLICY "Authenticated users can create spin wheels"
ON public.spin_wheels
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to create lucky draws
CREATE POLICY "Authenticated users can create lucky draws"
ON public.lucky_draws
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Allow authenticated users to create auctions
CREATE POLICY "Authenticated users can create auctions"
ON public.ipl_auctions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);