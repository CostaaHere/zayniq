-- Create video_analyses table for storing AVOE analysis results
CREATE TABLE public.video_analyses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    youtube_video_id text NOT NULL,
    status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    format_type text CHECK (format_type IN ('short', 'long')),
    
    -- Scores
    overall_score integer,
    title_score integer,
    description_score integer,
    tags_score integer,
    hashtags_score integer,
    thumbnail_score integer,
    virality_score integer,
    confidence_score integer,
    
    -- Analysis data (JSONB for flexibility)
    title_breakdown jsonb DEFAULT '{}',
    description_breakdown jsonb DEFAULT '{}',
    tags_breakdown jsonb DEFAULT '{}',
    hashtags_breakdown jsonb DEFAULT '{}',
    thumbnail_breakdown jsonb DEFAULT '{}',
    virality_breakdown jsonb DEFAULT '{}',
    
    -- Packaging audit
    packaging_audit jsonb DEFAULT '{}',
    
    -- Graph optimization
    graph_optimization jsonb DEFAULT '{}',
    
    -- Retention engineering
    retention_engineering jsonb DEFAULT '{}',
    
    -- Competitive strategy (optional)
    competitive_strategy jsonb,
    
    -- Improvements
    improved_title text,
    improved_description text,
    improved_tags jsonb DEFAULT '[]',
    improved_hashtags jsonb DEFAULT '[]',
    
    -- Priority actions
    priority_actions jsonb DEFAULT '[]',
    
    -- Confidence factors and warnings
    confidence_factors jsonb DEFAULT '[]',
    data_warnings jsonb DEFAULT '[]',
    
    -- Error handling
    error_message text,
    model_version text,
    
    -- Timestamps
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX idx_video_analyses_user_id ON public.video_analyses(user_id);
CREATE INDEX idx_video_analyses_youtube_video_id ON public.video_analyses(youtube_video_id);
CREATE INDEX idx_video_analyses_user_video ON public.video_analyses(user_id, youtube_video_id);
CREATE INDEX idx_video_analyses_created_at ON public.video_analyses(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.video_analyses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own analyses"
ON public.video_analyses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
ON public.video_analyses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses"
ON public.video_analyses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
ON public.video_analyses
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_video_analyses_updated_at
BEFORE UPDATE ON public.video_analyses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();