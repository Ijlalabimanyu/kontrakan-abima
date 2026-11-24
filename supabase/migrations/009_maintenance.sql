
-- =========================================================
-- PHASE 5.1 - MAINTENANCE MANAGEMENT
-- =========================================================

-- 1. Pastikan relasi composite tersedia untuk validasi owner.
CREATE UNIQUE INDEX IF NOT EXISTS rooms_id_owner_uidx
  ON public.rooms (id, owner_id);

CREATE UNIQUE INDEX IF NOT EXISTS properties_id_owner_uidx
  ON public.properties (id, owner_id);

CREATE UNIQUE INDEX IF NOT EXISTS expenses_id_owner_uidx
  ON public.expenses (id, owner_id);

-- 2. Tabel maintenance.
CREATE TABLE IF NOT EXISTS public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  property_id UUID NULL,
  room_id UUID NULL,

  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,

  category VARCHAR(30) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',

  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_date DATE NULL,
  completed_at TIMESTAMPTZ NULL,

  completion_notes TEXT NULL,

  -- Informasi biaya maintenance.
  cost_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  cost_description TEXT NULL,
  expense_date DATE NULL,
  payment_method VARCHAR(20) NULL,
  reference_number VARCHAR(100) NULL,

  -- Relasi ke expenses jika biaya sudah dicatat.
  expense_id UUID NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT maintenance_property_owner_fk
    FOREIGN KEY (property_id, owner_id)
    REFERENCES public.properties (id, owner_id),

  CONSTRAINT maintenance_room_owner_fk
    FOREIGN KEY (room_id, owner_id)
    REFERENCES public.rooms (id, owner_id),

  CONSTRAINT maintenance_expense_owner_fk
    FOREIGN KEY (expense_id, owner_id)
    REFERENCES public.expenses (id, owner_id),

  CONSTRAINT maintenance_category_check
    CHECK (
      category IN (
        'ELECTRICAL',
        'PLUMBING',
        'AC',
        'FURNITURE',
        'BUILDING',
        'INTERNET',
        'OTHER'
      )
    ),

  CONSTRAINT maintenance_priority_check
    CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),

  CONSTRAINT maintenance_status_check
    CHECK (
      status IN (
        'OPEN',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED'
      )
    ),

  CONSTRAINT maintenance_cost_check
    CHECK (cost_amount >= 0),

  CONSTRAINT maintenance_payment_method_check
    CHECK (
      payment_method IS NULL
      OR payment_method IN ('CASH', 'TRANSFER', 'QRIS')
    ),

  CONSTRAINT maintenance_expense_unique
    UNIQUE (expense_id),

  CONSTRAINT maintenance_expense_data_check
    CHECK (
      cost_amount = 0
      OR (
        expense_date IS NOT NULL
        AND payment_method IS NOT NULL
      )
    )
);

