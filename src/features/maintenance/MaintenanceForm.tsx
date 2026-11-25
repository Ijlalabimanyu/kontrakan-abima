"use client";

import { useEffect } from "react";
import { Button, DatePicker, Form, Input, Modal, Select } from "antd";
import dayjs from "dayjs";

import type {
  MaintenanceFormValues,
  MaintenanceModel,
  MaintenancePropertyOption,
  MaintenanceRoomOption,
} from "@/services/maintenance/interface";
import {
  createMaintenance,
  updateMaintenance,
} from "@/services/maintenance/actions";

const { TextArea } = Input;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  properties: MaintenancePropertyOption[];
  rooms: MaintenanceRoomOption[];
  initialData?: MaintenanceModel | null;
}

export default function MaintenanceForm({
  open,
  onClose,
  onSuccess,
  properties,
  rooms,
  initialData,
}: Props) {
  const [form] = Form.useForm();
  const propertyId = Form.useWatch("property_id", form);

  useEffect(() => {
    if (!open) return;

    form.resetFields();
    if (initialData) {
      form.setFieldsValue({
        property_id: initialData.property_id,
        room_id: initialData.room_id ?? "",
        title: initialData.title,
        description: initialData.description,
        category: initialData.category,
        priority: initialData.priority,
        scheduled_date: initialData.scheduled_date
          ? dayjs(initialData.scheduled_date)
          : null,
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = async (values: Record<string, unknown>) => {
    const payload: MaintenanceFormValues = {
      property_id: values.property_id as string,
      room_id: (values.room_id as string) || "",
      title: values.title as string,
      description: values.description as string,
      category: values.category as MaintenanceFormValues["category"],
      priority: values.priority as MaintenanceFormValues["priority"],
      scheduled_date: values.scheduled_date
        ? (values.scheduled_date as dayjs.Dayjs).format("YYYY-MM-DD")
        : null,
    };
    const result = initialData
      ? await updateMaintenance(initialData.id, payload)
      : await createMaintenance(payload);

    if (!result.success) {
      Modal.error({ title: "Gagal", content: result.message });
      return;
    }

    Modal.success({ title: "Berhasil", content: result.message });
    onSuccess();
    onClose();
  };

  return (
    <Modal
      title={initialData ? "Edit Maintenance" : "Buat Laporan Maintenance"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={650}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ room_id: "", priority: "MEDIUM" }}
      >
        <Form.Item
          name="property_id"
          label="Properti"
          rules={[{ required: true, message: "Pilih properti" }]}
        >
          <Select
            placeholder="Pilih properti"
            options={properties.map((item) => ({
              label: item.name,
              value: item.id,
            }))}
            onChange={() => form.setFieldValue("room_id", "")}
          />
        </Form.Item>

        <Form.Item name="room_id" label="Kamar (opsional)">
          <Select
            allowClear
            disabled={!propertyId}
            placeholder={
              propertyId ? "Pilih kamar" : "Pilih properti terlebih dahulu"
            }
            options={rooms
              .filter((room) => room.property_id === propertyId)
              .map((room) => ({ label: room.room_number, value: room.id }))}
          />
        </Form.Item>

        <Form.Item
          name="title"
          label="Judul"
          rules={[
            { required: true, message: "Judul wajib diisi" },
            { min: 3, message: "Minimal 3 karakter" },
            { max: 150, message: "Maksimal 150 karakter" },
          ]}
        >
          <Input placeholder="Contoh: AC kamar 02 tidak dingin" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Deskripsi"
          rules={[
            { required: true, message: "Deskripsi wajib diisi" },
            { min: 5, message: "Minimal 5 karakter" },
          ]}
        >
          <TextArea rows={4} placeholder="Jelaskan kerusakan..." />
        </Form.Item>

        <Form.Item
          name="category"
          label="Kategori"
          rules={[{ required: true, message: "Pilih kategori" }]}
        >
          <Select
            placeholder="Pilih kategori"
            options={[
              { label: "Elektrikal", value: "ELECTRICAL" },
              { label: "Plumbing", value: "PLUMBING" },
              { label: "AC", value: "AC" },
              { label: "Furniture", value: "FURNITURE" },
              { label: "Bangunan", value: "BUILDING" },
              { label: "Internet", value: "INTERNET" },
              { label: "Lainnya", value: "OTHER" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="priority"
          label="Prioritas"
          rules={[{ required: true, message: "Pilih prioritas" }]}
        >
          <Select
            options={[
              { label: "Rendah", value: "LOW" },
              { label: "Sedang", value: "MEDIUM" },
              { label: "Tinggi", value: "HIGH" },
              { label: "Urgent", value: "URGENT" },
            ]}
          />
        </Form.Item>

        <Form.Item name="scheduled_date" label="Tanggal rencana pengerjaan">
          <DatePicker className="w-full" format="DD MMM YYYY" />
        </Form.Item>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Batal</Button>
          <Button type="primary" htmlType="submit">
            {initialData ? "Simpan Perubahan" : "Buat Laporan"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
