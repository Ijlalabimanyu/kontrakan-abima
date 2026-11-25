"use client";

import { useEffect, useTransition } from "react";
import { Button, Form, Input, InputNumber, Modal, Select, message } from "antd";

import { PropertyModel } from "@/services/properties/property.interface";
import {
  createRoom,
  updateRoom,
  RoomActionState,
} from "@/services/rooms/actions";
import { RoomModel } from "@/services/rooms/interfaces";

interface RoomFormProps {
  open: boolean;
  room: RoomModel | null;
  properties: PropertyModel[];
  onClose: () => void;
  onSuccess: () => void;
}

interface RoomFormInput {
  property_id: string;
  room_number: string;
  monthly_price: number;
  status: "AVAILABLE" | "MAINTENANCE";
  description: string;
}

const initialState: RoomActionState = {
  success: false,
  message: "",
};

export default function RoomForm({
  open,
  room,
  properties,
  onClose,
  onSuccess,
}: RoomFormProps) {
  const [form] = Form.useForm<RoomFormInput>();
  const [isPending, startTransition] = useTransition();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!open) return;

    form.setFieldsValue({
      property_id: room?.property_id ?? properties[0]?.id,
      room_number: room?.room_number ?? "",
      monthly_price: room?.monthly_price ?? undefined,
      status: room?.status === "MAINTENANCE" ? "MAINTENANCE" : "AVAILABLE",
      description: room?.description ?? "",
    });
  }, [open, room, properties, form]);

  const handleSubmit = (values: RoomFormInput) => {
    const formData = new FormData();

    if (room) {
      formData.append("id", room.id);
    }

    formData.append("property_id", values.property_id);
    formData.append("room_number", values.room_number);
    formData.append("monthly_price", String(values.monthly_price));
    formData.append("status", values.status);
    formData.append("description", values.description ?? "");

    startTransition(async () => {
      const result = room
        ? await updateRoom(initialState, formData)
        : await createRoom(initialState, formData);

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
        title={room ? "Edit Kamar" : "Tambah Kamar"}
        open={open}
        onCancel={onClose}
        footer={null}
        destroyOnHidden
        width={520}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item
            name="property_id"
            label="Properti"
            rules={[{ required: true, message: "Pilih properti" }]}
          >
            <Select
              placeholder="Pilih properti"
              options={properties.map((property) => ({
                label: property.name,
                value: property.id,
              }))}
              disabled={properties.length === 0}
            />
          </Form.Item>

          <Form.Item
            name="room_number"
            label="Nomor Kamar"
            rules={[
              { required: true, message: "Nomor kamar wajib diisi" },
              { max: 50, message: "Maksimal 50 karakter" },
            ]}
          >
            <Input placeholder="Contoh: 01 atau A-01" maxLength={50} />
          </Form.Item>

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
              min={1}
              precision={2}
              placeholder="Contoh: 1000000"
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

          {room?.status === "OCCUPIED" && (
            <>
              <Form.Item name="status" hidden>
                <Input />
              </Form.Item>
              <p className="mb-4 text-sm text-blue-600">
                Status kamar sedang terisi dan dikelola berdasarkan kontrak
                yang berlaku.
              </p>
            </>
          )}

          {room?.status !== "OCCUPIED" && (
            <Form.Item
              name="status"
              label="Status Kamar"
              rules={[{ required: true, message: "Pilih status kamar" }]}
            >
              <Select
                options={[
                  { label: "Tersedia", value: "AVAILABLE" },
                  { label: "Maintenance", value: "MAINTENANCE" },
                ]}
              />
            </Form.Item>
          )}

          <Form.Item name="description" label="Deskripsi">
            <Input.TextArea
              rows={3}
              maxLength={1000}
              showCount
              placeholder="Keterangan tambahan kamar..."
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Batal</Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={isPending}
              disabled={properties.length === 0}
            >
              {room ? "Simpan Perubahan" : "Tambah Kamar"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
