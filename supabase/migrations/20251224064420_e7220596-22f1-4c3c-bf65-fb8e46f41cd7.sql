-- Create table for storing AI keyword generations
CREATE TABLE public.ai_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  generation_type TEXT NOT NULL DEFAULT 'keywords',
  input_topic TEXT NOT NULL,
  input_niche TEXT,
  primary_keywords JSONB DEFAULT '[]'::jsonb,
  longtail_keywords JSONB DEFAULT '[]'::jsonb,
  question_keywords JSONB DEFAULT '[]'::jsonb,
  trending_topics JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own generations" 
ON public.ai_generations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generations" 
ON public.ai_generations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations" 
ON public.ai_generations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_ai_generations_user_id ON public.ai_generations(user_id);
CREATE INDEX idx_ai_generations_created_at ON public.ai_generations(created_at DESC);