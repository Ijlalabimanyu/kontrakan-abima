"use client";

import { Upload, Typography, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";

interface PaymentProofUploadProps {
  value?: UploadFile[];
  onChange?: (files: UploadFile[]) => void;
  disabled?: boolean;
}

const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function PaymentProofUpload({
  value = [],
  onChange,
  disabled = false,
}: PaymentProofUploadProps) {
  const [messageApi, contextHolder] = message.useMessage();

  const props: UploadProps = {
    accept: ".jpg,.jpeg,.png,.pdf",
    maxCount: 1,
    fileList: value,
    disabled,
    beforeUpload: (file) => {
      if (!allowedTypes.includes(file.type)) {
        messageApi.error("Format bukti harus JPG, PNG, atau PDF.");
        return Upload.LIST_IGNORE;
      }

      if (file.size > MAX_FILE_SIZE) {
        messageApi.error("Ukuran file maksimal 5 MB.");
        return Upload.LIST_IGNORE;
      }

      onChange?.([
        {
          uid: file.uid,
          name: file.name,
          status: "done",
          originFileObj: file,
        },
      ]);

      return false;
    },
    onRemove: () => {
      onChange?.([]);
    },
  };

  return (
    <>
      {contextHolder}

      <div>
        <Upload.Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Klik atau tarik file bukti pembayaran
          </p>
          <p className="ant-upload-hint">
            JPG, PNG, atau PDF. Maksimal 5 MB.
          </p>
        </Upload.Dragger>

        <Typography.Text type="secondary" className="text-xs">
          Bukti pembayaran bersifat opsional.
        </Typography.Text>
      </div>
    </>
  );
}
