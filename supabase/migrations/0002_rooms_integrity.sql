
-- Ensure property ownership consistency
ALTER TABLE public.properties
ADD CONSTRAINT properties_id_owner_unique
UNIQUE (id, owner_id);

ALTER TABLE public.rooms
ADD CONSTRAINT rooms_property_owner_fk
FOREIGN KEY (property_id, owner_id)
REFERENCES public.properties (id, owner_id);

-- Additional indexes
CREATE INDEX IF NOT EXISTS idx_rooms_owner_status
ON public.rooms (owner_id, status);

CREATE INDEX IF NOT EXISTS idx_rooms_owner_property
ON public.rooms (owner_id, property_id);
