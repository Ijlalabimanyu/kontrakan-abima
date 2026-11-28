"use client";

import { Modal as AntModal } from "antd";
import type { ComponentProps } from "react";

export type ModalProps = ComponentProps<typeof AntModal>;

export default function Modal({
  centered = true,
  width = 560,
  className,
  rootClassName,
  ...props
}: ModalProps) {
  return (
    <AntModal
      {...props}
      centered={centered}
      width={width}
      className={["ka-modal", className].filter(Boolean).join(" ")}
      rootClassName={["ka-modal-root", rootClassName].filter(Boolean).join(" ")}
    />
  );
}
