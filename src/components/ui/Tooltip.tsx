"use client";

import { Tooltip as AntTooltip } from "antd";
import type { ComponentProps } from "react";

export type TooltipProps = ComponentProps<typeof AntTooltip>;

export default function Tooltip({
  placement = "top",
  color = "#202C26",
  arrow = true,
  className,
  ...props
}: TooltipProps) {
  return (
    <AntTooltip
      {...props}
      placement={placement}
      color={color}
      arrow={arrow}
      className={className}
    />
  );
}
