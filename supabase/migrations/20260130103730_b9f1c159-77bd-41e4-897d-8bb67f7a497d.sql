-- PROPER FIX: Deny direct SELECT on youtube_oauth_tokens base table
-- The youtube_connection_status view will use a security definer function to access data

-- Step 1: Drop the view temporarily
DROP VIEW IF EXISTS public.youtube_connection_status;

-- Step 2: Drop the SELECT policy that exposes raw tokens
DROP POLICY IF EXISTS "Users can view their own tokens" ON public.youtube_oauth_tokens;

-- Step 3: Create a restrictive SELECT policy - deny all direct access
CREATE POLICY "Deny direct SELECT access to tokens" 
ON public.youtube_oauth_tokens 
FOR SELECT 
USING (false);

-- Step 4: Create a security definer function to get connection status
-- This function runs with elevated privileges and returns only safe fields
CREATE OR REPLACE FUNCTION public.get_youtube_connection_status(p_user_id uuid)
RETURNS TABLE (
    user_id uuid,
    youtube_channel_id text,
    channel_name text,
    channel_thumbnail text,
    scopes text[],
    is_token_valid boolean,
    updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        t.user_id,
        t.youtube_channel_id,
        t.channel_name,
        t.channel_thumbnail,
        t.scopes,
        CASE WHEN t.token_expires_at > now() THEN true ELSE false END AS is_token_valid,
        t.updated_at
    FROM public.youtube_oauth_tokens t
    WHERE t.user_id = p_user_id;
$$;

-- Step 5: Recreate the view using the security definer function
-- This view calls the function which only returns safe fields
CREATE VIEW public.youtube_connection_status AS
SELECT * FROM public.get_youtube_connection_status(auth.uid());

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.youtube_connection_status TO authenticated;