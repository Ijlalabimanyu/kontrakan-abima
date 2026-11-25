
import { Button as AntButton } from "antd";
import type { ButtonProps as AntButtonProps } from "antd";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export interface ButtonProps
  extends Omit<
    AntButtonProps,
    "type" | "color" | "variant" | "danger"
  > {
  variant?: ButtonVariant;
}

const buttonTypeMap: Record<
  ButtonVariant,
  NonNullable<AntButtonProps["type"]>
> = {
  primary: "primary",
  secondary: "default",
  outline: "default",
  ghost: "text",
  danger: "primary",
};

const buttonClassMap: Record<ButtonVariant, string> = {
  primary: "",
  secondary:
    "!border-transparent !bg-brand-soft !text-brand-primary hover:!brightness-95",
  outline:
    "!border-border !bg-surface !text-foreground hover:!border-brand-primary hover:!text-brand-primary",
  ghost:
    "!border-transparent !bg-transparent !text-brand-primary hover:!bg-brand-soft",
  danger: "",
};

export default function Button({
  variant = "primary",
  size = "medium",
  className,
  ...props
}: ButtonProps) {
  const isDanger = variant === "danger";

  return (
    <AntButton
      {...props}
      type={buttonTypeMap[variant]}
      danger={isDanger}
      size={size}
      className={[
        "!rounded-md font-medium",
        buttonClassMap[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
