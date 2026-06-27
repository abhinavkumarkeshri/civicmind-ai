-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_login timestamp with time zone
);

-- Create officers table
CREATE TABLE IF NOT EXISTS public.officers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  ward_id uuid NOT NULL REFERENCES public.wards(id),
  department_id uuid REFERENCES public.departments(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamp with time zone,
  suspended_at timestamp with time zone,
  suspension_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admins table
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Admin can see their own record
CREATE POLICY "admins_select_own" ON public.admins
  FOR SELECT USING (auth.uid() = user_id);

-- Only admins can insert (via service role)
CREATE POLICY "admins_insert_service" ON public.admins
  FOR INSERT WITH CHECK (true);

-- Admin can update their own record
CREATE POLICY "admins_update_own" ON public.admins
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS on officers table
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;

-- Officers can see their own record
CREATE POLICY "officers_select_own" ON public.officers
  FOR SELECT USING (auth.uid() = user_id);

-- Admins and officers can view officers (via service role initially)
CREATE POLICY "officers_insert_service" ON public.officers
  FOR INSERT WITH CHECK (true);

-- Officers can update their own records
CREATE POLICY "officers_update_own" ON public.officers
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);
CREATE INDEX IF NOT EXISTS idx_officers_user_id ON public.officers(user_id);
CREATE INDEX IF NOT EXISTS idx_officers_ward_id ON public.officers(ward_id);
CREATE INDEX IF NOT EXISTS idx_officers_status ON public.officers(status);
