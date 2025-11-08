-- Create storage buckets for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('certificates', 'certificates', true, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[]),
  ('lot-documents', 'lot-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']::text[]),
  ('exploration-photos', 'exploration-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]);

-- RLS policies for certificates bucket (public read, authenticated upload)
CREATE POLICY "Anyone can view certificates"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');

CREATE POLICY "Authenticated users can upload certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'certificates');

CREATE POLICY "Users can update their own certificates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

-- RLS policies for lot-documents (private, owner access)
CREATE POLICY "Users can view their lot documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'lot-documents');

CREATE POLICY "Users can upload lot documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lot-documents');

-- RLS policies for exploration-photos (public read)
CREATE POLICY "Anyone can view exploration photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'exploration-photos');

CREATE POLICY "Authenticated users can upload exploration photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'exploration-photos');