-- Create analysis_runs table for tracking separate analysis runs (never overwrite)
CREATE TABLE public.analysis_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  youtube_video_id text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  format_type text CHECK (format_type IN ('short', 'long')),
  
  -- Timestamps
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  
  -- Input Snapshot (exact inputs used for this run)
  input_snapshot jsonb DEFAULT '{}'::jsonb,
  input_hash text, -- Hash of inputs to detect changes
  
  -- Scores
  overall_score integer,
  seo_score integer,
  hook_score integer,
  retention_score integer,
  confidence_score integer,
  
  -- Evidence-based output
  output jsonb DEFAULT '{}'::jsonb,
  evidence jsonb DEFAULT '{}'::jsonb, -- Quotes/excerpts & stats used
  
  -- Breakdowns (same as video_analyses for compatibility)
  title_breakdown jsonb DEFAULT '{}'::jsonb,
  description_breakdown jsonb DEFAULT '{}'::jsonb,
  tags_breakdown jsonb DEFAULT '{}'::jsonb,
  hashtags_breakdown jsonb DEFAULT '{}'::jsonb,
  thumbnail_breakdown jsonb DEFAULT '{}'::jsonb,
  virality_breakdown jsonb DEFAULT '{}'::jsonb,
  
  -- Improvements
  improved_title text,
  improved_description text,
  improved_tags jsonb DEFAULT '[]'::jsonb,
  improved_hashtags jsonb DEFAULT '[]'::jsonb,
  
  -- Analysis details
  packaging_audit jsonb DEFAULT '{}'::jsonb,
  graph_optimization jsonb DEFAULT '{}'::jsonb,
  retention_engineering jsonb DEFAULT '{}'::jsonb,
  competitive_strategy jsonb,
  priority_actions jsonb DEFAULT '[]'::jsonb,
  confidence_factors jsonb DEFAULT '[]'::jsonb,
  data_warnings jsonb DEFAULT '[]'::jsonb,
  
  -- Error handling
  error_message text,
  model_version text,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX idx_analysis_runs_user_video ON public.analysis_runs(user_id, youtube_video_id);
CREATE INDEX idx_analysis_runs_user_video_started ON public.analysis_runs(user_id, youtube_video_id, started_at DESC);
CREATE INDEX idx_analysis_runs_status ON public.analysis_runs(status);

-- Enable RLS
ALTER TABLE public.analysis_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own runs
CREATE POLICY "Users can view their own analysis runs"
  ON public.analysis_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis runs"
  ON public.analysis_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis runs"
  ON public.analysis_runs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis runs"
  ON public.analysis_runs FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_analysis_runs_updated_at
  BEFORE UPDATE ON public.analysis_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();