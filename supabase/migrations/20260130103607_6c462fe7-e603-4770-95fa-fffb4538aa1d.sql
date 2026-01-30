-- Fix 1: Recreate youtube_connection_status view with security_invoker=on
-- This ensures the view respects RLS policies on the base youtube_oauth_tokens table

DROP VIEW IF EXISTS public.youtube_connection_status;

CREATE VIEW public.youtube_connection_status 
WITH (security_invoker = on)
AS 
SELECT 
    user_id,
    youtube_channel_id,
    channel_name,
    channel_thumbnail,
    scopes,
    CASE
        WHEN token_expires_at > now() THEN true
        ELSE false
    END AS is_token_valid,
    updated_at
FROM public.youtube_oauth_tokens;

-- Grant SELECT on the view to authenticated users (RLS on base table will enforce access)
GRANT SELECT ON public.youtube_connection_status TO authenticated;

-- Fix 2: Update youtube_oauth_tokens SELECT policy to prevent direct access to tokens
-- Users should only access token data through the secure youtube_connection_status view
-- which excludes access_token and refresh_token fields

-- Drop the existing SELECT policy that exposes raw tokens
DROP POLICY IF EXISTS "Users can view their own youtube tokens" ON public.youtube_oauth_tokens;

-- Create a new SELECT policy that DENIES direct table access
-- Force all reads to go through the secure view (which has security_invoker=on)
CREATE POLICY "No direct token access - use view" 
ON public.youtube_oauth_tokens 
FOR SELECT 
USING (false);

-- Create a policy for service role operations (edge functions need to read tokens)
-- Note: Service role bypasses RLS by default, but this documents the intent
COMMENT ON TABLE public.youtube_oauth_tokens IS 
'OAuth tokens table. Direct SELECT is denied to users - use youtube_connection_status view. 
Service role can access for edge function operations.';