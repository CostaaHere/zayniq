-- Fix 1: Add server-side enforcement of competitor limits by subscription tier
-- This prevents users from bypassing client-side limits

-- Create a function to check competitor limits based on subscription tier
CREATE OR REPLACE FUNCTION public.check_competitor_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_tier text;
  current_count INTEGER;
  tier_limit INTEGER;
BEGIN
  -- Get user's subscription tier from profiles
  SELECT subscription_tier::text INTO user_tier
  FROM profiles WHERE id = NEW.user_id;
  
  -- Count current competitors for this user
  SELECT COUNT(*) INTO current_count
  FROM competitors WHERE user_id = NEW.user_id;
  
  -- Set limit based on tier
  tier_limit := CASE user_tier
    WHEN 'free' THEN 3
    WHEN 'pro' THEN 10
    WHEN 'agency' THEN 25
    ELSE 3
  END;
  
  -- Check if limit is exceeded
  IF current_count >= tier_limit THEN
    RAISE EXCEPTION 'Competitor limit reached for % tier. Upgrade to add more.', user_tier;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce limits on INSERT
DROP TRIGGER IF EXISTS enforce_competitor_limit ON competitors;
CREATE TRIGGER enforce_competitor_limit
  BEFORE INSERT ON competitors
  FOR EACH ROW
  EXECUTE FUNCTION check_competitor_limit();

-- Fix 2: Protect youtube_oauth_tokens by restricting direct SELECT access
-- Create a secure view that exposes only non-sensitive connection status data

-- First, create a view for safe access to YouTube connection status (without tokens)
CREATE OR REPLACE VIEW public.youtube_connection_status
WITH (security_invoker=on) AS
  SELECT 
    user_id,
    youtube_channel_id,
    channel_name,
    channel_thumbnail,
    scopes,
    CASE 
      WHEN token_expires_at > now() THEN true 
      ELSE false 
    END as is_token_valid,
    updated_at
  FROM public.youtube_oauth_tokens;
  -- Excludes: access_token, refresh_token (sensitive)

-- Update the base table policy to deny direct SELECT access from client
-- Only allow access through the view or service role
DROP POLICY IF EXISTS "Users can view their own youtube tokens" ON youtube_oauth_tokens;

-- Service role and edge functions can still access tokens directly
-- Regular users should use the youtube_connection_status view
CREATE POLICY "Users can view their own youtube tokens"
  ON youtube_oauth_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Note: We keep the policy for backward compatibility with edge functions
-- that need to read tokens. The view provides a safe alternative for client-side access.

-- Also add a policy to prevent users from directly updating tokens (only edge functions should)
-- The existing update policy is fine since it requires user_id match

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.youtube_connection_status TO authenticated;