-- ============================================
-- FIX: Add authentication requirement to all tables
-- The existing RESTRICTIVE policies only work when combined with PERMISSIVE policies
-- We need to convert existing policies to PERMISSIVE policies that check auth.uid()
-- ============================================

-- 1. PROFILES TABLE - Convert to permissive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 2. CHANNELS TABLE - Convert to permissive policy  
DROP POLICY IF EXISTS "Users can view their own channels" ON public.channels;
CREATE POLICY "Users can view their own channels"
  ON public.channels FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. YOUTUBE_VIDEOS TABLE - Convert to permissive policy
DROP POLICY IF EXISTS "Users can view their own youtube videos" ON public.youtube_videos;
CREATE POLICY "Users can view their own youtube videos"
  ON public.youtube_videos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. SAVED_CONTENT_IDEAS TABLE - Convert to permissive policy
DROP POLICY IF EXISTS "Users can view their own ideas" ON public.saved_content_ideas;
CREATE POLICY "Users can view their own ideas"
  ON public.saved_content_ideas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. AI_GENERATIONS TABLE - Convert to permissive policy
DROP POLICY IF EXISTS "Users can view their own generations" ON public.ai_generations;
CREATE POLICY "Users can view their own generations"
  ON public.ai_generations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. COMPETITORS TABLE - Convert to permissive policy
DROP POLICY IF EXISTS "Users can view their own competitors" ON public.competitors;
CREATE POLICY "Users can view their own competitors"
  ON public.competitors FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. CHANNEL_DNA TABLE - Convert to permissive policy
DROP POLICY IF EXISTS "Users can view their own channel DNA" ON public.channel_dna;
CREATE POLICY "Users can view their own channel DNA"
  ON public.channel_dna FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 8. PERFORMANCE_PREDICTIONS TABLE - Convert to permissive policy
DROP POLICY IF EXISTS "Users can view their own predictions" ON public.performance_predictions;
CREATE POLICY "Users can view their own predictions"
  ON public.performance_predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 9. CHANNEL_BOTTLENECKS TABLE - Convert to permissive policy
DROP POLICY IF EXISTS "Users can view their own bottlenecks" ON public.channel_bottlenecks;
CREATE POLICY "Users can view their own bottlenecks"
  ON public.channel_bottlenecks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 10. STRATEGY_HISTORY TABLE - Convert to permissive policy
DROP POLICY IF EXISTS "Users can view their own strategy history" ON public.strategy_history;
CREATE POLICY "Users can view their own strategy history"
  ON public.strategy_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 11. YOUTUBE_CONNECTION_STATUS VIEW - Add RLS via security_invoker
-- First, drop and recreate the view with security_invoker=on
DROP VIEW IF EXISTS public.youtube_connection_status;
CREATE VIEW public.youtube_connection_status
WITH (security_invoker=on) AS
SELECT 
    t.user_id,
    t.youtube_channel_id,
    t.channel_name,
    t.channel_thumbnail,
    t.scopes,
    CASE WHEN t.token_expires_at > now() THEN true ELSE false END AS is_token_valid,
    t.updated_at
FROM public.youtube_oauth_tokens t
WHERE t.user_id = auth.uid();

-- The view now only shows the current user's data via the WHERE clause
-- and uses security_invoker to ensure RLS on underlying table is respected