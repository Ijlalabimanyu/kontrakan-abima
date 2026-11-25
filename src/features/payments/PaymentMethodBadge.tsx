import { Tag } from "antd";

import { PaymentMethod } from "@/services/payments/payment.interface";

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
}

const methodConfig: Record<
  PaymentMethod,
  { label: string; color: string }
> = {
  CASH: {
    label: "Cash",
    color: "success",
  },
  TRANSFER: {
    label: "Transfer",
    color: "processing",
  },
  QRIS: {
    label: "QRIS",
    color: "purple",
  },
};

export default function PaymentMethodBadge({
  method,
}: PaymentMethodBadgeProps) {
  const config = methodConfig[method];

  return <Tag color={config.color}>{config.label}</Tag>;
}
