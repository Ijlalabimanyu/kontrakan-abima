import dayjs from "dayjs";
import "dayjs/locale/id";

export function formatDashboardCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDashboardDate(value: string) {
  const date = dayjs(value).locale("id");

  if (!date.isValid()) {
    return "Tanggal tidak tersedia";
  }

  return date.format("DD MMM YYYY");
}

export function formatDashboardDateTime(value: string) {
  const date = dayjs(value).locale("id");

  if (!date.isValid()) {
    return "Waktu tidak tersedia";
  }

  return date.format("DD MMM YYYY, HH:mm");
}
