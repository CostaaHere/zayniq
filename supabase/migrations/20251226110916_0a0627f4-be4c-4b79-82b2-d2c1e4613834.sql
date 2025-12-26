-- Create YouTube API cache table
CREATE TABLE public.youtube_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  response_data JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_youtube_cache_key ON public.youtube_cache(cache_key);
CREATE INDEX idx_youtube_cache_cached_at ON public.youtube_cache(cached_at);

-- Enable RLS
ALTER TABLE public.youtube_cache ENABLE ROW LEVEL SECURITY;

-- Allow the service role to manage cache (edge functions use service role)
CREATE POLICY "Service role can manage cache"
ON public.youtube_cache
FOR ALL
USING (true)
WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.youtube_cache IS 'Cache for YouTube API responses to reduce quota usage';