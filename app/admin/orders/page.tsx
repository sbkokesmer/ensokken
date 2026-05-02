"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Loader2, Eye, X, Truck, Package, MapPin, FileText, Save, ExternalLink,
  CheckCircle2, Clock, PackageCheck, XCircle,
} from "lucide-react";
import {
  Order, OrderStatus, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS,
  CARRIERS, buildTrackingUrl, formatDateTime,
} from "@/lib/types";

const statusColors: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  confirmed: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  processing: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  shipped: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  delivered: "text-green-400 bg-green-400/10 border-green-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
  refunded: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
};

const allStatuses: OrderStatus[] = [
  "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded",
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    setOrders((data ?? []) as Order[]);
    setLoading(false);
  }

  function openOrder(o: Order) {
    setSelected(o);
    setTrackingNumber(o.tracking_number || "");
    setCarrier(o.carrier || "");
    setTrackingUrl(o.tracking_url || "");
    setAdminNotes(o.admin_notes || "");
    setCustomerNote(o.customer_note || "");
    setSaveMsg(null);
  }

  async function updateOrder(patch: Partial<Order> & { status?: OrderStatus }, message?: string) {
    if (!selected) return;
    setUpdating(true);
    const { error } = await supabase.from("orders").update(patch).eq("id", selected.id);
    if (!error) {
      const updated = { ...selected, ...patch } as Order;
      setSelected(updated);
      setOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)));
      if (message) setSaveMsg(message);
      setTimeout(() => setSaveMsg(null), 2500);
    } else {
      setSaveMsg("Fout: " + error.message);
    }
    setUpdating(false);
  }

  async function changeStatus(status: OrderStatus) {
    await updateOrder({ status }, `Status: ${ORDER_STATUS_LABELS[status]}`);
    fetchOrders();
  }

  async function saveTracking() {
    let finalUrl = trackingUrl;
    if (!finalUrl && carrier && trackingNumber) {
      finalUrl = buildTrackingUrl(carrier, trackingNumber);
    }
    await updateOrder({
      tracking_number: trackingNumber,
      carrier,
      tracking_url: finalUrl,
    }, "Verzendinformatie opgeslagen");
  }

  async function saveNotes() {
    await updateOrder({ admin_notes: adminNotes, customer_note: customerNote }, "Notities opgeslagen");
  }

  async function shipNow() {
    if (!trackingNumber || !carrier) {
      setSaveMsg("Vul kargo şirketi en track-and-trace nummer in.");
      return;
    }
    let finalUrl = trackingUrl;
    if (!finalUrl) finalUrl = buildTrackingUrl(carrier, trackingNumber);
    await updateOrder(
      {
        status: "shipped",
        tracking_number: trackingNumber,
        carrier,
        tracking_url: finalUrl,
        customer_note: customerNote || `Je bestelling is verzonden via ${carrier}.`,
      },
      "Bestelling gemarkeerd als verzonden",
    );
    fetchOrders();
  }

  const filtered = orders.filter((o) => {
    const okStatus = filterStatus === "all" || o.status === filterStatus;
    const okSearch =
      !searchTerm ||
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.shipping_address?.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.shipping_address?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.tracking_number ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    return okStatus && okSearch;
  });

  return (
    <div>
      <AdminHeader title="Bestellingen" subtitle={`${orders.length} bestellingen totaal`} />

      <div className="p-8 flex flex-col gap-5">
        <input
          placeholder="Zoeken op bestelnummer, e-mail, naam of tracking..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-10 px-4 rounded-xl text-sm focus:outline-none transition-colors"
          style={{ background: "var(--at-surface)", border: "1px solid var(--at-border)", color: "var(--at-text)" }}
        />

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus("all")}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={filterStatus === "all"
              ? { background: "var(--at-text)", color: "var(--at-bg)" }
              : { color: "var(--at-text-muted)" }}
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
                  : { color: "var(--at-text-muted)" }}
              >
                {ORDER_STATUS_LABELS[s]} ({count})
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
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Kargo</th>
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
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium border ${statusColors[o.status]}`}>
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--at-text-dim)" }}>
                      {o.tracking_number ? (
                        <span className="flex items-center gap-1">
                          <Truck width={11} height={11} />
                          <span className="font-mono">{o.tracking_number}</span>
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: "var(--at-text-dim)" }}>{formatDateTime(o.created_at)}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => openOrder(o)}
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

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div
            className="relative rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
            style={{ background: "var(--at-surface)", border: "1px solid var(--at-border-strong)" }}
          >
            <div
              className="sticky top-0 px-6 py-4 flex items-center justify-between z-10"
              style={{ background: "var(--at-surface-2)", borderBottom: "1px solid var(--at-border)" }}
            >
              <div>
                <h2 className="font-semibold text-base" style={{ color: "var(--at-text)" }}>{selected.order_number}</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--at-text-faint)" }}>{formatDateTime(selected.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                {saveMsg && <span className="text-xs" style={{ color: "var(--at-text-secondary)" }}>{saveMsg}</span>}
                <button
                  onClick={() => setSelected(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: "var(--at-text-dim)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--at-hover-btn)"; (e.currentTarget as HTMLElement).style.color = "var(--at-hover-btn-text)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--at-text-dim)"; }}
                >
                  <X width={16} height={16} />
                </button>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--at-hover-btn)" }}>
                  <span className="text-sm font-semibold uppercase" style={{ color: "var(--at-text-secondary)" }}>{(selected.shipping_address?.name?.[0] ?? "G").toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--at-text)" }}>{selected.shipping_address?.name || "Gast"}</p>
                  <p className="text-xs" style={{ color: "var(--at-text-dim)" }}>{selected.shipping_address?.email || "Geen account"}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${statusColors[selected.status]}`}>
                  {ORDER_STATUS_LABELS[selected.status]}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { icon: Clock, label: "Aangemaakt", t: selected.created_at },
                  { icon: CheckCircle2, label: "Bevestigd", t: selected.confirmed_at },
                  { icon: PackageCheck, label: "Verzonden", t: selected.shipped_at },
                  { icon: Truck, label: "Bezorgd", t: selected.delivered_at },
                ].map(({ icon: Icon, label, t }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "var(--at-surface-input)" }}>
                    <Icon width={14} height={14} className="mx-auto mb-1" style={{ color: t ? "var(--at-text)" : "var(--at-text-faint)" }} />
                    <p className="text-[10px]" style={{ color: "var(--at-text-muted)" }}>{label}</p>
                    <p className="text-[10px]" style={{ color: t ? "var(--at-text-secondary)" : "var(--at-text-placeholder)" }}>{t ? new Date(t).toLocaleDateString("nl-NL") : "—"}</p>
                  </div>
                ))}
              </div>

              {selected.order_items && selected.order_items.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--at-text-muted)" }}>Bestelde producten</p>
                  <div className="flex flex-col gap-2">
                    {selected.order_items.map((item) => (
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
                <div className="flex justify-between text-sm mb-2"><span style={{ color: "var(--at-text-secondary)" }}>Subtotaal</span><span style={{ color: "var(--at-text)" }}>€{Number(selected.subtotal).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm mb-3"><span style={{ color: "var(--at-text-secondary)" }}>Verzending</span><span style={{ color: "var(--at-text)" }}>{Number(selected.shipping_cost) === 0 ? "Gratis" : `€${Number(selected.shipping_cost).toFixed(2)}`}</span></div>
                <div className="flex justify-between text-sm mb-2"><span style={{ color: "var(--at-text-secondary)" }}>Betaling</span><span style={{ color: "var(--at-text)" }}>{PAYMENT_STATUS_LABELS[selected.payment_status]}</span></div>
                <div className="flex justify-between text-sm font-semibold pt-3" style={{ borderTop: "1px solid var(--at-border)" }}>
                  <span style={{ color: "var(--at-text)" }}>Totaal</span>
                  <span style={{ color: "var(--at-text)" }}>€{Number(selected.total).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "var(--at-text-muted)" }}>
                  <MapPin width={11} height={11} /> Leveringsadres
                </p>
                <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--at-surface-input)", color: "var(--at-text-secondary)" }}>
                  <p>{selected.shipping_address?.name}</p>
                  <p>{selected.shipping_address?.address}</p>
                  <p>{selected.shipping_address?.postcode} {selected.shipping_address?.city}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--at-text-dim)" }}>{selected.shipping_address?.phone}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-1.5" style={{ color: "var(--at-text-muted)" }}>
                  <Truck width={11} height={11} /> Verzendinformatie
                </p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-[11px] mb-1" style={{ color: "var(--at-text-dim)" }}>Vervoerder</label>
                    <select
                      value={carrier}
                      onChange={(e) => {
                        setCarrier(e.target.value);
                        if (trackingNumber) setTrackingUrl(buildTrackingUrl(e.target.value, trackingNumber));
                      }}
                      className="w-full h-9 px-3 text-sm rounded-lg focus:outline-none appearance-none"
                      style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }}
                    >
                      <option value="">— Kies —</option>
                      {CARRIERS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] mb-1" style={{ color: "var(--at-text-dim)" }}>Track & Trace nummer</label>
                    <input
                      value={trackingNumber}
                      onChange={(e) => {
                        setTrackingNumber(e.target.value);
                        if (carrier) setTrackingUrl(buildTrackingUrl(carrier, e.target.value));
                      }}
                      placeholder="3SXXXX0000000000"
                      className="w-full h-9 px-3 text-sm rounded-lg focus:outline-none font-mono"
                      style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block text-[11px] mb-1" style={{ color: "var(--at-text-dim)" }}>Track & Trace URL (optioneel — auto)</label>
                  <input
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-9 px-3 text-sm rounded-lg focus:outline-none"
                    style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-[11px] mb-1" style={{ color: "var(--at-text-dim)" }}>Bericht voor klant (verschijnt in account)</label>
                  <textarea
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    rows={2}
                    placeholder="Bijv: Je pakket is onderweg!"
                    className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none resize-none"
                    style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={saveTracking}
                    disabled={updating}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-medium disabled:opacity-50"
                    style={{ background: "var(--at-btn-secondary-bg)", color: "var(--at-btn-secondary-text)" }}
                  >
                    <Save width={12} height={12} /> Verzendinfo opslaan
                  </button>
                  <button
                    onClick={shipNow}
                    disabled={updating || !trackingNumber || !carrier}
                    className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-medium disabled:opacity-40"
                    style={{ background: "var(--at-btn-primary-bg)", color: "var(--at-btn-primary-text)" }}
                  >
                    <Truck width={12} height={12} /> Markeren als verzonden
                  </button>
                  {trackingUrl && (
                    <a href={trackingUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-medium"
                      style={{ background: "var(--at-btn-secondary-bg)", color: "var(--at-btn-secondary-text)" }}>
                      <ExternalLink width={12} height={12} /> Open tracking
                    </a>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "var(--at-text-muted)" }}>
                  <FileText width={11} height={11} /> Interne notities (alleen admin)
                </p>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  placeholder="Notities zichtbaar voor admins..."
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none resize-none"
                  style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }}
                />
                <button
                  onClick={saveNotes}
                  disabled={updating}
                  className="mt-2 flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-medium disabled:opacity-50"
                  style={{ background: "var(--at-btn-secondary-bg)", color: "var(--at-btn-secondary-text)" }}
                >
                  <Save width={12} height={12} /> Notities opslaan
                </button>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--at-text-muted)" }}>Status bijwerken</p>
                <div className="grid grid-cols-2 gap-2">
                  {allStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => changeStatus(s)}
                      disabled={selected.status === s || updating}
                      className={`h-9 rounded-xl text-xs font-medium transition-colors border flex items-center justify-center gap-1.5 ${selected.status === s ? `${statusColors[s]} cursor-default` : "disabled:opacity-50"}`}
                      style={selected.status !== s ? {
                        background: "var(--at-btn-secondary-bg)",
                        color: "var(--at-btn-secondary-text)",
                        borderColor: "var(--at-border)",
                      } : undefined}
                    >
                      {s === "cancelled" && <XCircle width={11} height={11} />}
                      {s === "delivered" && <PackageCheck width={11} height={11} />}
                      {s === "shipped" && <Truck width={11} height={11} />}
                      {s === "confirmed" && <CheckCircle2 width={11} height={11} />}
                      {ORDER_STATUS_LABELS[s]}
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