-- 3. Index untuk pencarian dan filter.
CREATE INDEX IF NOT EXISTS idx_maintenance_owner
  ON public.maintenance_requests (owner_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_status
  ON public.maintenance_requests (owner_id, status);

CREATE INDEX IF NOT EXISTS idx_maintenance_category
  ON public.maintenance_requests (owner_id, category);

CREATE INDEX IF NOT EXISTS idx_maintenance_reported_at
  ON public.maintenance_requests (owner_id, reported_at DESC);

CREATE INDEX IF NOT EXISTS idx_maintenance_property
  ON public.maintenance_requests (property_id);

CREATE INDEX IF NOT EXISTS idx_maintenance_room
  ON public.maintenance_requests (room_id);

-- 4. updated_at trigger.
DROP TRIGGER IF EXISTS set_maintenance_updated_at
  ON public.maintenance_requests;

CREATE TRIGGER set_maintenance_updated_at
  BEFORE UPDATE ON public.maintenance_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 5. Aktifkan RLS.
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can manage own maintenance"
  ON public.maintenance_requests;

CREATE POLICY "Owner can manage own maintenance"
  ON public.maintenance_requests
  FOR ALL
  TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

-- 6. RPC untuk menyelesaikan maintenance dan membuat expense
--    dalam SATU transaksi database.
--    SECURITY INVOKER: mengikuti hak akses dan RLS pemanggil.
CREATE OR REPLACE FUNCTION public.complete_maintenance(
  p_maintenance_id UUID,
  p_completion_notes TEXT,
  p_cost_amount NUMERIC,
  p_cost_description TEXT,
  p_expense_date DATE,
  p_payment_method VARCHAR,
  p_reference_number TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_owner_id UUID;
  v_expense_id UUID;
  v_title VARCHAR(150);
  v_status VARCHAR(20);
BEGIN
  v_owner_id := (SELECT auth.uid());

  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF p_cost_amount IS NULL OR p_cost_amount < 0 THEN
    RAISE EXCEPTION 'Invalid maintenance cost';
  END IF;

  IF p_cost_amount > 0 THEN
    IF p_expense_date IS NULL THEN
      RAISE EXCEPTION 'Expense date is required';
    END IF;

    IF p_payment_method IS NULL
      OR p_payment_method NOT IN ('CASH', 'TRANSFER', 'QRIS') THEN
      RAISE EXCEPTION 'Invalid payment method';
    END IF;
  END IF;

  -- Lock dan validasi laporan milik pemanggil.
  SELECT title, status, expense_id
    INTO v_title, v_status, v_expense_id
  FROM public.maintenance_requests
  WHERE id = p_maintenance_id
    AND owner_id = v_owner_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Maintenance request not found';
  END IF;

  IF v_status NOT IN ('OPEN', 'IN_PROGRESS') THEN
    RAISE EXCEPTION 'Maintenance cannot be completed from current status';
  END IF;

  -- Simpan penyelesaian maintenance.
  UPDATE public.maintenance_requests
  SET
    status = 'COMPLETED',
    completed_at = NOW(),
    completion_notes = NULLIF(BTRIM(p_completion_notes), ''),
    cost_amount = p_cost_amount,
    cost_description = NULLIF(BTRIM(p_cost_description), ''),
    expense_date = CASE
      WHEN p_cost_amount > 0 THEN p_expense_date
      ELSE NULL
    END,
    payment_method = CASE
      WHEN p_cost_amount > 0 THEN p_payment_method
      ELSE NULL
    END,
    reference_number = CASE
      WHEN p_cost_amount > 0 THEN NULLIF(BTRIM(p_reference_number), '')
      ELSE NULL
    END
  WHERE id = p_maintenance_id
    AND owner_id = v_owner_id;

  -- Buat expense otomatis hanya jika ada biaya.
  IF p_cost_amount > 0 THEN
    INSERT INTO public.expenses (
      owner_id,
      expense_number,
      category,
      description,
      amount,
      expense_date,
      payment_method,
      reference_number,
      notes
    )
    VALUES (
      v_owner_id,
      'EXP-MNT-' ||
        TO_CHAR(CURRENT_DATE, 'YYYYMMDD') ||
        '-' ||
        UPPER(SUBSTRING(REPLACE(gen_random_uuid()::TEXT, '-', '') FROM 1 FOR 8)),
      'MAINTENANCE',
      COALESCE(NULLIF(BTRIM(p_cost_description), ''), v_title),
      p_cost_amount,
      p_expense_date,
      p_payment_method,
      NULLIF(BTRIM(p_reference_number), ''),
      'Otomatis dari maintenance: ' || v_title
    )
    RETURNING id INTO v_expense_id;

    UPDATE public.maintenance_requests
    SET expense_id = v_expense_id
    WHERE id = p_maintenance_id
      AND owner_id = v_owner_id;
  END IF;

  RETURN v_expense_id;
END;
$$;

-- 7. Batasi akses RPC hanya untuk user terautentikasi.
REVOKE ALL ON FUNCTION public.complete_maintenance(
  UUID, TEXT, NUMERIC, TEXT, DATE, VARCHAR, TEXT
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.complete_maintenance(
  UUID, TEXT, NUMERIC, TEXT, DATE, VARCHAR, TEXT
) FROM anon;

GRANT EXECUTE ON FUNCTION public.complete_maintenance(
  UUID, TEXT, NUMERIC, TEXT, DATE, VARCHAR, TEXT
) TO authenticated;
