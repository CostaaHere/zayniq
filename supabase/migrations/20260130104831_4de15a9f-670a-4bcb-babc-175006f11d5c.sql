-- Fix: Deny direct SELECT access to youtube_oauth_tokens table
-- This forces all access through the secure youtube_connection_status view

-- Drop the permissive SELECT policy that exposes raw tokens
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.youtube_oauth_tokens;

-- Create a restrictive policy that denies all direct client access
-- Edge functions use service role which bypasses RLS, so they can still access tokens
CREATE POLICY "Deny direct SELECT - use youtube_connection_status view"
ON public.youtube_oauth_tokens
FOR SELECT
USING (false);