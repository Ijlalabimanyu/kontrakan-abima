
"use client";

import { Drawer as AntDrawer } from "antd";
import type { ComponentProps } from "react";

export type DrawerProps = ComponentProps<typeof AntDrawer>;

export default function Drawer({
  placement = "right",
  size = "min(640px, 100vw)",
  className,
  ...props
}: DrawerProps) {
  return (
    <AntDrawer
      {...props}
      placement={placement}
      size={size}
      className={["ka-drawer", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
