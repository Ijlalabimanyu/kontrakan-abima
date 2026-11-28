"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui";

interface TenantFilterProps {
  search: string;
  onSearch: (value: string) => void;
}

export default function TenantFilter({ search, onSearch }: TenantFilterProps) {
  return (
    <Input
      allowClear
      prefix={<Search size={16} className="text-muted" />}
      placeholder="Cari nama atau nomor telepon penyewa..."
      value={search}
      onChange={(event) => onSearch(event.target.value)}
      className="w-full! sm:w-96!"
    />
  );
}
