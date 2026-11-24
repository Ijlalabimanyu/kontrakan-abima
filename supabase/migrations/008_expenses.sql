CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_number TEXT NOT NULL,
  category VARCHAR(20) NOT NULL
    CHECK (
      category IN (
        'ELECTRICITY',
        'WATER',
        'INTERNET',
        'MAINTENANCE',
        'CLEANING',
        'SUPPLIES',
        'TAX',
        'OTHER'
      )
    ),
  description VARCHAR(255) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  expense_date DATE NOT NULL,
  payment_method VARCHAR(20) NOT NULL
    CHECK (payment_method IN ('CASH', 'TRANSFER', 'QRIS')),
  reference_number VARCHAR(100),
  notes VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT expenses_unique_number_per_owner
    UNIQUE (owner_id, expense_number)
);

CREATE INDEX IF NOT EXISTS idx_expenses_owner_date
ON public.expenses(owner_id, expense_date DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_expenses_owner_category
ON public.expenses(owner_id, category);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can manage own expenses"
ON public.expenses;

CREATE POLICY "Owners can manage own expenses"
ON public.expenses
FOR ALL
TO authenticated
USING (owner_id = (SELECT auth.uid()))
WITH CHECK (owner_id = (SELECT auth.uid()));
