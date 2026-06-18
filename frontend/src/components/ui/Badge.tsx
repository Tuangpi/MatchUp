import type { ReactNode } from "react";
import type { GameStatus } from "@/types";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const badgeVariants = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-secondary-100 text-secondary-800",
  warning: "bg-accent-100 text-accent-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-primary-100 text-primary-800",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeVariants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

const statusConfig: Record<
  GameStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  OPEN: { label: "Open", variant: "success" },
  FULL: { label: "Full", variant: "warning" },
  IN_PROGRESS: { label: "In Progress", variant: "info" },
  COMPLETED: { label: "Completed", variant: "default" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
};

export function GameStatusBadge({ status }: { status: GameStatus }) {
  const config = statusConfig[status] ?? {
    label: status,
    variant: "default" as const,
  };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
