
-- Normalize empty identity numbers to NULL
UPDATE public.tenants
SET identity_number = NULL
WHERE identity_number IS NOT NULL
  AND trim(identity_number) = '';

-- Prevent duplicate identity numbers per owner
CREATE UNIQUE INDEX IF NOT EXISTS
  idx_tenants_owner_identity_unique
ON public.tenants (owner_id, identity_number)
WHERE identity_number IS NOT NULL;

-- Improve tenant search
CREATE INDEX IF NOT EXISTS
  idx_tenants_owner_name
ON public.tenants (owner_id, name);

CREATE INDEX IF NOT EXISTS
  idx_tenants_owner_phone
ON public.tenants (owner_id, phone);
    