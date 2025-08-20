-- Create storage buckets for proposal media
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('proposal-logos', 'proposal-logos', true),
  ('proposal-images', 'proposal-images', true),
  ('proposal-videos', 'proposal-videos', true),
  ('proposal-attachments', 'proposal-attachments', false);

-- Create RLS policies for proposal logos (public read, authenticated users can upload their own)
CREATE POLICY "Proposal logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'proposal-logos');

CREATE POLICY "Users can upload their own proposal logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'proposal-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own proposal logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'proposal-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own proposal logos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'proposal-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for proposal images (public read, authenticated users can upload their own)
CREATE POLICY "Proposal images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'proposal-images');

CREATE POLICY "Users can upload their own proposal images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'proposal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own proposal images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'proposal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own proposal images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'proposal-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for proposal videos (public read, authenticated users can upload their own)
CREATE POLICY "Proposal videos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'proposal-videos');

CREATE POLICY "Users can upload their own proposal videos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'proposal-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own proposal videos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'proposal-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own proposal videos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'proposal-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create RLS policies for proposal attachments (private, only owner can access)
CREATE POLICY "Users can view their own proposal attachments" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'proposal-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own proposal attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'proposal-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own proposal attachments" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'proposal-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own proposal attachments" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'proposal-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);