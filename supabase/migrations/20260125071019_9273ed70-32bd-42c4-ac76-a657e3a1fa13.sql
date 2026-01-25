-- Create strategy_history table to track all AI advice and recommendations
CREATE TABLE public.strategy_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL, -- 'coach', 'title', 'content_ideas', 'description', 'tags', 'keywords'
  request_context JSONB, -- The inputs/context used for the request
  strategy_applied TEXT NOT NULL, -- The strategic approach chosen (e.g., 'discovery', 'authority', 'retention')
  bottleneck_addressed TEXT, -- What bottleneck this was meant to address
  output_summary TEXT NOT NULL, -- Summary of what was generated/recommended
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'aggressive')),
  potential_upside TEXT, -- Expected benefit
  potential_downside TEXT, -- What could go wrong
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  self_critique JSONB, -- Internal quality check notes
  future_impact JSONB, -- How this affects next 3-5 videos
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create channel_bottlenecks table to track identified growth bottlenecks
CREATE TABLE public.channel_bottlenecks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bottleneck_type TEXT NOT NULL, -- 'weak_hooks', 'poor_ctr', 'low_retention', 'inconsistent_positioning', 'audience_mismatch', 'competitive_pressure'
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'major', 'minor')),
  evidence JSONB, -- Data supporting this identification
  recommended_actions JSONB, -- What to do about it
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'improving', 'resolved')),
  identified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_strategy_history_user ON public.strategy_history(user_id);
CREATE INDEX idx_strategy_history_feature ON public.strategy_history(feature_type);
CREATE INDEX idx_strategy_history_created ON public.strategy_history(created_at DESC);
CREATE INDEX idx_channel_bottlenecks_user ON public.channel_bottlenecks(user_id);
CREATE INDEX idx_channel_bottlenecks_status ON public.channel_bottlenecks(status);

-- Enable RLS
ALTER TABLE public.strategy_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_bottlenecks ENABLE ROW LEVEL SECURITY;

-- RLS policies for strategy_history
CREATE POLICY "Users can view their own strategy history"
  ON public.strategy_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own strategy history"
  ON public.strategy_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for channel_bottlenecks
CREATE POLICY "Users can view their own bottlenecks"
  ON public.channel_bottlenecks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bottlenecks"
  ON public.channel_bottlenecks FOR ALL
  USING (auth.uid() = user_id);

-- Function to update timestamp
CREATE TRIGGER update_channel_bottlenecks_timestamp
  BEFORE UPDATE ON public.channel_bottlenecks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();