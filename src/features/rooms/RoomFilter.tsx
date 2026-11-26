"use client";

import { Search } from "lucide-react";

import { Input, Select } from "@/components/ui";

import type { PropertyModel } from "@/services/properties/interface";

import type { RoomFilterValues, RoomStatus } from "@/services/rooms/interfaces";

interface RoomFilterProps {
  properties: PropertyModel[];
  filters: RoomFilterValues;
  onChange: (filters: RoomFilterValues) => void;
}

export default function RoomFilter({
  properties,
  filters,
  onChange,
}: RoomFilterProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_220px_180px]">
      {/* Search */}
      <Input
        allowClear
        placeholder="Cari nomor kamar..."
        prefix={<Search size={16} className="text-muted" />}
        value={filters.search}
        onChange={(event) =>
          onChange({
            ...filters,
            search: event.target.value,
          })
        }
      />

      {/* Property Filter */}
      <Select
        allowClear
        placeholder="Semua properti"
        value={filters.property_id ?? undefined}
        options={properties.map((property) => ({
          label: property.name,
          value: property.id,
        }))}
        showSearch
        optionFilterProp="label"
        onChange={(value) =>
          onChange({
            ...filters,
            property_id: value ?? null,
          })
        }
      />

      {/* Status Filter */}
      <Select
        allowClear
        placeholder="Semua status"
        value={filters.status ?? undefined}
        options={[
          { label: "Tersedia", value: "AVAILABLE" },
          { label: "Terisi", value: "OCCUPIED" },
          { label: "Maintenance", value: "MAINTENANCE" },
        ]}
        onChange={(value) =>
          onChange({
            ...filters,
            status: (value ?? null) as RoomStatus | null,
          })
        }
      />
    </div>
  );
}
