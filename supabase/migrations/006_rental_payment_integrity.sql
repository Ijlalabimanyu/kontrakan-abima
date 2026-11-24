
-- =========================================
-- PHASE 4.2: RENTAL INVOICE PAYMENTS
-- =========================================

-- 1. Composite unique index for invoice ownership
CREATE UNIQUE INDEX IF NOT EXISTS
  rental_invoices_id_owner_unique_idx
ON public.rental_invoices(id, owner_id);


-- 2. Create payment table
CREATE TABLE IF NOT EXISTS public.rental_invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id UUID NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,

  invoice_id UUID NOT NULL,

  payment_number TEXT NOT NULL,

  amount NUMERIC(15, 2) NOT NULL
    CHECK (amount > 0),

  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,

  payment_method VARCHAR(20) NOT NULL
    CHECK (
      payment_method IN (
        'CASH',
        'TRANSFER',
        'QRIS'
      )
    ),

  reference_number TEXT,

  proof_path TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT payment_invoice_owner_fk
    FOREIGN KEY (invoice_id, owner_id)
    REFERENCES public.rental_invoices(id, owner_id),

  CONSTRAINT payment_unique_number_per_owner
    UNIQUE (owner_id, payment_number)
);


-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_payments_owner
ON public.rental_invoice_payments(owner_id);

CREATE INDEX IF NOT EXISTS idx_payments_invoice
ON public.rental_invoice_payments(invoice_id);

CREATE INDEX IF NOT EXISTS idx_payments_date
ON public.rental_invoice_payments(owner_id, payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_payments_method
ON public.rental_invoice_payments(owner_id, payment_method);


-- 4. Enable RLS
ALTER TABLE public.rental_invoice_payments
ENABLE ROW LEVEL SECURITY;


-- 5. Owner can only view their payments
CREATE POLICY "Owners can view their own payments"
ON public.rental_invoice_payments
FOR SELECT
USING (auth.uid() = owner_id);


-- =========================================
-- 6. Atomic payment RPC
-- =========================================

CREATE OR REPLACE FUNCTION public.create_invoice_payment(
  p_invoice_id UUID,
  p_amount NUMERIC,
  p_payment_date DATE,
  p_payment_method TEXT,
  p_reference_number TEXT DEFAULT NULL,
  p_proof_path TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner_id UUID;
  v_invoice_amount NUMERIC;
  v_invoice_status VARCHAR;
  v_paid_amount NUMERIC;
  v_remaining_amount NUMERIC;
  v_new_status VARCHAR;
  v_payment_id UUID;
  v_payment_number TEXT;
BEGIN

  -- 1. Verify authentication
  v_owner_id := auth.uid();

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- 2. Validate amount
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be greater than zero';
  END IF;

  -- 3. Validate payment method
  IF p_payment_method NOT IN ('CASH', 'TRANSFER', 'QRIS') THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  -- 4. Lock invoice to prevent concurrent overpayment
  SELECT amount, status
  INTO v_invoice_amount, v_invoice_status
  FROM public.rental_invoices
  WHERE id = p_invoice_id
    AND owner_id = v_owner_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice not found';
  END IF;

  -- 5. Validate invoice status
  IF v_invoice_status NOT IN ('UNPAID', 'PARTIAL') THEN
    RAISE EXCEPTION 'Invoice cannot receive payments';
  END IF;

  -- 6. Calculate existing payments
  SELECT COALESCE(SUM(amount), 0)
  INTO v_paid_amount
  FROM public.rental_invoice_payments
  WHERE invoice_id = p_invoice_id
    AND owner_id = v_owner_id;

  v_remaining_amount := v_invoice_amount - v_paid_amount;

  -- 7. Prevent overpayment
  IF p_amount > v_remaining_amount THEN
    RAISE EXCEPTION 'Payment exceeds remaining invoice amount';
  END IF;

  -- 8. Generate payment number
  v_payment_id := gen_random_uuid();

  v_payment_number :=
    'PAY-' ||
    TO_CHAR(COALESCE(p_payment_date, CURRENT_DATE), 'YYYYMMDD') ||
    '-' ||
    UPPER(LEFT(v_payment_id::TEXT, 8));

  -- 9. Insert payment
  INSERT INTO public.rental_invoice_payments (
    id,
    owner_id,
    invoice_id,
    payment_number,
    amount,
    payment_date,
    payment_method,
    reference_number,
    proof_path,
    notes
  )
  VALUES (
    v_payment_id,
    v_owner_id,
    p_invoice_id,
    v_payment_number,
    p_amount,
    COALESCE(p_payment_date, CURRENT_DATE),
    p_payment_method,
    p_reference_number,
    p_proof_path,
    p_notes
  );

  -- 10. Calculate new invoice status
  IF v_paid_amount + p_amount >= v_invoice_amount THEN
    v_new_status := 'PAID';
  ELSE
    v_new_status := 'PARTIAL';
  END IF;

  -- 11. Update invoice status
  UPDATE public.rental_invoices
  SET
    status = v_new_status,
    updated_at = NOW()
  WHERE id = p_invoice_id
    AND owner_id = v_owner_id;

  -- 12. Return result
  RETURN jsonb_build_object(
    'success', TRUE,
    'payment_id', v_payment_id,
    'payment_number', v_payment_number,
    'invoice_status', v_new_status,
    'paid_amount', v_paid_amount + p_amount,
    'remaining_amount', v_remaining_amount - p_amount
  );

END;
$$;


-- 7. Restrict RPC access
REVOKE ALL ON FUNCTION public.create_invoice_payment(
  UUID, NUMERIC, DATE, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_invoice_payment(
  UUID, NUMERIC, DATE, TEXT, TEXT, TEXT, TEXT
) TO authenticated;
