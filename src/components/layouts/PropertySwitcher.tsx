"use client";

import { BankOutlined } from "@ant-design/icons";
import Select from "@/components/ui/Select";

export interface PropertyOption {
  id: string;
  name: string;
  address?: string;
}

export interface PropertySwitcherProps {
  properties: PropertyOption[];
  value?: string;
  onChange: (propertyId: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function PropertySwitcher({
  properties,
  value,
  onChange,
  disabled = false,
  className,
}: PropertySwitcherProps) {
  if (properties.length === 0) {
    return null;
  }

  return (
    <div
      className={[
        "flex h-10 min-w-0 items-center gap-2",
        "rounded-lg border border-border bg-surface px-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <BankOutlined className="shrink-0 text-muted" />

      <Select
        size="small"
        value={value}
        disabled={disabled}
        placeholder="Pilih properti"
        options={properties.map((property) => ({
          label: property.name,
          value: property.id,
        }))}
        showSearch
        optionFilterProp="label"
        onChange={(selectedValue) => {
          if (typeof selectedValue === "string") {
            onChange(selectedValue);
          }
        }}
        style={{ width: 220 }}
        variant="borderless"
      />
    </div>
  );
}
