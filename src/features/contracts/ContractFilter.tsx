"use client";

import { Search } from "lucide-react";
import { ContractFilterValues } from "@/services/contract/interface";
import { Input, Select } from "@/components/ui";

interface ContractFilterProps {
  filters: ContractFilterValues;
  onChange: (value: ContractFilterValues) => void;
}

export default function ContractFilter({
  filters,
  onChange,
}: ContractFilterProps) {
  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:min-w-140 sm:grid-cols-[minmax(0,1fr)_200px]">
      {/* Search */}
      <Input
        allowClear
        className="w-full min-w-0"
        placeholder="Cari penyewa, properti, atau kamar..."
        prefix={<Search size={16} className="text-muted" />}
        value={filters.search}
        onChange={(event) =>
          onChange({
            ...filters,
            search: event.target.value,
          })
        }
      />

      {/* Status */}
      <Select
        allowClear
        className="w-full min-w-0"
        placeholder="Semua status"
        value={filters.status ?? undefined}
        options={[
          { label: "Aktif", value: "ACTIVE" },
          { label: "Selesai", value: "COMPLETED" },
          { label: "Dibatalkan", value: "CANCELLED" },
        ]}
        onChange={(value) =>
          onChange({
            ...filters,
            status: value ?? null,
          })
        }
      />
    </div>
  );
}
