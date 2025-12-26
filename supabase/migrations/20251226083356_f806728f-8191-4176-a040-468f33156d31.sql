-- Create saved_content_ideas table
CREATE TABLE public.saved_content_ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  viral_score INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'medium',
  content_type TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  thumbnail_concept TEXT,
  best_posting_time TEXT,
  niche TEXT,
  scheduled_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_content_ideas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own ideas"
ON public.saved_content_ideas
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ideas"
ON public.saved_content_ideas
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas"
ON public.saved_content_ideas
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas"
ON public.saved_content_ideas
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_saved_content_ideas_updated_at
BEFORE UPDATE ON public.saved_content_ideas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();