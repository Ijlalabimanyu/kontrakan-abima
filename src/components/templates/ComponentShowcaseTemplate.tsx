"use client";

import { useState } from "react";
import {
  BankOutlined,
  HomeOutlined,
  PlusOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";

import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DatePicker,
  Drawer,
  EmptyState,
  Input,
  Modal,
  RangePicker,
  Select,
  Skeleton,
  SkeletonCard,
  SkeletonList,
  StatCard,
  Tooltip,
} from "@/components/ui";

const propertyOptions = [
  {
    label: "Kontrakan Abima Bekasi",
    value: "property-1",
  },
  {
    label: "Kontrakan Abima Tambun",
    value: "property-2",
  },
];

export default function ComponentShowcaseTemplate() {
  const [property, setProperty] = useState<string>();
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <section className="space-y-2">
          <Badge tone="brand">Design System</Badge>

          <h1 className="text-2xl font-bold text-foreground">
            Component Showcase
          </h1>

          <p className="text-sm text-muted">
            Preview seluruh global components Kontrakan Abima.
          </p>
        </section>

        {/* Buttons */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Buttons</h2>

          <Card>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>

              <Button variant="secondary">Secondary</Button>

              <Button variant="outline">Outline</Button>

              <Button variant="ghost">Ghost</Button>

              <Button variant="danger">Danger</Button>

              <Button loading>Loading</Button>

              <Button disabled>Disabled</Button>
            </div>
          </Card>
        </section>

        {/* Badges */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Status Badges</h2>

          <Card>
            <div className="flex flex-wrap gap-3">
              <Badge tone="success" dot>
                Lunas
              </Badge>

              <Badge tone="warning" dot>
                Pending
              </Badge>

              <Badge tone="danger" dot>
                Terlambat
              </Badge>

              <Badge tone="info">Informasi</Badge>

              <Badge tone="neutral">Draft</Badge>

              <Badge tone="brand">Aktif</Badge>
            </div>
          </Card>
        </section>

        {/* Form Controls */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Form Controls</h2>

          <Card>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nama Properti</label>

                <Input placeholder="Masukkan nama properti" allowClear />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pilih Properti</label>

                <Select
                  value={property}
                  options={propertyOptions}
                  placeholder="Pilih properti"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  onChange={setProperty}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tanggal Mulai</label>

                <DatePicker className="w-full" placeholder="Pilih tanggal" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Periode Laporan</label>

                <RangePicker className="w-full" />
              </div>
            </div>
          </Card>
        </section>

        {/* KPI Cards */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Stat Cards</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Properti"
              value={4}
              icon={<BankOutlined />}
              iconTone="brand"
            />

            <StatCard
              title="Total Kamar"
              value={32}
              icon={<HomeOutlined />}
              iconTone="neutral"
            />

            <StatCard
              title="Kamar Terisi"
              value={28}
              icon={<TeamOutlined />}
              iconTone="success"
              trend={{
                value: "87,5%",
                label: "Tingkat okupansi",
                tone: "success",
              }}
            />

            <StatCard
              title="Pendapatan Bulan Ini"
              value={12500000}
              prefix="Rp"
              icon={<WalletOutlined />}
              iconTone="brand"
            />
          </div>
        </section>

        {/* Cards */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Cards</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card title="Default Card">Tampilan card standar.</Card>

            <Card title="Outlined Card" appearance="outlined">
              Card dengan border.
            </Card>

            <Card title="Elevated Card" appearance="elevated">
              Card dengan shadow lembut.
            </Card>
          </div>
        </section>

        {/* Feedback */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Feedback Components</h2>

          <Card>
            <EmptyState
              title="Belum ada data"
              description="Data akan ditampilkan setelah tersedia."
              size="small"
            />
          </Card>

          <Card title="Skeleton">
            <Skeleton active paragraph={{ rows: 3 }} />
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SkeletonCard rows={2} />
            <SkeletonList rows={2} avatar />
          </div>

          <Card title="Tooltip">
            <Tooltip title="Informasi tambahan untuk pengguna">
              <Button variant="outline" icon={<PlusOutlined />}>
                Hover untuk informasi
              </Button>
            </Tooltip>
          </Card>
        </section>

        {/* Overlay */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Modal & Drawer</h2>

          <Card>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setModalOpen(true)}>Open Modal</Button>

              <Button variant="outline" onClick={() => setDrawerOpen(true)}>
                Open Drawer
              </Button>

              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                Open Confirm Dialog
              </Button>
            </div>
          </Card>
        </section>

        <Modal
          open={modalOpen}
          title="Contoh Modal"
          onCancel={() => setModalOpen(false)}
          footer={<Button onClick={() => setModalOpen(false)}>Tutup</Button>}
        >
          Contoh penggunaan global Modal.
        </Modal>

        <Drawer
          open={drawerOpen}
          title="Contoh Drawer"
          onClose={() => setDrawerOpen(false)}
        >
          Contoh penggunaan global Drawer.
        </Drawer>

        <ConfirmDialog
          open={confirmOpen}
          title="Konfirmasi tindakan"
          description="Ini hanya preview komponen. Tidak ada data yang akan dihapus."
          confirmText="Mengerti"
          confirmVariant="primary"
          onConfirm={() => setConfirmOpen(false)}
          onCancel={() => setConfirmOpen(false)}
        />
      </div>
    </main>
  );
}
