import dayjs from "dayjs";
import "dayjs/locale/id";

export function formatDashboardDateTime(value: string) {
  const date = dayjs(value).locale("id");

  if (!date.isValid()) {
    return "Waktu tidak tersedia";
  }

  return date.format("DD MMM YYYY, HH:mm");
}

export function formatDashboardCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDashboardCompactCurrency(value: number): string {
  const absoluteValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absoluteValue >= 1_000_000_000) {
    return `${sign}Rp${(absoluteValue / 1_000_000_000).toFixed(1)} M`;
  }

  if (absoluteValue >= 1_000_000) {
    return `${sign}Rp${(absoluteValue / 1_000_000).toFixed(1)} jt`;
  }

  if (absoluteValue >= 1_000) {
    return `${sign}Rp${(absoluteValue / 1_000).toFixed(0)} rb`;
  }

  return formatDashboardCurrency(value);
}

export function formatDashboardDate(value: string, timezone: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: timezone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(date);
  }
}
