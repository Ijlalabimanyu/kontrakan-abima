"use client";

import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface TenantFilterProps {
  search: string;
  onSearch: (value: string) => void;
}

export default function TenantFilter({ search, onSearch }: TenantFilterProps) {
  return (
    <Input
      allowClear
      prefix={<SearchOutlined />}
      placeholder="Cari nama atau nomor telepon penyewa..."
      value={search}
      onChange={(event) => onSearch(event.target.value)}
      className="!w-full sm:!w-96"
    />
  );
}
