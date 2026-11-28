"use client";

import { useTransition } from "react";
import { DatePicker, Form, message } from "antd";
import dayjs from "dayjs";

import { Button, Modal, NumberInput, Select } from "@/components/ui";

import type {
  ContractModel,
  ContractRoomOption,
  ContractTenantOption,
} from "@/services/contract/interface";

import { createContract, updateContract } from "@/services/contract/actions";

import type { ContractActionState } from "@/services/contract/actions";

interface ContractFormProps {
  open: boolean;
  contract: ContractModel | null;
  rooms: ContractRoomOption[];
  tenants: ContractTenantOption[];
  onClose: () => void;
  onSuccess: () => void;
}

interface ContractFormInput {
  room_id: string;
  tenant_id: string;
  start_date: dayjs.Dayjs;
  end_date: dayjs.Dayjs | null;
  monthly_price: number;
  payment_due_day: number;
}

const initialState: ContractActionState = {
  success: false,
  message: "",
};

interface ContractFormContentProps {
  contract: ContractModel | null;
  rooms: ContractRoomOption[];
  tenants: ContractTenantOption[];
  onClose: () => void;
  onSuccess: () => void;
}

const ContractFormContent = ({
  contract,
  rooms,
  tenants,
  onClose,
  onSuccess,
}: ContractFormContentProps) => {
  const [form] = Form.useForm<ContractFormInput>();
  const [isPending, startTransition] = useTransition();
  const [messageApi, contextHolder] = message.useMessage();

  const availableRooms = rooms.filter((room) => {
    if (room.status === "MAINTENANCE") return false;

    if (room.hasActiveContract && room.id !== contract?.room_id) {
      return false;
    }

    return room.status === "AVAILABLE" || room.id === contract?.room_id;
  });

  const initialValues: Partial<ContractFormInput> = {
    room_id: contract?.room_id,
    tenant_id: contract?.tenant_id,
    start_date: contract ? dayjs(contract.start_date) : dayjs(),
    end_date: contract?.end_date ? dayjs(contract.end_date) : null,
    monthly_price: contract?.monthly_price,
    payment_due_day: contract?.payment_due_day ?? 1,
  };

  const handleRoomChange = (roomId: string) => {
    const selectedRoom = rooms.find((room) => room.id === roomId);

    if (selectedRoom) {
      form.setFieldValue("monthly_price", selectedRoom.monthly_price);
    }
  };

  const handleSubmit = (values: ContractFormInput) => {
    const formData = new FormData();

    if (contract) {
      formData.append("id", contract.id);
    }

    formData.append("room_id", values.room_id);
    formData.append("tenant_id", values.tenant_id);
    formData.append("start_date", values.start_date.format("YYYY-MM-DD"));
    formData.append("end_date", values.end_date?.format("YYYY-MM-DD") ?? "");
    formData.append("monthly_price", String(values.monthly_price));
    formData.append("payment_due_day", String(values.payment_due_day));

    startTransition(async () => {
      try {
        const result = contract
          ? await updateContract(initialState, formData)
          : await createContract(initialState, formData);

        if (!result.success) {
          messageApi.error(result.message);
          return;
        }

        messageApi.success(result.message);
        form.resetFields();
        onSuccess();
      } catch {
        messageApi.error("Terjadi kesalahan saat menyimpan kontrak.");
      }
    });
  };

  return (
    <>
      {contextHolder}

      <Form<ContractFormInput>
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        requiredMark="optional"
        disabled={isPending}
      >
        {/* Room */}
        <Form.Item
          name="room_id"
          label="Pilih Kamar"
          rules={[
            {
              required: true,
              message: "Kamar wajib dipilih.",
            },
          ]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Pilih kamar"
            onChange={handleRoomChange}
            options={availableRooms.map((room) => ({
              label: `${room.property_name} - Kamar ${room.room_number}`,
              value: room.id,
            }))}
          />
        </Form.Item>

        {availableRooms.length === 0 && (
          <div className="mb-5 rounded-lg border border-warning/20 bg-warning-soft p-3">
            <p className="text-sm font-semibold text-warning">
              Tidak Ada Kamar Tersedia
            </p>

            <p className="mt-1 text-xs leading-5 text-muted">
              Saat ini tidak ada kamar yang tersedia untuk dikontrakkan. Silakan
              periksa status kamar atau kontrak aktif.
            </p>
          </div>
        )}

        {/* Tenant */}
        <Form.Item
          name="tenant_id"
          label="Pilih Penyewa"
          rules={[
            {
              required: true,
              message: "Penyewa wajib dipilih.",
            },
          ]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Pilih penyewa"
            options={tenants.map((tenant) => ({
              label: tenant.name,
              value: tenant.id,
            }))}
          />
        </Form.Item>

        {/* Contract Period */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Form.Item
            name="start_date"
            label="Tanggal Mulai"
            rules={[
              {
                required: true,
                message: "Tanggal mulai wajib diisi.",
              },
            ]}
          >
            <DatePicker
              className="w-full!"
              format="DD/MM/YYYY"
              placeholder="Pilih tanggal mulai"
            />
          </Form.Item>

          <Form.Item
            name="end_date"
            label="Tanggal Akhir"
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startDate = getFieldValue("start_date");

                  if (
                    !value ||
                    !startDate ||
                    !value.isBefore(startDate, "day")
                  ) {
                    return Promise.resolve();
                  }

                  return Promise.reject(
                    new Error("Tanggal akhir sebelum tanggal mulai."),
                  );
                },
              }),
            ]}
          >
            <DatePicker
              className="w-full!"
              format="DD/MM/YYYY"
              placeholder="Tidak ditentukan"
              allowClear
            />
          </Form.Item>
        </div>

        {/* Monthly Price */}
        <Form.Item
          name="monthly_price"
          label="Harga Sewa per Bulan"
          rules={[
            {
              required: true,
              message: "Harga sewa wajib diisi.",
            },
            {
              type: "number",
              min: 1,
              message: "Harga sewa harus lebih dari 0.",
            },
          ]}
        >
          <NumberInput
            min={1}
            precision={2}
            placeholder="Masukkan harga sewa"
            formatter={(value) => {
              if (value == null) return "";

              const [integer, decimal] = String(value).split(".");

              const formattedInteger = integer.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                ".",
              );

              return `Rp ${formattedInteger}${decimal ? `,${decimal}` : ""}`;
            }}
            parser={(value) => {
              const normalized = (value ?? "")
                .replace(/[^\d,.]/g, "")
                .replace(/\./g, "")
                .replace(",", ".");

              if (!normalized) return 0;

              const parsed = Number(normalized);

              return Number.isFinite(parsed) ? parsed : 0;
            }}
          />
        </Form.Item>

        {/* Payment Due Day */}
        <Form.Item
          name="payment_due_day"
          label="Tanggal Jatuh Tempo Bulanan"
          rules={[
            {
              required: true,
              message: "Tanggal jatuh tempo wajib diisi.",
            },
            {
              type: "number",
              min: 1,
              max: 28,
              message: "Tanggal harus antara 1 sampai 28.",
            },
          ]}
        >
          <NumberInput min={1} max={28} precision={0} placeholder="Contoh: 5" />
        </Form.Item>

        {/* Form Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            block
            className="sm:w-auto!"
            disabled={isPending}
            onClick={onClose}
          >
            Batal
          </Button>

          <Button
            variant="primary"
            htmlType="submit"
            loading={isPending}
            disabled={availableRooms.length === 0 && !contract}
            block
            className="sm:w-auto!"
          >
            {contract ? "Simpan Perubahan" : "Buat Kontrak"}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default function ContractForm({
  open,
  contract,
  rooms,
  tenants,
  onClose,
  onSuccess,
}: ContractFormProps) {
  const isEditing = Boolean(contract);

  return (
    <Modal
      open={open}
      title={
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">
            {isEditing ? "Edit Kontrak" : "Buat Kontrak Sewa"}
          </h2>

          <p className="text-xs font-normal text-muted">
            {isEditing
              ? "Perbarui informasi dan konfigurasi kontrak sewa."
              : "Lengkapi informasi untuk membuat kontrak sewa baru."}
          </p>
        </div>
      }
      width="min(560px, calc(100vw - 32px))"
      centered
      footer={null}
      destroyOnHidden
      closable
      onCancel={onClose}
      styles={{
        body: {
          maxHeight: "calc(100dvh - 180px)",
          overflowY: "auto",
          paddingTop: 20,
        },
      }}
    >
      {open && (
        <ContractFormContent
          key={contract?.id ?? "new-contract"}
          contract={contract}
          rooms={rooms}
          tenants={tenants}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
