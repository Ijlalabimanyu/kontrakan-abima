import { Card, Col, Row, Statistic } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DollarOutlined,
  FileTextOutlined,
  RiseOutlined,
} from "@ant-design/icons";

import type { ReportSummary as ReportSummaryModel } from "@/services/reports/interface";

interface ReportSummaryProps {
  summary: ReportSummaryModel;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function ReportSummary({ summary }: ReportSummaryProps) {
  const cards = [
    {
      title: "Total Pemasukan",
      value: summary.total_income,
      icon: <ArrowUpOutlined />,
      color: "#16a34a",
      isCurrency: true,
    },
    {
      title: "Total Pengeluaran",
      value: summary.total_expenses,
      icon: <ArrowDownOutlined />,
      color: "#dc2626",
      isCurrency: true,
    },
    {
      title: "Keuntungan Bersih",
      value: summary.net_profit,
      icon: <RiseOutlined />,
      color: summary.net_profit >= 0 ? "#16a34a" : "#dc2626",
      isCurrency: true,
    },
    {
      title: "Total Transaksi",
      value: summary.total_transactions,
      icon: <FileTextOutlined />,
      color: "#1677ff",
      isCurrency: false,
    },
    {
      title: "Transaksi Pengeluaran",
      value: summary.total_expense_transactions,
      icon: <DollarOutlined />,
      color: "#fa8c16",
      isCurrency: false,
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {cards.map((card) => (
        <Col xs={24} sm={12} xl={8} key={card.title}>
          <Card>
            <Statistic
              title={card.title}
              value={card.value}
              prefix={<span style={{ color: card.color }}>{card.icon}</span>}
              formatter={(value) =>
                card.isCurrency
                  ? formatCurrency(Number(value))
                  : Number(value).toLocaleString("id-ID")
              }
              valueStyle={{
                fontSize: 20,
                fontWeight: 600,
                color:
                  card.title === "Keuntungan Bersih" ? card.color : undefined,
              }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
