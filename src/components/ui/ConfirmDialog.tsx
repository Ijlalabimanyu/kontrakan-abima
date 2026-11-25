"use client";

import type { ReactNode } from "react";
import { ExclamationCircleFilled } from "@ant-design/icons";
import Modal from "./Modal";
import Button from "./Button";

export type ConfirmDialogVariant = "danger" | "primary";

export interface ConfirmDialogProps {
  open: boolean;
  title: ReactNode;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ConfirmDialogVariant;
  confirmLoading?: boolean;
  confirmDisabled?: boolean;
  icon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  confirmVariant = "danger",
  confirmLoading = false,
  confirmDisabled = false,
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const isDanger = confirmVariant === "danger";

  return (
    <Modal
      open={open}
      title={null}
      footer={null}
      width={440}
      closable={false}
      keyboard={!confirmLoading}
      mask={{ closable: !confirmLoading }}
      onCancel={onCancel}
      style={{
        backgroundColor: isDanger
          ? "var(--ka-danger-soft)"
          : "var(--ka-brand-soft)",
        color: isDanger ? "var(--ka-danger)" : "var(--ka-brand-primary)",
      }}
    >
      <div className="space-y-6">
        <div className="flex gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl"
            style={{
              backgroundColor: isDanger ? "#FAECEC" : "#DDE8DF",
              color: isDanger ? "#B84D4D" : "#173F35",
            }}
          >
            {icon ?? <ExclamationCircleFilled />}
          </div>

          <div className="min-w-0 space-y-2">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>

            <div className="text-sm leading-6 text-muted">{description}</div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={confirmLoading}
          >
            {cancelText}
          </Button>

          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            loading={confirmLoading}
            disabled={confirmDisabled}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
