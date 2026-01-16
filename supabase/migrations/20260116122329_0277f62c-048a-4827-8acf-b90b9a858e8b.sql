-- Create the channel_dna table to store analyzed channel patterns
CREATE TABLE public.channel_dna (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  
  -- Analysis metadata
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  videos_analyzed INTEGER NOT NULL DEFAULT 0,
  
  -- Content patterns
  content_categories JSONB DEFAULT '[]'::jsonb,
  top_performing_topics JSONB DEFAULT '[]'::jsonb,
  
  -- Title patterns
  title_patterns JSONB DEFAULT '{}'::jsonb,
  avg_title_length INTEGER,
  title_formulas JSONB DEFAULT '[]'::jsonb,
  power_words JSONB DEFAULT '[]'::jsonb,
  
  -- Communication style
  tone_profile JSONB DEFAULT '{}'::jsonb,
  vocabulary_style TEXT,
  emoji_usage TEXT DEFAULT 'minimal',
  
  -- Audience signals
  audience_demographics JSONB DEFAULT '{}'::jsonb,
  peak_engagement_times JSONB DEFAULT '[]'::jsonb,
  avg_engagement_rate NUMERIC(5,2),
  
  -- Performance benchmarks
  avg_views BIGINT,
  avg_likes BIGINT,
  avg_comments BIGINT,
  view_to_like_ratio NUMERIC(5,2),
  
  -- Summary for AI prompts (condensed DNA)
  dna_summary TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Each user has one DNA per channel
  UNIQUE(user_id, channel_id)
);

-- Enable Row Level Security
ALTER TABLE public.channel_dna ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own channel DNA" 
ON public.channel_dna 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own channel DNA" 
ON public.channel_dna 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own channel DNA" 
ON public.channel_dna 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own channel DNA" 
ON public.channel_dna 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_channel_dna_updated_at
BEFORE UPDATE ON public.channel_dna
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();