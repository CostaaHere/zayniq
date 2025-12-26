-- Make avatars bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'avatars';

-- Drop the old public access policy
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

-- Create new policy requiring authentication for viewing avatars
CREATE POLICY "Authenticated users can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);