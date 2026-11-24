"use client";

import { useEffect, useTransition } from "react";
import {
  Button,
  DatePicker,
  Form,
  InputNumber,
  Modal,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";

import {
  ContractModel,
  ContractRoomOption,
  ContractTenantOption,
} from "../interfaces/contract.interface";
import {
  ContractActionState,
  createContract,
  updateContract,
} from "@/services/contract/actions";

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

export default function ContractForm({
  open,
  contract,
  rooms,
  tenants,
  onClose,
  onSuccess,
}: ContractFormProps) {
  const [form] = Form.useForm<ContractFormInput>();
  const [isPending, startTransition] = useTransition();
  const [messageApi, contextHolder] = message.useMessage();

  const availableRooms = rooms.filter((room) => {
    if (room.status === "MAINTENANCE") return false;
    if (room.hasActiveContract && room.id !== contract?.room_id) return false;

    return room.status === "AVAILABLE" || room.id === contract?.room_id;
  });

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      room_id: contract?.room_id,
      tenant_id: contract?.tenant_id,
      start_date: contract ? dayjs(contract.start_date) : dayjs(),
      end_date: contract?.end_date ? dayjs(contract.end_date) : null,
      monthly_price: contract?.monthly_price,
      payment_due_day: contract?.payment_due_day ?? 1,
    });
  }, [open, contract, form]);

  const handleRoomChange = (roomId: string) => {
    const selectedRoom = rooms.find((room) => room.id === roomId);

    if (selectedRoom) {
      form.setFieldValue("monthly_price", selectedRoom.monthly_price);
    }
  };

  const handleSubmit = (values: ContractFormInput) => {
    const formData = new FormData();

    formData.append("room_id", values.room_id);
    formData.append("tenant_id", values.tenant_id);
    formData.append("start_date", values.start_date.format("YYYY-MM-DD"));
    formData.append("end_date", values.end_date?.format("YYYY-MM-DD") ?? "");
    formData.append("monthly_price", String(values.monthly_price));
    formData.append("payment_due_day", String(values.payment_due_day));

    if (contract) {
      formData.append("id", contract.id);
    }

    startTransition(async () => {
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
    });
  };

  return (
    <>
      {contextHolder}

      <Modal
        title={contract ? "Edit Kontrak" : "Buat Kontrak Sewa"}
        open={open}
        onCancel={onClose}
        footer={null}
        destroyOnHidden
        width={560}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item
            name="room_id"
            label="Pilih Kamar"
            rules={[{ required: true, message: "Kamar wajib dipilih" }]}
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

          <Form.Item
            name="tenant_id"
            label="Pilih Penyewa"
            rules={[{ required: true, message: "Penyewa wajib dipilih" }]}
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Form.Item
              name="start_date"
              label="Tanggal Mulai"
              rules={[{ required: true, message: "Tanggal mulai wajib diisi" }]}
            >
              <DatePicker className="!w-full" format="DD/MM/YYYY" />
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
                      new Error("Tanggal akhir sebelum tanggal mulai"),
                    );
                  },
                }),
              ]}
            >
              <DatePicker
                className="!w-full"
                format="DD/MM/YYYY"
                placeholder="Tidak ditentukan"
                allowClear
              />
            </Form.Item>
          </div>

          <Form.Item
            name="monthly_price"
            label="Harga Sewa per Bulan"
            rules={[
              { required: true, message: "Harga sewa wajib diisi" },
              {
                type: "number",
                min: 1,
                message: "Harga sewa harus lebih dari 0",
              },
            ]}
          >
            <InputNumber<number>
              className="!w-full"
              addonBefore="Rp"
              min={1}
              precision={2}
              placeholder="Contoh: 1000000"
            />
          </Form.Item>

          <Form.Item
            name="payment_due_day"
            label="Tanggal Jatuh Tempo"
            rules={[
              { required: true, message: "Tanggal jatuh tempo wajib diisi" },
              {
                type: "number",
                min: 1,
                max: 28,
                message: "Tanggal harus antara 1 sampai 28",
              },
            ]}
          >
            <InputNumber<number>
              className="!w-full"
              min={1}
              max={28}
              precision={0}
              placeholder="Contoh: 5"
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Batal</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              disabled={availableRooms.length === 0 && !contract}
            >
              {contract ? "Simpan Perubahan" : "Buat Kontrak"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
