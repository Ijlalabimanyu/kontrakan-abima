"use client";

import { Input, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { PropertyModel } from "@/features/properties/interfaces/property.interface";
import { RoomFilterValues } from "../interfaces/room.interfaces";

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
    <Space wrap className="w-full">
      <Input
        allowClear
        placeholder="Cari nomor kamar..."
        prefix={<SearchOutlined />}
        value={filters.search}
        onChange={(event) =>
          onChange({
            ...filters,
            search: event.target.value,
          })
        }
        className="!w-full sm:!w-64"
      />

      <Select
        allowClear
        placeholder="Semua properti"
        className="w-full sm:!w-52"
        value={filters.property_id}
        options={properties.map((property) => ({
          label: property.name,
          value: property.id,
        }))}
        onChange={(value) =>
          onChange({
            ...filters,
            property_id: value ?? null,
          })
        }
      />

      <Select
        allowClear
        placeholder="Semua status"
        className="w-full sm:!w-44"
        value={filters.status}
        options={[
          { label: "Tersedia", value: "AVAILABLE" },
          { label: "Terisi", value: "OCCUPIED" },
          { label: "Maintenance", value: "MAINTENANCE" },
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
