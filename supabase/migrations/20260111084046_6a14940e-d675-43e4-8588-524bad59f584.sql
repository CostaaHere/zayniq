-- Fix the overly permissive RLS policy on youtube_cache table
-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Service role can manage cache" ON public.youtube_cache;

-- The youtube_cache table is used by edge functions with service role
-- We don't need user-facing RLS - edge functions bypass RLS with service role key
-- But we should still restrict direct client access
-- Option: Make this table only accessible via service role (no client access)

-- Create restrictive policies that only allow authenticated users to read cache (if needed)
-- For now, we'll keep it locked down since edge functions use service role

CREATE POLICY "No public access to youtube_cache" 
ON public.youtube_cache
FOR ALL
USING (false)
WITH CHECK (false);