
import { Card as AntCard } from "antd";
import type { CardProps as AntCardProps } from "antd";
import type { CSSProperties } from "react";

export type CardAppearance = "default" | "outlined" | "elevated";

export interface CardProps extends Omit<AntCardProps, "variant"> {
  appearance?: CardAppearance;
}

const appearanceStyles: Record<CardAppearance, CSSProperties> = {
  default: {
    backgroundColor: "var(--ka-surface)",
    border: "1px solid var(--ka-border)",
  },
  outlined: {
    backgroundColor: "transparent",
    border: "1px solid var(--ka-border)",
  },
  elevated: {
    backgroundColor: "var(--ka-surface)",
    border: "1px solid transparent",
    boxShadow: "var(--ka-shadow-md)",
  },
};

export default function Card({
  appearance = "default",
  className,
  style,
  ...props
}: CardProps) {
  return (
    <AntCard
      {...props}
      className={["rounded-lg!", className]
        .filter(Boolean)
        .join(" ")}
      style={{
        borderRadius: "var(--ka-radius-lg)",
        ...appearanceStyles[appearance],
        ...style,
      }}
    />
  );
}
