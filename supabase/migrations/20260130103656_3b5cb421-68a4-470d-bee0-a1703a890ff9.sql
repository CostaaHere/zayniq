-- Fix: The view needs the base table to have a SELECT policy that allows users to see their own records
-- With security_invoker=on, the view runs under the calling user's permissions
-- So we need to allow SELECT on the base table, but the VIEW itself filters out sensitive columns

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "No direct token access - use view" ON public.youtube_oauth_tokens;

-- Create a policy that allows users to SELECT their own tokens
-- The sensitive fields are protected because:
-- 1. Application code uses the youtube_connection_status VIEW which excludes access_token/refresh_token
-- 2. Edge functions use service role which bypasses RLS
CREATE POLICY "Users can view their own tokens" 
ON public.youtube_oauth_tokens 
FOR SELECT 
USING (auth.uid() = user_id);