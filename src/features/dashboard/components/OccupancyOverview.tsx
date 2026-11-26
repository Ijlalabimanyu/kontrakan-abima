"use client";

import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui";
import type {
  DashboardAnalytics,
  PropertyOccupancy,
} from "@/services/dashboard/interface";

interface OccupancyOverviewProps {
  dashboard: DashboardAnalytics;
}

function getPercentage(value: number, total: number) {
  if (total <= 0) return 0;

  return Math.max(0, Math.min((value / total) * 100, 100));
}

function OccupancyLegend({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "brand" | "success" | "warning";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted">{label}</span>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
}

function PropertyOccupancyItem({ property }: { property: PropertyOccupancy }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {property.property_name}
          </p>

          <p className="mt-1 text-xs text-muted">
            {property.occupied_rooms} dari {property.total_rooms} kamar terisi
          </p>
        </div>

        <span className="shrink-0 text-sm font-semibold text-foreground">
          {property.occupancy_rate}%
        </span>
      </div>

      <div
        className="flex h-2.5 overflow-hidden rounded-full bg-neutral-soft"
        role="img"
        aria-label={`${property.occupancy_rate}% okupansi ${property.property_name}`}
      >
        {property.total_rooms > 0 && (
          <>
            <div
              className="bg-brand-primary transition-all"
              style={{
                width: `${getPercentage(
                  property.occupied_rooms,
                  property.total_rooms,
                )}%`,
              }}
            />

            <div
              className="bg-success transition-all"
              style={{
                width: `${getPercentage(
                  property.available_rooms,
                  property.total_rooms,
                )}%`,
              }}
            />

            <div
              className="bg-warning transition-all"
              style={{
                width: `${getPercentage(
                  property.maintenance_rooms,
                  property.total_rooms,
                )}%`,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function OccupancyOverview({
  dashboard,
}: OccupancyOverviewProps) {
  const { kpi, property_occupancy } = dashboard;

  const occupancyRate = Math.max(0, Math.min(kpi.occupancy_rate, 100));

  return (
    <Card
      className="h-full"
      title={
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Ringkasan Okupansi
          </h2>

          <p className="mt-1 text-xs font-normal text-muted">
            Kondisi kamar dan tingkat hunian properti.
          </p>
        </div>
      }
      extra={
        <Link
          href="/rooms"
          className="text-xs font-semibold text-brand-primary hover:underline"
        >
          Lihat Semua
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Room Summary */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-neutral-soft p-3">
            <p className="text-xs text-muted">Total Kamar</p>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {kpi.total_rooms}
            </p>
          </div>

          <div className="rounded-lg bg-brand-soft p-3">
            <p className="text-xs text-muted">Terisi</p>
            <p className="mt-2 text-2xl font-bold text-brand-primary">
              {kpi.occupied_rooms}
            </p>
          </div>

          <div className="rounded-lg bg-success-soft p-3">
            <p className="text-xs text-muted">Tersedia</p>
            <p className="mt-2 text-2xl font-bold text-success">
              {kpi.available_rooms}
            </p>
          </div>

          <div className="rounded-lg bg-warning-soft p-3">
            <p className="text-xs text-muted">Maintenance</p>
            <p className="mt-2 text-2xl font-bold text-warning">
              {kpi.maintenance_rooms}
            </p>
          </div>
        </div>

        {/* Overall Occupancy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">
              Tingkat Okupansi Keseluruhan
            </span>

            <span className="text-sm font-bold text-brand-primary">
              {kpi.occupancy_rate}%
            </span>
          </div>

          <div
            className="h-3 overflow-hidden rounded-full bg-neutral-soft"
            role="progressbar"
            aria-label="Tingkat okupansi keseluruhan"
            aria-valuenow={occupancyRate}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-brand-primary transition-all"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        {/* Status Legend */}
        <div className="space-y-3 border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-foreground">
            Distribusi Kamar
          </h3>

          <OccupancyLegend
            label="Terisi"
            value={kpi.occupied_rooms}
            tone="brand"
          />

          <OccupancyLegend
            label="Tersedia"
            value={kpi.available_rooms}
            tone="success"
          />

          <OccupancyLegend
            label="Maintenance"
            value={kpi.maintenance_rooms}
            tone="warning"
          />
        </div>

        {/* Property Occupancy */}
        <div className="space-y-4 border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-foreground">
            Okupansi per Properti
          </h3>

          {property_occupancy.length === 0 ? (
            <EmptyState
              size="small"
              title="Belum ada data properti"
              description="Data okupansi per properti akan ditampilkan di sini."
            />
          ) : (
            <div className="space-y-5">
              {property_occupancy.map((property) => (
                <PropertyOccupancyItem
                  key={property.property_id}
                  property={property}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
