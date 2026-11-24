
-- Ensure tenant ownership consistency
ALTER TABLE public.rooms
ADD CONSTRAINT rooms_id_owner_unique
UNIQUE (id, owner_id);

ALTER TABLE public.tenants
ADD CONSTRAINT tenants_id_owner_unique
UNIQUE (id, owner_id);

-- Ensure contract room and tenant belong
-- to the same authenticated owner
ALTER TABLE public.rental_contracts
ADD CONSTRAINT contracts_room_owner_fk
FOREIGN KEY (room_id, owner_id)
REFERENCES public.rooms (id, owner_id);

ALTER TABLE public.rental_contracts
ADD CONSTRAINT contracts_tenant_owner_fk
FOREIGN KEY (tenant_id, owner_id)
REFERENCES public.tenants (id, owner_id);

-- Validate contract dates and price
ALTER TABLE public.rental_contracts
ADD CONSTRAINT contracts_valid_period
CHECK (
  end_date IS NULL OR end_date >= start_date
);

ALTER TABLE public.rental_contracts
ADD CONSTRAINT contracts_valid_price
CHECK (monthly_price > 0);

-- One active contract per room
CREATE UNIQUE INDEX idx_contracts_one_active_room
ON public.rental_contracts (room_id)
WHERE status = 'ACTIVE';

-- Query optimization
CREATE INDEX idx_contracts_owner_status
ON public.rental_contracts (owner_id, status);

CREATE INDEX idx_contracts_owner_start_date
ON public.rental_contracts (owner_id, start_date DESC);

CREATE INDEX idx_contracts_tenant_history
ON public.rental_contracts (tenant_id, start_date DESC);

CREATE INDEX idx_contracts_room_history
ON public.rental_contracts (room_id, start_date DESC);
