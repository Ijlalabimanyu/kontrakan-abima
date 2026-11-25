
import { Select as AntSelect } from "antd";
import type { SelectProps as AntSelectProps } from "antd";

export type SelectProps = AntSelectProps;

export default function Select({
  size = "medium",
  className,
  ...props
}: SelectProps) {
  return (
    <AntSelect
      {...props}
      size={size}
      className={["w-full", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
