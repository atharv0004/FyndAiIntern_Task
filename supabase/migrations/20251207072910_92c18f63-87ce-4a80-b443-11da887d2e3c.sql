-- Create table for storing reviews/feedback
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  star_rating INTEGER NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
  review_text TEXT NOT NULL,
  ai_response TEXT,
  ai_summary TEXT,
  ai_recommended_actions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (but allow public read/write for this use case)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert reviews (public user dashboard)
CREATE POLICY "Anyone can insert reviews"
ON public.reviews
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read reviews (for admin dashboard)
CREATE POLICY "Anyone can read reviews"
ON public.reviews
FOR SELECT
USING (true);

-- Allow updates (for AI processing)
CREATE POLICY "Anyone can update reviews"
ON public.reviews
FOR UPDATE
USING (true);

-- Enable realtime for live updates on admin dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();