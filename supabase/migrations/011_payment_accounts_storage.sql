-- =========================================================
-- PHASE 6.5 - PAYMENT ACCOUNT DEFAULTS AND QRIS STORAGE
-- =========================================================

CREATE OR REPLACE FUNCTION public.set_default_payment_account(
  p_account_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_owner_id UUID;
BEGIN
  v_owner_id := (SELECT auth.uid());

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.payment_accounts
    WHERE id = p_account_id
      AND owner_id = v_owner_id
      AND is_active = TRUE
  ) THEN
    RAISE EXCEPTION 'Active payment account not found';
  END IF;

  UPDATE public.payment_accounts
  SET is_default = FALSE
  WHERE owner_id = v_owner_id
    AND is_default = TRUE;

  UPDATE public.payment_accounts
  SET is_default = TRUE
  WHERE id = p_account_id
    AND owner_id = v_owner_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_default_payment_account(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.set_default_payment_account(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.set_default_payment_account(UUID) TO authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-qris', 'payment-qris', FALSE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Owner can read own QRIS images" ON storage.objects;
CREATE POLICY "Owner can read own QRIS images"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'payment-qris'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::TEXT)
);

DROP POLICY IF EXISTS "Owner can upload own QRIS images" ON storage.objects;
CREATE POLICY "Owner can upload own QRIS images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'payment-qris'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::TEXT)
);

DROP POLICY IF EXISTS "Owner can update own QRIS images" ON storage.objects;
CREATE POLICY "Owner can update own QRIS images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'payment-qris'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::TEXT)
)
WITH CHECK (
  bucket_id = 'payment-qris'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::TEXT)
);

DROP POLICY IF EXISTS "Owner can delete own QRIS images" ON storage.objects;
CREATE POLICY "Owner can delete own QRIS images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'payment-qris'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::TEXT)
);
