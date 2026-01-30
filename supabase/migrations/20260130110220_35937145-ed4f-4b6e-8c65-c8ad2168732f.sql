-- Add new psychological DNA profile columns to channel_dna table
ALTER TABLE public.channel_dna
ADD COLUMN IF NOT EXISTS core_archetype text,
ADD COLUMN IF NOT EXISTS emotional_gravity_score integer CHECK (emotional_gravity_score >= 0 AND emotional_gravity_score <= 100),
ADD COLUMN IF NOT EXISTS curiosity_dependency_level text,
ADD COLUMN IF NOT EXISTS risk_tolerance_level text,
ADD COLUMN IF NOT EXISTS audience_intelligence_level text,
ADD COLUMN IF NOT EXISTS format_sweet_spots jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS kill_zones jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS content_psychology jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS performance_signature jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS creator_fingerprint jsonb DEFAULT '{}'::jsonb;

-- Add comment for clarity
COMMENT ON COLUMN public.channel_dna.core_archetype IS 'Core channel personality archetype (1-2 words)';
COMMENT ON COLUMN public.channel_dna.emotional_gravity_score IS 'How emotionally heavy the content is (0-100)';
COMMENT ON COLUMN public.channel_dna.curiosity_dependency_level IS 'How much channel relies on curiosity hooks (low/medium/high)';
COMMENT ON COLUMN public.channel_dna.risk_tolerance_level IS 'How experimental the channel is with content (low/medium/high)';
COMMENT ON COLUMN public.channel_dna.audience_intelligence_level IS 'Target audience sophistication level';
COMMENT ON COLUMN public.channel_dna.format_sweet_spots IS 'Content formats that perform best';
COMMENT ON COLUMN public.channel_dna.kill_zones IS 'Content types/formats to avoid';
COMMENT ON COLUMN public.channel_dna.content_psychology IS 'Emotional/psychological analysis of content';
COMMENT ON COLUMN public.channel_dna.performance_signature IS 'What triggers success vs failure';
COMMENT ON COLUMN public.channel_dna.creator_fingerprint IS 'Unique creator style traits';