-- Store YouTube channel + video analytics fetched via OAuth

-- 1) Table to store per-user connected YouTube channel (already exists: public.channels)
-- We'll keep using public.channels for the primary channel record.

-- 2) Table to store per-user YouTube videos (latest uploads + future analytics)
CREATE TABLE IF NOT EXISTS public.youtube_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel_row_id uuid NULL,
  youtube_video_id text NOT NULL,
  title text NOT NULL,
  description text NULL,
  thumbnail_url text NULL,
  published_at timestamptz NULL,
  view_count bigint NULL,
  like_count bigint NULL,
  comment_count bigint NULL,
  duration text NULL,
  tags jsonb NULL,
  category_id text NULL,
  raw jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT youtube_videos_user_video_unique UNIQUE (user_id, youtube_video_id),
  CONSTRAINT youtube_videos_user_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT youtube_videos_channel_row_fkey FOREIGN KEY (channel_row_id) REFERENCES public.channels(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_youtube_videos_user_id ON public.youtube_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_channel_row_id ON public.youtube_videos(channel_row_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_published_at ON public.youtube_videos(published_at DESC);

-- Enable Row Level Security
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only access their own video rows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'youtube_videos' AND policyname = 'Users can view their own youtube videos'
  ) THEN
    CREATE POLICY "Users can view their own youtube videos"
    ON public.youtube_videos
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'youtube_videos' AND policyname = 'Users can insert their own youtube videos'
  ) THEN
    CREATE POLICY "Users can insert their own youtube videos"
    ON public.youtube_videos
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'youtube_videos' AND policyname = 'Users can update their own youtube videos'
  ) THEN
    CREATE POLICY "Users can update their own youtube videos"
    ON public.youtube_videos
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'youtube_videos' AND policyname = 'Users can delete their own youtube videos'
  ) THEN
    CREATE POLICY "Users can delete their own youtube videos"
    ON public.youtube_videos
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- updated_at trigger
DROP TRIGGER IF EXISTS update_youtube_videos_updated_at ON public.youtube_videos;
CREATE TRIGGER update_youtube_videos_updated_at
BEFORE UPDATE ON public.youtube_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure channels table has RLS enabled (should be, but make idempotent)
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- Best-effort: ensure channels has basic per-user policies (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'channels' AND policyname = 'Users can view their own channels'
  ) THEN
    CREATE POLICY "Users can view their own channels"
    ON public.channels
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'channels' AND policyname = 'Users can insert their own channels'
  ) THEN
    CREATE POLICY "Users can insert their own channels"
    ON public.channels
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'channels' AND policyname = 'Users can update their own channels'
  ) THEN
    CREATE POLICY "Users can update their own channels"
    ON public.channels
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'channels' AND policyname = 'Users can delete their own channels'
  ) THEN
    CREATE POLICY "Users can delete their own channels"
    ON public.channels
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;