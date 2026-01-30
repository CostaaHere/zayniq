-- Fix the linter warning by using security_invoker=on on the view
-- The view calls auth.uid() which will work correctly with security_invoker=on

DROP VIEW IF EXISTS public.youtube_connection_status;

-- Recreate view with security_invoker=on
-- The function is security definer but the view should be security invoker
-- This ensures the view respects the caller's context when calling auth.uid()
CREATE VIEW public.youtube_connection_status 
WITH (security_invoker = on)
AS
SELECT * FROM public.get_youtube_connection_status(auth.uid());

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.youtube_connection_status TO authenticated;