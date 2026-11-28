"use client";

import { InputNumber as AntInputNumber } from "antd";
import type { ComponentProps } from "react";

export type NumberInputProps = ComponentProps<typeof AntInputNumber>;

export default function NumberInput({
  className,
  onKeyDown,
  onPaste,
  ...props
}: NumberInputProps) {
  return (
    <AntInputNumber
      {...props}
      controls={false}
      className={["w-full!", "rounded-md!", className]
        .filter(Boolean)
        .join(" ")}
      onKeyDown={(event) => {
        const allowedKeys = [
          "Backspace",
          "Delete",
          "Tab",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
          "Enter",
        ];

        if (
          !/^[0-9]$/.test(event.key) &&
          !allowedKeys.includes(event.key) &&
          !(event.ctrlKey || event.metaKey)
        ) {
          event.preventDefault();
        }

        onKeyDown?.(event);
      }}
      onPaste={(event) => {
        const pastedText = event.clipboardData.getData("text");

        if (!/^\d+$/.test(pastedText)) {
          event.preventDefault();
        }

        onPaste?.(event);
      }}
    />
  );
}
