
import { DatePicker as AntDatePicker } from "antd";
import type { ComponentProps } from "react";

export type DatePickerProps =
  ComponentProps<typeof AntDatePicker>;

export type RangePickerProps =
  ComponentProps<typeof AntDatePicker.RangePicker>;

export function RangePicker({
  size = "medium",
  format = "DD MMM YYYY",
  className,
  ...props
}: RangePickerProps) {
  return (
    <AntDatePicker.RangePicker
      {...props}
      size={size}
      format={format}
      className={["w-full", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export default function DatePicker({
  size = "medium",
  format = "DD MMM YYYY",
  className,
  ...props
}: DatePickerProps) {
  return (
    <AntDatePicker
      {...props}
      size={size}
      format={format}
      className={["w-full", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
