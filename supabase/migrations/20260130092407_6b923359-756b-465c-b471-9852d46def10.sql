-- Create table to store YouTube OAuth tokens separately from Supabase Auth
-- This allows users who signed up with email/password to connect YouTube without identity linking
CREATE TABLE public.youtube_oauth_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  youtube_channel_id TEXT,
  channel_name TEXT,
  channel_thumbnail TEXT,
  scopes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX idx_youtube_oauth_tokens_user_id ON public.youtube_oauth_tokens(user_id);
CREATE INDEX idx_youtube_oauth_tokens_channel_id ON public.youtube_oauth_tokens(youtube_channel_id);

-- Enable RLS
ALTER TABLE public.youtube_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only access their own tokens
CREATE POLICY "Users can view their own youtube tokens"
ON public.youtube_oauth_tokens
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own youtube tokens"
ON public.youtube_oauth_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own youtube tokens"
ON public.youtube_oauth_tokens
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own youtube tokens"
ON public.youtube_oauth_tokens
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_youtube_oauth_tokens_updated_at
BEFORE UPDATE ON public.youtube_oauth_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();