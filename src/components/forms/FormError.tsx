import type { ReactNode } from "react";

export interface FormErrorProps {
  id?: string;
  children?: ReactNode;
  className?: string;
}

export default function FormError({ id, children, className }: FormErrorProps) {
  if (!children) return null;

  return (
    <p
      id={id}
      role="alert"
      className={["mt-1.5 text-xs leading-5 text-danger", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </p>
  );
}
