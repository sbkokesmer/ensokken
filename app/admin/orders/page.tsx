"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import { Loader2, Eye, X } from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  color_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  created_at: string;
  user_id: string | null;
  shipping_address: Record<string, string>;
  notes: string;
  order_items?: OrderItem[];
}

const statusColors: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  confirmed: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  processing: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  shipped: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  delivered: "text-green-400 bg-green-400/10 border-green-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
  refunded: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
};

const statusLabels: Record<string, string> = {
  pending: "In afwachting",
  confirmed: "Bevestigd",
  processing: "Verwerking",
  shipped: "Verzonden",
  delivered: "Bezorgd",
  cancelled: "Geannuleerd",
  refunded: "Terugbetaald",
};

const allStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    setOrders(data ?? []);
    setLoading(false);
  }

  async function updateOrderStatus(orderId: string, status: string) {
    setUpdatingStatus(orderId);
    await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", orderId);
    setUpdatingStatus(null);
    await fetchOrders();
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status } : prev);
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  return (
    <div>
      <AdminHeader title="Bestellingen" subtitle={`${orders.length} bestellingen totaal`} />

      <div className="p-8 flex flex-col gap-5">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={filterStatus === "all"
              ? { background: "var(--at-text)", color: "var(--at-bg)" }
              : { color: "var(--at-text-muted)" }
            }
          >
            Alle ({orders.length})
          </button>
          {allStatuses.map((s) => {
            const count = orders.filter((o) => o.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={filterStatus === s
                  ? { background: "var(--at-text)", color: "var(--at-bg)" }
                  : { color: "var(--at-text-muted)" }
                }
              >
                {statusLabels[s]} ({count})
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--at-surface)", border: "1px solid var(--at-border)" }}>
          {loading ? (
            <div className="p-12 flex items-center justify-center gap-2 text-sm" style={{ color: "var(--at-text-muted)" }}>
              <Loader2 width={16} height={16} className="animate-spin" /> Laden...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm" style={{ color: "var(--at-text-muted)" }}>Geen bestellingen gevonden</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--at-border)" }}>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Bestelling</th>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Klant</th>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Totaal</th>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Datum</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="transition-colors" style={{ borderBottom: "1px solid var(--at-border)" }}>
                    <td className="px-5 py-3 text-sm font-medium" style={{ color: "var(--at-text)" }}>{o.order_number}</td>
                    <td className="px-5 py-3">
                      <p className="text-sm" style={{ color: "var(--at-text-secondary)" }}>{o.shipping_address?.name || "Gast"}</p>
                      <p className="text-xs" style={{ color: "var(--at-text-faint)" }}>{o.shipping_address?.email || "—"}</p>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium" style={{ color: "var(--at-text)" }}>€{Number(o.total).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        disabled={updatingStatus === o.id}
                        className={`text-xs px-2 py-1 rounded-lg font-medium border cursor-pointer bg-transparent focus:outline-none appearance-none ${statusColors[o.status] || "text-white/40"}`}
                      >
                        {allStatuses.map((s) => (
                          <option key={s} value={s} style={{ background: "var(--at-surface-2)", color: "var(--at-text)" }}>
                            {statusLabels[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--at-text-dim)" }}>{formatDate(o.created_at)}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                        style={{ color: "var(--at-text-muted)" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "var(--at-hover-btn)";
                          (e.currentTarget as HTMLElement).style.color = "var(--at-hover-btn-text)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "var(--at-text-muted)";
                        }}
                      >
                        <Eye width={13} height={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div
            className="relative rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
            style={{ background: "var(--at-surface)", border: "1px solid var(--at-border-strong)" }}
          >
            <div
              className="sticky top-0 px-6 py-4 flex items-center justify-between z-10"
              style={{ background: "var(--at-surface-2)", borderBottom: "1px solid var(--at-border)" }}
            >
              <div>
                <h2 className="font-semibold text-base" style={{ color: "var(--at-text)" }}>{selectedOrder.order_number}</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--at-text-faint)" }}>{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: "var(--at-text-dim)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--at-hover-btn)";
                  (e.currentTarget as HTMLElement).style.color = "var(--at-hover-btn-text)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--at-text-dim)";
                }}
              >
                <X width={16} height={16} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--at-hover-btn)" }}>
                  <span className="text-sm font-semibold uppercase" style={{ color: "var(--at-text-secondary)" }}>{(selectedOrder.shipping_address?.name?.[0] ?? "G").toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--at-text)" }}>{selectedOrder.shipping_address?.name || "Gast"}</p>
                  <p className="text-xs" style={{ color: "var(--at-text-dim)" }}>{selectedOrder.shipping_address?.email || "Geen account"}</p>
                </div>
                <span className={`ml-auto text-xs px-2.5 py-1 rounded-lg font-medium border ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status]}
                </span>
              </div>

              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--at-text-muted)" }}>Bestelde producten</p>
                  <div className="flex flex-col gap-2">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: "var(--at-surface-input)" }}>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--at-text)" }}>{item.product_name}</p>
                          <p className="text-xs" style={{ color: "var(--at-text-dim)" }}>{item.color_name} — {item.size} — ×{item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium" style={{ color: "var(--at-text)" }}>€{Number(item.line_total).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl p-4" style={{ background: "var(--at-surface-input)" }}>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: "var(--at-text-secondary)" }}>Subtotaal</span>
                  <span style={{ color: "var(--at-text)" }}>€{Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span style={{ color: "var(--at-text-secondary)" }}>Verzending</span>
                  <span style={{ color: "var(--at-text)" }}>{Number(selectedOrder.shipping_cost) === 0 ? "Gratis" : `€${Number(selectedOrder.shipping_cost).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-3" style={{ borderTop: "1px solid var(--at-border)" }}>
                  <span style={{ color: "var(--at-text)" }}>Totaal</span>
                  <span style={{ color: "var(--at-text)" }}>€{Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>

              {Object.keys(selectedOrder.shipping_address).length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--at-text-muted)" }}>Leveringsadres</p>
                  <div className="rounded-xl px-4 py-3" style={{ background: "var(--at-surface-input)" }}>
                    {Object.entries(selectedOrder.shipping_address).map(([k, v]) => (
                      <p key={k} className="text-sm" style={{ color: "var(--at-text-secondary)" }}>{v}</p>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--at-text-muted)" }}>Status bijwerken</p>
                <div className="grid grid-cols-2 gap-2">
                  {allStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateOrderStatus(selectedOrder.id, s)}
                      disabled={selectedOrder.status === s || updatingStatus === selectedOrder.id}
                      className={`h-9 rounded-xl text-xs font-medium transition-colors border ${
                        selectedOrder.status === s
                          ? `${statusColors[s]} cursor-default`
                          : "disabled:opacity-50"
                      }`}
                      style={selectedOrder.status !== s ? {
                        background: "var(--at-btn-secondary-bg)",
                        color: "var(--at-btn-secondary-text)",
                        borderColor: "var(--at-border)",
                      } : undefined}
                    >
                      {statusLabels[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
