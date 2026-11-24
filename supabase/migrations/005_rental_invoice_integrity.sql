
-- Phase 4.1: Rental Invoice

CREATE TABLE public.rental_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id UUID NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,

  contract_id UUID NOT NULL
    REFERENCES public.rental_contracts(id),

  invoice_number TEXT NOT NULL,
  billing_period DATE NOT NULL,
  due_date DATE NOT NULL,

  amount NUMERIC(15, 2) NOT NULL
    CHECK (amount > 0),

  status TEXT NOT NULL DEFAULT 'UNPAID'
    CHECK (
      status IN (
        'UNPAID',
        'PARTIAL',
        'PAID',
        'CANCELLED'
      )
    ),

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT invoice_unique_contract_period
    UNIQUE (contract_id, billing_period),

  CONSTRAINT invoice_unique_number_per_owner
    UNIQUE (owner_id, invoice_number)
);

-- Indexes
CREATE INDEX idx_invoices_owner
  ON public.rental_invoices(owner_id);

CREATE INDEX idx_invoices_contract
  ON public.rental_invoices(contract_id);

CREATE INDEX idx_invoices_period
  ON public.rental_invoices(owner_id, billing_period DESC);

CREATE INDEX idx_invoices_status
  ON public.rental_invoices(owner_id, status);

CREATE INDEX idx_invoices_due_date
  ON public.rental_invoices(owner_id, due_date);

-- Enable RLS
ALTER TABLE public.rental_invoices
  ENABLE ROW LEVEL SECURITY;

-- Owner access
CREATE POLICY "Owners can view their invoices"
ON public.rental_invoices
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create their invoices"
ON public.rental_invoices
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their invoices"
ON public.rental_invoices
FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their invoices"
ON public.rental_invoices
FOR DELETE
USING (auth.uid() = owner_id);
