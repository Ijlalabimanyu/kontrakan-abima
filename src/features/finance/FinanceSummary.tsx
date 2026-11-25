import { Card, Col, Row, Statistic, Tag } from "antd";
import {
  DollarOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  RiseOutlined,
  WalletOutlined,
} from "@ant-design/icons";

import type { FinanceSummaryModel } from "@/services/finance/interface";

interface FinanceSummaryProps {
  summary: FinanceSummaryModel;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function FinanceSummary({ summary }: FinanceSummaryProps) {
  const cards = [
    {
      title: "Total Piutang",
      value: summary.total_receivables,
      icon: <FileTextOutlined />,
      color: "#1677ff",
      isCount: false,
    },
    {
      title: "Piutang Terlambat",
      value: summary.total_overdue,
      icon: <ExclamationCircleOutlined />,
      color: "#ff4d4f",
      isCount: false,
    },
    {
      title: "Total Pemasukan",
      value: summary.total_income_this_month,
      icon: <WalletOutlined />,
      color: "#52c41a",
      isCount: false,
    },
    {
      title: "Total Pengeluaran",
      value: summary.total_expenses_this_month,
      icon: <DollarOutlined />,
      color: "#fa8c16",
      isCount: false,
    },
    {
      title: "Keuntungan Bersih",
      value: summary.net_profit_this_month,
      icon: <RiseOutlined />,
      color: summary.net_profit_this_month >= 0 ? "#52c41a" : "#ff4d4f",
      isCount: false,
    },
    {
      title: "Invoice Belum Lunas",
      value: summary.total_invoices,
      icon: <DollarOutlined />,
      color: "#722ed1",
      isCount: true,
    },
  ];

  return (
    <div className="space-y-4">
      <Row gutter={[16, 16]}>
        {cards.map((card) => (
          <Col xs={24} sm={12} xl={8} key={card.title}>
            <Card>
              <Statistic
                title={card.title}
                value={card.value}
                formatter={(value) =>
                  card.isCount
                    ? Number(value).toLocaleString("id-ID")
                    : formatCurrency(Number(value))
                }
                prefix={
                  <span style={{ color: card.color }}>{card.icon}</span>
                }
                valueStyle={{
                  fontSize: 20,
                  fontWeight: 600,
                  color:
                    card.title === "Keuntungan Bersih"
                      ? card.color
                      : undefined,
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Aging Piutang">
        <Row gutter={[16, 16]}>
          <Col xs={12} md={6}>
            <div className="space-y-1">
              <Tag color="success">Belum Jatuh Tempo</Tag>
              <div className="text-lg font-semibold">
                {formatCurrency(summary.total_not_due)}
              </div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="space-y-1">
              <Tag color="warning">1–30 Hari</Tag>
              <div className="text-lg font-semibold">
                {formatCurrency(summary.aging_1_30)}
              </div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="space-y-1">
              <Tag color="orange">31–60 Hari</Tag>
              <div className="text-lg font-semibold">
                {formatCurrency(summary.aging_31_60)}
              </div>
            </div>
          </Col>
          <Col xs={12} md={6}>
            <div className="space-y-1">
              <Tag color="error">Lebih dari 60 Hari</Tag>
              <div className="text-lg font-semibold">
                {formatCurrency(summary.aging_over_60)}
              </div>
            </div>
          </Col>
        </Row>

        <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-500">
          <span>{summary.total_invoices} invoice belum lunas</span>
          <span>•</span>
          <span>{summary.overdue_invoices} invoice terlambat</span>
          <span>•</span>
          <span>
            {summary.total_payments_this_month} transaksi pembayaran
          </span>
        </div>
      </Card>
    </div>
  );
}
