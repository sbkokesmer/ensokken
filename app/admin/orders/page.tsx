"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import { ChevronDown, Loader2, Eye, X } from "lucide-react";

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
  profiles?: { full_name: string; email: string } | null;
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
      .select("*, profiles(full_name, email), order_items(*)")
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
          <button onClick={() => setFilterStatus("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === "all" ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
            Alle ({orders.length})
          </button>
          {allStatuses.map((s) => {
            const count = orders.filter((o) => o.status === s).length;
            return (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                {statusLabels[s]} ({count})
              </button>
            );
          })}
        </div>

        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center gap-2 text-white/30 text-sm">
              <Loader2 width={16} height={16} className="animate-spin" /> Laden...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-white/30 text-sm">Geen bestellingen gevonden</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Bestelling</th>
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Klant</th>
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Totaal</th>
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Datum</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3 text-white text-sm font-medium">{o.order_number}</td>
                    <td className="px-5 py-3">
                      <p className="text-white/70 text-sm">{o.profiles?.full_name || "Gast"}</p>
                      <p className="text-white/30 text-xs">{o.profiles?.email || "—"}</p>
                    </td>
                    <td className="px-5 py-3 text-white text-sm font-medium">€{Number(o.total).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        disabled={updatingStatus === o.id}
                        className={`text-xs px-2 py-1 rounded-lg font-medium border cursor-pointer bg-transparent focus:outline-none appearance-none ${statusColors[o.status] || "text-white/40"}`}
                      >
                        {allStatuses.map((s) => <option key={s} value={s} className="bg-[#1a1a1a] text-white">{statusLabels[s]}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-white/40 text-xs">{formatDate(o.created_at)}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => setSelectedOrder(o)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
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
          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-white font-semibold text-base">{selectedOrder.order_number}</h2>
                <p className="text-white/30 text-xs mt-0.5">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                <X width={16} height={16} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <span className="text-white/50 text-sm font-semibold uppercase">{selectedOrder.profiles?.email?.[0] ?? "G"}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{selectedOrder.profiles?.full_name || "Gast"}</p>
                  <p className="text-white/40 text-xs">{selectedOrder.profiles?.email || "Geen account"}</p>
                </div>
                <span className={`ml-auto text-xs px-2.5 py-1 rounded-lg font-medium border ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status]}
                </span>
              </div>

              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div>
                  <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-3">Bestelde producten</p>
                  <div className="flex flex-col gap-2">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between bg-[#0f0f0f] rounded-xl px-4 py-3">
                        <div>
                          <p className="text-white text-sm font-medium">{item.product_name}</p>
                          <p className="text-white/40 text-xs">{item.color_name} — {item.size} — ×{item.quantity}</p>
                        </div>
                        <p className="text-white text-sm font-medium">€{Number(item.line_total).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#0f0f0f] rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/50">Subtotaal</span>
                  <span className="text-white">€{Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-white/50">Verzending</span>
                  <span className="text-white">{Number(selectedOrder.shipping_cost) === 0 ? "Gratis" : `€${Number(selectedOrder.shipping_cost).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t border-white/10 pt-3">
                  <span className="text-white">Totaal</span>
                  <span className="text-[#f24f13]">€{Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>

              {Object.keys(selectedOrder.shipping_address).length > 0 && (
                <div>
                  <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-2">Leveringsadres</p>
                  <div className="bg-[#0f0f0f] rounded-xl px-4 py-3">
                    {Object.entries(selectedOrder.shipping_address).map(([k, v]) => (
                      <p key={k} className="text-white/60 text-sm">{v}</p>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-2">Status bijwerken</p>
                <div className="grid grid-cols-2 gap-2">
                  {allStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateOrderStatus(selectedOrder.id, s)}
                      disabled={selectedOrder.status === s || updatingStatus === selectedOrder.id}
                      className={`h-9 rounded-xl text-xs font-medium transition-colors border ${
                        selectedOrder.status === s
                          ? `${statusColors[s]} cursor-default`
                          : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10"
                      } disabled:opacity-50`}
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
