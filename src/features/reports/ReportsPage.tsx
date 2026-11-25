"use client";

import { useState } from "react";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  DatePicker,
  message,
  Select,
  Spin,
  Tabs,
  Typography,
} from "antd";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

import { getFinancialReportAction } from "@/services/reports/actions";

import ExpenseReportTable from "./ExpenseReportTable";
import FinancialTrendChart from "./FinancialTrendChart";
import IncomeReportTable from "./IncomeReportTable";
import ReportBreakdown from "./ReportBreakdown";
import ReportSummary from "./ReportSummary";
import type {
  FinancialReportData,
  ReportFilterValues,
  ReportPeriodType,
} from "@/services/reports/interface";

interface ReportsPageProps {
  initialData: FinancialReportData;
}

const getInitialDate = (filter: ReportFilterValues) =>
  filter.period_type === "MONTHLY"
    ? dayjs(`${filter.year}-${String(filter.month ?? 1).padStart(2, "0")}-01`)
    : dayjs(`${filter.year}-01-01`);

export default function ReportsPage({ initialData }: ReportsPageProps) {
  const [report, setReport] = useState(initialData);
  const [periodType, setPeriodType] = useState<ReportPeriodType>(
    initialData.filter.period_type,
  );
  const [selectedDate, setSelectedDate] = useState(
    getInitialDate(initialData.filter),
  );
  const [loading, setLoading] = useState(false);

  const handleFilter = async (
    nextType: ReportPeriodType,
    nextDate: dayjs.Dayjs,
  ) => {
    const filter: ReportFilterValues = {
      period_type: nextType,
      year: nextDate.year(),
      ...(nextType === "MONTHLY" && { month: nextDate.month() + 1 }),
    };
    setLoading(true);
    try {
      setReport(await getFinancialReportAction(filter));
    } catch (error) {
      console.error("getFinancialReportAction error:", error);
      message.error(
        error instanceof Error
          ? error.message
          : "Gagal mengambil laporan keuangan",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodTypeChange = (value: ReportPeriodType) => {
    setPeriodType(value);
    void handleFilter(value, selectedDate);
  };
  const handleDateChange = (value: dayjs.Dayjs | null) => {
    if (!value) return;
    setSelectedDate(value);
    void handleFilter(periodType, value);
  };
  const handleReset = () => {
    const now = dayjs();
    setPeriodType("MONTHLY");
    setSelectedDate(now);
    void handleFilter("MONTHLY", now);
  };
  const handleExport = () => {
    try {
      const workbook = XLSX.utils.book_new();
      const summaryRows: (string | number)[][] = [
        ["LAPORAN KEUANGAN KONTRAKAN"],
        [
          "Periode",
          report.filter.period_type === "MONTHLY"
            ? dayjs(
                `${report.filter.year}-${report.filter.month ?? 1}-01`,
              ).format("MMMM YYYY")
            : String(report.filter.year),
        ],
        [],
        ["Keterangan", "Nominal"],
        ["Total Pemasukan", report.summary.total_income],
        ["Total Pengeluaran", report.summary.total_expenses],
        ["Keuntungan Bersih", report.summary.net_profit],
        ["Jumlah Transaksi Pemasukan", report.summary.total_transactions],
        [
          "Jumlah Transaksi Pengeluaran",
          report.summary.total_expense_transactions,
        ],
      ];
      const trendRows: (string | number)[][] = [
        ["Bulan", "Pemasukan", "Pengeluaran", "Keuntungan Bersih"],
        ...report.trends.map((item) => [
          item.label,
          item.income,
          item.expenses,
          item.net_profit,
        ]),
      ];
      const incomeRows: (string | number)[][] = [
        [
          "No. Pembayaran",
          "Tanggal",
          "No. Invoice",
          "Penyewa",
          "Kamar",
          "Metode",
          "Nominal",
        ],
        ...report.payments.map((item) => [
          item.payment_number,
          item.payment_date,
          item.invoice_number,
          item.tenant_name,
          item.room_number,
          item.payment_method,
          item.amount,
        ]),
      ];
      const expenseRows: (string | number)[][] = [
        [
          "No. Pengeluaran",
          "Tanggal",
          "Kategori",
          "Deskripsi",
          "Metode",
          "Nominal",
        ],
        ...report.expenses.map((item) => [
          item.expense_number,
          item.expense_date,
          item.category,
          item.description,
          item.payment_method,
          item.amount,
        ]),
      ];
      const methodRows: (string | number)[][] = [
        ["Metode Pembayaran", "Total Transaksi", "Total Nominal"],
        ...report.income_methods.map((item) => [
          item.payment_method,
          item.total_transactions,
          item.total_amount,
        ]),
      ];
      const categoryRows: (string | number)[][] = [
        ["Kategori", "Total Transaksi", "Total Nominal"],
        ...report.expense_categories.map((item) => [
          item.category,
          item.total_transactions,
          item.total_amount,
        ]),
      ];
      const sheets: [string, (string | number)[][]][] = [
        ["Ringkasan", summaryRows],
        ["Tren Bulanan", trendRows],
        ["Pemasukan", incomeRows],
        ["Pengeluaran", expenseRows],
        ["Metode Pembayaran", methodRows],
        ["Kategori Pengeluaran", categoryRows],
      ];
      sheets.forEach(([name, rows]) =>
        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.aoa_to_sheet(rows),
          name,
        ),
      );
      const period =
        report.filter.period_type === "MONTHLY"
          ? `${report.filter.year}-${String(report.filter.month ?? 1).padStart(2, "0")}`
          : String(report.filter.year);
      XLSX.writeFile(workbook, `laporan-keuangan-${period}.xlsx`);
      message.success("Laporan Excel berhasil dibuat");
    } catch (error) {
      console.error("handleExport error:", error);
      message.error("Gagal mengekspor laporan");
    }
  };

  const tabItems = [
    {
      key: "summary",
      label: "Ringkasan",
      children: (
        <div className="space-y-4">
          <ReportSummary summary={report.summary} />
          <FinancialTrendChart data={report.trends} />
          <ReportBreakdown
            incomeMethods={report.income_methods}
            expenseCategories={report.expense_categories}
          />
        </div>
      ),
    },
    {
      key: "income",
      label: `Pemasukan (${report.payments.length})`,
      children: <IncomeReportTable data={report.payments} />,
    },
    {
      key: "expenses",
      label: `Pengeluaran (${report.expenses.length})`,
      children: <ExpenseReportTable data={report.expenses} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Title level={3} className="!mb-1">
            Laporan Keuangan
          </Typography.Title>
          <Typography.Text type="secondary">
            Rekap pemasukan, pengeluaran, dan keuntungan kontrakan.
          </Typography.Text>
        </div>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
          disabled={loading}
        >
          Export Excel
        </Button>
      </div>
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={periodType}
            onChange={handlePeriodTypeChange}
            className="w-full sm:w-44"
            options={[
              { label: "Bulanan", value: "MONTHLY" },
              { label: "Tahunan", value: "YEARLY" },
            ]}
          />
          <DatePicker
            picker={periodType === "MONTHLY" ? "month" : "year"}
            format={periodType === "MONTHLY" ? "MMMM YYYY" : "YYYY"}
            value={selectedDate}
            onChange={handleDateChange}
            allowClear={false}
            className="w-full sm:w-48"
          />
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Periode Saat Ini
          </Button>
        </div>
      </Card>
      <Spin spinning={loading}>
        <Tabs
          defaultActiveKey="summary"
          items={tabItems}
          destroyOnHidden={false}
        />
      </Spin>
    </div>
  );
}
