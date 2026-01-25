-- Performance Predictions table for storing simulation results
CREATE TABLE public.performance_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_type TEXT NOT NULL, -- 'title', 'content_idea', 'description', 'thumbnail', 'coach'
  content_reference TEXT NOT NULL, -- the title, topic, or content being predicted
  
  -- Layer 1: CTR & View Prediction
  predicted_ctr_range JSONB DEFAULT '{}', -- { min: 3.5, max: 5.2, baseline: 4.0 }
  ctr_confidence TEXT DEFAULT 'medium', -- low, medium, high
  ctr_factors JSONB DEFAULT '[]', -- factors affecting CTR prediction
  
  -- Layer 2: Retention & Session Impact
  predicted_retention_curve JSONB DEFAULT '{}', -- { "5s": 85, "10s": 72, "30s": 55, "60s": 40 }
  session_impact TEXT DEFAULT 'neutral', -- negative, neutral, positive, strong_positive
  dropoff_triggers JSONB DEFAULT '[]', -- potential drop-off points
  
  -- Layer 3: Algorithm Optimization
  promotion_likelihood TEXT DEFAULT 'medium', -- low, medium, high, experimental
  algorithm_factors JSONB DEFAULT '[]', -- factors for/against promotion
  feed_predictions JSONB DEFAULT '{}', -- { suggested: 'high', browse: 'medium', trending: 'low' }
  
  -- Layer 4: Trend & Competition
  trend_alignment TEXT DEFAULT 'neutral', -- declining, neutral, rising, viral_potential
  competition_saturation TEXT DEFAULT 'medium', -- low, medium, high, saturated
  competitive_gap_analysis JSONB DEFAULT '{}',
  
  -- Layer 5: What-If Simulations
  simulations JSONB DEFAULT '[]', -- array of simulation scenarios with outcomes
  optimal_path JSONB DEFAULT '{}', -- recommended optimal approach
  
  -- Overall Assessment
  overall_confidence TEXT DEFAULT 'medium', -- low, medium, high, experimental
  overall_confidence_score INTEGER DEFAULT 70,
  recommendation_summary TEXT,
  risk_factors JSONB DEFAULT '[]',
  success_indicators JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.performance_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own predictions" 
ON public.performance_predictions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own predictions" 
ON public.performance_predictions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_performance_predictions_user_feature 
ON public.performance_predictions(user_id, feature_type);

CREATE INDEX idx_performance_predictions_created 
ON public.performance_predictions(created_at DESC);

-- Add prediction fields to strategy_history for tracking prediction accuracy
ALTER TABLE public.strategy_history 
ADD COLUMN IF NOT EXISTS prediction_id UUID REFERENCES public.performance_predictions(id),
ADD COLUMN IF NOT EXISTS prediction_accuracy_score INTEGER; -- to track how accurate predictions were