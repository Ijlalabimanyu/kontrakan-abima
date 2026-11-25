import { Input as AntInput } from "antd";
import type { InputProps as AntInputProps } from "antd";

export type InputProps = AntInputProps;

export default function Input({
  size = "medium",
  className,
  ...props
}: InputProps) {
  return (
    <AntInput
      {...props}
      size={size}
      className={["w-full rounded-md!", className].filter(Boolean).join(" ")}
    />
  );
}
