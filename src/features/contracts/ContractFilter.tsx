"use client";

import { Input, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { ContractFilterValues } from "@/services/contract/interface";

interface ContractFilterProps {
  filters: ContractFilterValues;
  onChange: (value: ContractFilterValues) => void;
}

export default function ContractFilter({
  filters,
  onChange,
}: ContractFilterProps) {
  return (
    <Space wrap className="w-full">
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Cari penyewa atau kamar..."
        className="!w-full sm:!w-72"
        value={filters.search}
        onChange={(event) =>
          onChange({
            ...filters,
            search: event.target.value,
          })
        }
      />

      <Select
        allowClear
        placeholder="Semua status"
        className="w-full sm:!w-44"
        value={filters.status}
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
    </Space>
  );
}
