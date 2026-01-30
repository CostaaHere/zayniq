-- Add DELETE and UPDATE policies to performance_predictions table
-- This allows users to manage their own prediction data

-- Add DELETE policy
CREATE POLICY "Users can delete their own predictions"
  ON public.performance_predictions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add UPDATE policy
CREATE POLICY "Users can update their own predictions"
  ON public.performance_predictions
  FOR UPDATE
  USING (auth.uid() = user_id);