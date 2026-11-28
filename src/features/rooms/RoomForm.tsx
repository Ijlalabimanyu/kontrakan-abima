"use client";

import { useTransition } from "react";
import { Form, message } from "antd";
import {
  Button,
  Input,
  Modal,
  NumberInput,
  Select,
  TextArea,
} from "@/components/ui";
import type { PropertyModel } from "@/services/properties/interface";
import { createRoom, updateRoom } from "@/services/rooms/actions";
import type { RoomActionState } from "@/services/rooms/actions";
import type { RoomFormValues, RoomModel } from "@/services/rooms/interfaces";

interface RoomFormProps {
  open: boolean;
  room: RoomModel | null;
  properties: PropertyModel[];
  onClose: () => void;
  onSuccess: () => void;
}

interface RoomFormContentProps {
  room: RoomModel | null;
  properties: PropertyModel[];
  onClose: () => void;
  onSuccess: () => void;
}

const initialState: RoomActionState = {
  success: false,
  message: "",
};

const RoomFormContent = ({
  room,
  properties,
  onClose,
  onSuccess,
}: RoomFormContentProps) => {
  const [form] = Form.useForm<RoomFormValues>();
  const [isPending, startTransition] = useTransition();
  const [messageApi, contextHolder] = message.useMessage();
  const isOccupied = room?.status === "OCCUPIED";

  const initialValues: RoomFormValues = {
    property_id: room?.property_id ?? properties[0]?.id ?? "",
    room_number: room?.room_number ?? "",
    monthly_price: room?.monthly_price ?? 0,
    status: room?.status === "MAINTENANCE" ? "MAINTENANCE" : "AVAILABLE",
    description: room?.description ?? "",
  };

  const handleSubmit = (values: RoomFormValues) => {
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
      try {
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
      } catch {
        messageApi.error("Terjadi kesalahan saat menyimpan kamar.");
      }
    });
  };

  return (
    <>
      {contextHolder}

      <Form<RoomFormValues>
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        requiredMark="optional"
        disabled={isPending}
      >
        {/* Property */}
        <Form.Item
          name="property_id"
          label="Properti"
          rules={[
            {
              required: true,
              message: "Pilih properti.",
            },
          ]}
        >
          <Select
            placeholder="Pilih properti"
            options={properties.map((property) => ({
              label: property.name,
              value: property.id,
            }))}
            disabled={properties.length === 0}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        {/* Room Number */}
        <Form.Item
          name="room_number"
          label="Nomor Kamar"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Nomor kamar wajib diisi.",
            },
            {
              max: 50,
              message: "Maksimal 50 karakter.",
            },
          ]}
        >
          <Input placeholder="Contoh: 01 atau A-01" maxLength={50} />
        </Form.Item>

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

        {/* Room Status */}
        {isOccupied ? (
          <>
            {/*
              Hidden value tetap dikirim agar sesuai dengan RoomFormValues
              dan roomSchema. Server action mengabaikannya untuk kamar
              yang masih occupied atau mempunyai kontrak aktif.
            */}
            <Form.Item name="status" hidden>
              <Input />
            </Form.Item>

            <div className="mb-5 rounded-lg border border-info/20 bg-info-soft p-3">
              <p className="text-sm font-semibold text-info">
                Kamar Sedang Terisi
              </p>

              <p className="mt-1 text-xs leading-5 text-muted">
                Status kamar dikelola berdasarkan kontrak aktif. Kamu tetap
                dapat mengubah informasi kamar tanpa mengubah status
                okupansinya.
              </p>
            </div>
          </>
        ) : (
          <Form.Item
            name="status"
            label="Status Kamar"
            rules={[
              {
                required: true,
                message: "Pilih status kamar.",
              },
            ]}
          >
            <Select
              placeholder="Pilih status kamar"
              options={[
                {
                  label: "Tersedia",
                  value: "AVAILABLE",
                },
                {
                  label: "Maintenance",
                  value: "MAINTENANCE",
                },
              ]}
            />
          </Form.Item>
        )}

        {/* Description */}
        <Form.Item
          name="description"
          label="Deskripsi"
          rules={[
            {
              max: 1000,
              message: "Maksimal 1000 karakter.",
            },
          ]}
        >
          <TextArea
            rows={4}
            maxLength={1000}
            showCount
            placeholder="Tambahkan keterangan kamar (opsional)"
          />
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
            disabled={properties.length === 0}
            block
            className="sm:w-auto!"
          >
            {room ? "Simpan Perubahan" : "Tambah Kamar"}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default function RoomForm({
  open,
  room,
  properties,
  onClose,
  onSuccess,
}: RoomFormProps) {
  const isEditing = Boolean(room);

  return (
    <Modal
      open={open}
      title={
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">
            {isEditing ? "Edit Kamar" : "Tambah Kamar"}
          </h2>

          <p className="text-xs font-normal text-muted">
            {isEditing
              ? "Perbarui informasi dan konfigurasi kamar."
              : "Lengkapi informasi kamar untuk properti Anda."}
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
        <RoomFormContent
          key={room?.id ?? "new-room"}
          room={room}
          properties={properties}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
