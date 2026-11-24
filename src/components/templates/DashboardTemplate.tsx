"use client";

import { Card, Col, Row, Statistic, Typography } from "antd";
import {
  DollarOutlined,
  HomeOutlined,
  TeamOutlined,
  WalletOutlined,
} from "@ant-design/icons";

interface DashboardTemplateProps {
  occupancy: {
    total: number;
    occupied: number;
    available: number;
    maintenance: number;
  };
}

export default function DashboardTemplate({
  occupancy,
}: DashboardTemplateProps) {
  const summary = [
    { title: "Total Kamar", value: occupancy.total, icon: <HomeOutlined /> },
    {
      title: "Kamar Terisi",
      value: occupancy.occupied,
      icon: <TeamOutlined />,
    },
    {
      title: "Pemasukan Bulan Ini",
      value: 0,
      prefix: "Rp",
      icon: <WalletOutlined />,
    },
    {
      title: "Pengeluaran Bulan Ini",
      value: 0,
      prefix: "Rp",
      icon: <DollarOutlined />,
    },
  ];

  const occupancyRate =
    occupancy.total === 0
      ? 0
      : Math.round((occupancy.occupied / occupancy.total) * 100);

  return (
    <div className="space-y-6">
      <div>
        <Typography.Title level={3}>Dashboard</Typography.Title>
        <Typography.Text type="secondary">
          Selamat datang di Kontrakan Abima Management.
        </Typography.Text>
      </div>

      <Row gutter={[16, 16]}>
        {summary.map((item) => (
          <Col xs={24} sm={12} xl={6} key={item.title}>
            <Card>
              <Statistic
                title={item.title}
                value={item.value}
                prefix={item.prefix}
                suffix={item.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Ringkasan Okupansi">
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Statistic
              title="Occupancy Rate"
              value={occupancyRate}
              suffix="%"
            />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="Total Kamar" value={occupancy.total} />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="Tersedia" value={occupancy.available} />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title="Maintenance" value={occupancy.maintenance} />
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={16}>
          <Card title="Ringkasan Keuangan">
            <div className="flex min-h-64 items-center justify-center text-slate-400">
              Grafik keuangan akan tersedia pada Phase 5.
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title="Aktivitas Terbaru">
            <div className="flex min-h-64 items-center justify-center text-slate-400">
              Belum ada aktivitas.
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
