-- Create table for storing competitors
CREATE TABLE public.competitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel_url TEXT NOT NULL,
  channel_id TEXT,
  channel_name TEXT NOT NULL,
  thumbnail_url TEXT,
  banner_url TEXT,
  subscriber_count BIGINT DEFAULT 0,
  video_count INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  upload_frequency TEXT,
  last_video_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own competitors" 
ON public.competitors 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own competitors" 
ON public.competitors 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competitors" 
ON public.competitors 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own competitors" 
ON public.competitors 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_competitors_user_id ON public.competitors(user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_competitors_updated_at
BEFORE UPDATE ON public.competitors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();