import { Tag } from "antd";
import type { CSSProperties, ReactNode } from "react";
import type { TagProps } from "antd";

export type BadgeTone =
  "success" | "warning" | "danger" | "info" | "neutral" | "brand";

export interface BadgeProps extends Omit<
  TagProps,
  "color" | "variant" | "style"
> {
  tone?: BadgeTone;
  size?: "small" | "medium";
  dot?: boolean;
  style?: CSSProperties;
  children: ReactNode;
}

const toneStyles: Record<BadgeTone, { background: string; color: string }> = {
  success: {
    background: "var(--ka-success-soft)",
    color: "var(--ka-success)",
  },
  warning: {
    background: "var(--ka-warning-soft)",
    color: "var(--ka-warning)",
  },
  danger: {
    background: "var(--ka-danger-soft)",
    color: "var(--ka-danger)",
  },
  info: {
    background: "var(--ka-info-soft)",
    color: "var(--ka-info)",
  },
  neutral: {
    background: "var(--ka-neutral-soft)",
    color: "var(--ka-text-secondary)",
  },
  brand: {
    background: "var(--ka-brand-soft)",
    color: "var(--ka-brand-primary)",
  },
};

export default function Badge({
  tone = "neutral",
  size = "medium",
  dot = false,
  children,
  className,
  style,
  ...props
}: BadgeProps) {
  const colors = toneStyles[tone];

  return (
    <Tag
      {...props}
      className={["m-0! rounded-full!", className].filter(Boolean).join(" ")}
      style={{
        background: colors.background,
        color: colors.color,
        border: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: size === "small" ? "2px 8px" : "4px 10px",
        fontSize: size === "small" ? 11 : 12,
        fontWeight: 600,
        lineHeight: 1.5,
        ...style,
      }}
    >
      {dot && (
        <span
          aria-hidden="true"
          style={{
            width: 6,
            height: 6,
            flexShrink: 0,
            borderRadius: "50%",
            background: colors.color,
          }}
        />
      )}

      {children}
    </Tag>
  );
}
