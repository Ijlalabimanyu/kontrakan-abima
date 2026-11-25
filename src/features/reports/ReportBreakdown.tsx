import { Card, Col, Empty, Progress, Row } from "antd";

import type {
  ExpenseCategorySummary,
  IncomeMethodSummary,
} from "@/services/reports/interface";

interface ReportBreakdownProps {
  incomeMethods: IncomeMethodSummary[];
  expenseCategories: ExpenseCategorySummary[];
}

const currency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
const methodLabels: Record<string, string> = {
  CASH: "Tunai",
  TRANSFER: "Transfer",
  QRIS: "QRIS",
};
const categoryLabels: Record<string, string> = {
  ELECTRICITY: "Listrik",
  WATER: "Air",
  INTERNET: "Internet / WiFi",
  MAINTENANCE: "Maintenance",
  CLEANING: "Kebersihan",
  SUPPLIES: "Perlengkapan",
  TAX: "Pajak",
  OTHER: "Lainnya",
};

export default function ReportBreakdown({
  incomeMethods,
  expenseCategories,
}: ReportBreakdownProps) {
  const totalIncome = incomeMethods.reduce(
    (sum, item) => sum + item.total_amount,
    0,
  );
  const totalExpenses = expenseCategories.reduce(
    (sum, item) => sum + item.total_amount,
    0,
  );

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} xl={12}>
        <Card title="Pemasukan Berdasarkan Metode">
          {incomeMethods.length === 0 ? (
            <Empty description="Belum ada pemasukan" />
          ) : (
            <div className="space-y-5">
              {incomeMethods.map((item) => (
                <div key={item.payment_method}>
                  <div className="mb-1 flex justify-between gap-3 text-sm">
                    <span>{methodLabels[item.payment_method]}</span>
                    <span className="font-semibold">
                      {currency(item.total_amount)}
                    </span>
                  </div>
                  <Progress
                    percent={
                      totalIncome > 0
                        ? (item.total_amount / totalIncome) * 100
                        : 0
                    }
                    showInfo={false}
                    strokeColor="#16a34a"
                  />
                  <span className="text-xs text-slate-500">
                    {item.total_transactions} transaksi
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Col>
      <Col xs={24} xl={12}>
        <Card title="Pengeluaran Berdasarkan Kategori">
          {expenseCategories.length === 0 ? (
            <Empty description="Belum ada pengeluaran" />
          ) : (
            <div className="space-y-5">
              {expenseCategories.map((item) => (
                <div key={item.category}>
                  <div className="mb-1 flex justify-between gap-3 text-sm">
                    <span>{categoryLabels[item.category]}</span>
                    <span className="font-semibold">
                      {currency(item.total_amount)}
                    </span>
                  </div>
                  <Progress
                    percent={
                      totalExpenses > 0
                        ? (item.total_amount / totalExpenses) * 100
                        : 0
                    }
                    showInfo={false}
                    strokeColor="#f97316"
                  />
                  <span className="text-xs text-slate-500">
                    {item.total_transactions} transaksi
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
}
