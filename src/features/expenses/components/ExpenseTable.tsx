"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  message,
} from "antd";
import type { TableColumnsType } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

import { deleteExpense } from "@/services/expenses/actions";
import type {
  ExpenseCategory,
  ExpenseFilterValues,
  ExpenseModel,
  ExpensePaymentMethod,
} from "../interfaces/expense.interface";
import ExpenseForm from "./ExpenseForm";

interface ExpenseTableProps {
  data: ExpenseModel[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const categoryLabels: Record<ExpenseCategory, string> = {
  ELECTRICITY: "Listrik",
  WATER: "Air",
  INTERNET: "Internet / WiFi",
  MAINTENANCE: "Maintenance",
  CLEANING: "Kebersihan",
  SUPPLIES: "Perlengkapan",
  TAX: "Pajak",
  OTHER: "Lainnya",
};

const paymentMethodLabels: Record<ExpensePaymentMethod, string> = {
  CASH: "Tunai",
  TRANSFER: "Transfer",
  QRIS: "QRIS",
};

const categoryOptions = Object.entries(categoryLabels).map(
  ([value, label]) => ({ value, label }),
);

const paymentMethodOptions = Object.entries(paymentMethodLabels).map(
  ([value, label]) => ({ value, label }),
);

export default function ExpenseTable({ data }: ExpenseTableProps) {
  const [filters, setFilters] = useState<ExpenseFilterValues>({
    search: "",
    category: null,
    payment_method: null,
    expense_date: null,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseModel | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();

  const filteredExpenses = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase();

    return data.filter((expense) => {
      const matchesSearch =
        !keyword ||
        expense.expense_number.toLowerCase().includes(keyword) ||
        expense.description.toLowerCase().includes(keyword) ||
        (expense.reference_number ?? "").toLowerCase().includes(keyword);
      const matchesCategory =
        !filters.category || expense.category === filters.category;
      const matchesMethod =
        !filters.payment_method ||
        expense.payment_method === filters.payment_method;
      const matchesDate =
        !filters.expense_date || expense.expense_date === filters.expense_date;

      return matchesSearch && matchesCategory && matchesMethod && matchesDate;
    });
  }, [data, filters]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);

    try {
      const result = await deleteExpense(id);

      if (!result.success) {
        messageApi.error(result.message);
        return;
      }

      messageApi.success(result.message);
      router.refresh();
    } catch (error) {
      console.error("handleExpenseDelete error:", error);
      messageApi.error("Terjadi kesalahan saat menghapus pengeluaran");
    } finally {
      setDeletingId(null);
    }
  };

  const columns: TableColumnsType<ExpenseModel> = [
    {
      title: "No. Pengeluaran",
      dataIndex: "expense_number",
      key: "expense_number",
      width: 190,
    },
    {
      title: "Tanggal",
      dataIndex: "expense_date",
      key: "expense_date",
      width: 130,
      sorter: (a, b) => a.expense_date.localeCompare(b.expense_date),
      render: (value: string) => dayjs(value).format("DD MMM YYYY"),
    },
    {
      title: "Kategori",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (value: ExpenseCategory) => categoryLabels[value],
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      width: 240,
    },
    {
      title: "Metode",
      dataIndex: "payment_method",
      key: "payment_method",
      width: 120,
      render: (value: ExpensePaymentMethod) => paymentMethodLabels[value],
    },
    {
      title: "Nominal",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 160,
      sorter: (a, b) => a.amount - b.amount,
      render: (value: number) => (
        <span className="font-semibold">{formatCurrency(value)}</span>
      ),
    },
    {
      title: "Aksi",
      key: "actions",
      align: "center",
      width: 130,
      render: (_, expense) => (
        <Space>
          <Button
            type="text"
            aria-label={`Edit ${expense.expense_number}`}
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedExpense(expense);
              setFormOpen(true);
            }}
          />
          <Popconfirm
            title="Hapus pengeluaran ini?"
            description={expense.expense_number}
            okText="Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true, loading: deletingId === expense.id }}
            disabled={deletingId !== null}
            onConfirm={() => void handleDelete(expense.id)}
          >
            <Button
              type="text"
              danger
              aria-label={`Hapus ${expense.expense_number}`}
              icon={<DeleteOutlined />}
              disabled={deletingId !== null}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}

      <Card
        title="Daftar Pengeluaran"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedExpense(null);
              setFormOpen(true);
            }}
          >
            Tambah Pengeluaran
          </Button>
        }
      >
        <div className="mb-4 flex flex-wrap gap-3">
          <Input
            allowClear
            placeholder="Cari nomor atau deskripsi"
            value={filters.search}
            onChange={(event) =>
              setFilters((previous) => ({
                ...previous,
                search: event.target.value,
              }))
            }
            className="w-full md:max-w-xs"
          />

          <Select<ExpenseCategory>
            allowClear
            placeholder="Kategori"
            options={categoryOptions}
            value={filters.category}
            onChange={(value) =>
              setFilters((previous) => ({
                ...previous,
                category: value ?? null,
              }))
            }
            className="w-full md:w-48"
          />

          <Select<ExpensePaymentMethod>
            allowClear
            placeholder="Metode pembayaran"
            options={paymentMethodOptions}
            value={filters.payment_method}
            onChange={(value) =>
              setFilters((previous) => ({
                ...previous,
                payment_method: value ?? null,
              }))
            }
            className="w-full md:w-48"
          />

          <DatePicker
            allowClear
            placeholder="Tanggal pengeluaran"
            value={
              filters.expense_date ? dayjs(filters.expense_date) : null
            }
            onChange={(value) =>
              setFilters((previous) => ({
                ...previous,
                expense_date: value?.format("YYYY-MM-DD") ?? null,
              }))
            }
            className="w-full md:w-52"
          />
        </div>

        <Table<ExpenseModel>
          rowKey="id"
          columns={columns}
          dataSource={filteredExpenses}
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} pengeluaran`,
          }}
          locale={{
            emptyText: <Empty description="Belum ada pengeluaran" />,
          }}
        />
      </Card>

      <ExpenseForm
        open={formOpen}
        expense={selectedExpense}
        onClose={() => {
          setFormOpen(false);
          setSelectedExpense(null);
        }}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
