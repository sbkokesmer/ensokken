"use client";

import { Order, ORDER_STATUS_LABELS, formatDateTime } from "@/lib/types";
import { Clock, CheckCircle2, Cog, PackageCheck, Truck, Home, XCircle, ExternalLink, Package } from "lucide-react";

interface Step {
  key: string;
  label: string;
  icon: typeof Clock;
  timestamp: string | null;
}

export default function OrderTimeline({ order }: { order: Order }) {
  const isCancelled = order.status === "cancelled";
  const isRefunded = order.status === "refunded";

  const steps: Step[] = [
    { key: "pending", label: "Ontvangen", icon: Clock, timestamp: order.created_at },
    { key: "confirmed", label: "Bevestigd", icon: CheckCircle2, timestamp: order.confirmed_at },
    { key: "processing", label: "In verwerking", icon: Cog, timestamp: null },
    { key: "shipped", label: "Verzonden", icon: PackageCheck, timestamp: order.shipped_at },
    { key: "delivered", label: "Bezorgd", icon: Home, timestamp: order.delivered_at },
  ];

  const orderIdx: Record<string, number> = {
    pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4,
  };
  const currentIdx = isCancelled || isRefunded ? -1 : (orderIdx[order.status] ?? 0);

  return (
    <div className="bg-white rounded-2xl border border-black/5 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Package width={16} height={16} className="text-zinc-500" />
        <h3 className="text-sm font-semibold text-black uppercase tracking-wider">Status</h3>
        {(isCancelled || isRefunded) && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
            <XCircle width={12} height={12} />
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        )}
      </div>

      {!isCancelled && !isRefunded ? (
        <div className="relative">
          <div className="absolute left-4 top-4 bottom-4 w-px bg-zinc-200"></div>
          <div className="flex flex-col gap-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isDone = idx <= currentIdx;
              const isActive = idx === currentIdx;
              return (
                <div key={step.key} className="flex items-start gap-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors z-10 ${
                    isDone ? "bg-[#17a6a6] text-white" : "bg-zinc-100 text-zinc-400"
                  } ${isActive ? "ring-4 ring-[#17a6a6]/20" : ""}`}>
                    <Icon width={14} height={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isDone ? "text-black" : "text-zinc-400"}`}>{step.label}</p>
                    {step.timestamp && <p className="text-xs text-zinc-500 mt-0.5">{formatDateTime(step.timestamp)}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">
          {isCancelled
            ? `Bestelling geannuleerd${order.cancelled_at ? ` op ${formatDateTime(order.cancelled_at)}` : ""}.`
            : "Bestelling terugbetaald."}
        </p>
      )}

      {(order.tracking_number || order.tracking_url) && (
        <div className="mt-6 pt-6 border-t border-zinc-100">
          <div className="flex items-center gap-2 mb-3">
            <Truck width={14} height={14} className="text-zinc-500" />
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Track & Trace</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {order.carrier && (
              <span className="text-sm font-medium text-black bg-[#eeebdf] px-3 py-1.5 rounded-lg">
                {order.carrier}
              </span>
            )}
            {order.tracking_number && (
              <span className="text-sm font-mono text-zinc-700 bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-100">
                {order.tracking_number}
              </span>
            )}
            {order.tracking_url && (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#f24f13] hover:text-[#d63f0a] flex items-center gap-1.5 transition-colors"
              >
                Volg pakket
                <ExternalLink width={12} height={12} />
              </a>
            )}
          </div>
        </div>
      )}

      {order.customer_note && (
        <div className="mt-6 pt-6 border-t border-zinc-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Bericht</p>
          <p className="text-sm text-zinc-700 bg-zinc-50 rounded-xl p-3">{order.customer_note}</p>
        </div>
      )}
    </div>
  );
}
