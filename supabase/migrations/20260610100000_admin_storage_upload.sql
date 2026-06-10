-- Allow admins to upload, update, and delete images in the product-images bucket
-- Public read is already allowed because the bucket is public.

CREATE POLICY "admins can upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND public.is_admin_safe()
);

CREATE POLICY "admins can update product images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin_safe())
WITH CHECK (bucket_id = 'product-images' AND public.is_admin_safe());

CREATE POLICY "admins can delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND public.is_admin_safe());
