import { Badge } from "@/components/ui";
import type { PaymentMethod } from "@/services/payments/interface";

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
}

const methodConfig: Record<
  PaymentMethod,
  {
    label: string;
    tone: "success" | "brand" | "warning";
  }
> = {
  CASH: {
    label: "Cash",
    tone: "brand",
  },
  TRANSFER: {
    label: "Transfer",
    tone: "success",
  },
  QRIS: {
    label: "QRIS",
    tone: "warning",
  },
};

export default function PaymentMethodBadge({
  method,
}: PaymentMethodBadgeProps) {
  const config = methodConfig[method];

  return (
    <Badge tone={config.tone} dot>
      {config.label}
    </Badge>
  );
}
