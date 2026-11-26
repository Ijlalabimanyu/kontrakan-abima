"use client";

import { Input as AntInput } from "antd";
import type { ComponentProps } from "react";

export type TextAreaProps = ComponentProps<typeof AntInput.TextArea>;

export default function TextArea({
  rows = 3,
  className,
  ...props
}: TextAreaProps) {
  return (
    <AntInput.TextArea
      {...props}
      rows={rows}
      className={["rounded-md!", className].filter(Boolean).join(" ")}
    />
  );
}
