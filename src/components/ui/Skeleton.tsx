"use client";

import { Skeleton as AntSkeleton } from "antd";
import type { ComponentProps } from "react";

import Card from "./Card";

export type SkeletonProps = ComponentProps<typeof AntSkeleton>;

export interface SkeletonCardProps {
  rows?: number;
  avatar?: boolean;
  active?: boolean;
  className?: string;
}

export interface SkeletonListProps {
  rows?: number;
  avatar?: boolean;
  active?: boolean;
  className?: string;
}

export default function Skeleton({
  active = true,
  round = true,
  className,
  ...props
}: SkeletonProps) {
  return (
    <AntSkeleton
      {...props}
      active={active}
      round={round}
      className={className}
    />
  );
}

export function SkeletonCard({
  rows = 2,
  avatar = false,
  active = true,
  className,
}: SkeletonCardProps) {
  return (
    <Card className={className}>
      <AntSkeleton active={active} avatar={avatar} title paragraph={{ rows }} />
    </Card>
  );
}

export function SkeletonList({
  rows = 4,
  avatar = true,
  active = true,
  className,
}: SkeletonListProps) {
  return (
    <div
      className={["space-y-3", className].filter(Boolean).join(" ")}
      aria-busy="true"
      aria-label="Memuat daftar data"
    >
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-surface p-4"
        >
          <AntSkeleton
            active={active}
            avatar={avatar ? { shape: "circle" } : false}
            title={{ width: "45%" }}
            paragraph={{
              rows: 1,
              width: "70%",
            }}
          />
        </div>
      ))}
    </div>
  );
}
