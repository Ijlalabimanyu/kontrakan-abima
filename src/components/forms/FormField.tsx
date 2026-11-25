import type { ReactNode } from "react";
import FormError from "./FormError";

export interface FormFieldProps {
  id: string;
  label: ReactNode;
  children: ReactNode;

  required?: boolean;
  description?: ReactNode;
  error?: ReactNode;

  className?: string;
}

export default function FormField({
  id,
  label,
  children,
  required = false,
  description,
  error,
  className,
}: FormFieldProps) {
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const describedBy =
    [description ? descriptionId : undefined, error ? errorId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div
      className={["min-w-0 space-y-1.5", className].filter(Boolean).join(" ")}
    >
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-foreground"
      >
        {label}

        {required && (
          <span aria-hidden="true" className="ml-1 text-danger">
            *
          </span>
        )}
      </label>

      {description && (
        <p id={descriptionId} className="text-xs leading-5 text-muted">
          {description}
        </p>
      )}

      <div aria-describedby={describedBy} aria-invalid={Boolean(error)}>
        {children}
      </div>

      <FormError id={errorId}>{error}</FormError>
    </div>
  );
}
