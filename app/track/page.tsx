"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Order, formatDate } from "@/lib/types";
import OrderTimeline from "@/components/OrderTimeline";
import { Search, Loader2, Package } from "lucide-react";

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    const { data, error: dbError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", orderNumber.trim().toUpperCase())
      .maybeSingle();

    setLoading(false);

    if (dbError || !data) {
      setError("Bestelling niet gevonden. Controleer je bestelnummer.");
      return;
    }

    const orderEmail = (data.shipping_address as any)?.email?.toLowerCase()?.trim();
    if (orderEmail && orderEmail !== email.toLowerCase().trim()) {
      setError("E-mailadres komt niet overeen met deze bestelling.");
      return;
    }

    setOrder(data as Order);
  }

  return (
    <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto min-h-[70vh]">
      <header className="mb-10 text-center">
        <span className="text-[#f24f13] font-medium text-xs tracking-widest uppercase mb-3 block">Track & Trace</span>
        <h1 className="text-3xl md:text-4xl font-semibold text-black tracking-tight mb-2">Volg je bestelling</h1>
        <p className="text-zinc-500">Voer je bestelnummer en e-mailadres in om de status te bekijken.</p>
      </header>

      {!order && (
        <form onSubmit={handleSearch} className="bg-white p-6 md:p-8 rounded-3xl border border-black/5 shadow-sm max-w-xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">Bestelnummer</label>
              <input
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="ENS-2026-0001"
                className="w-full h-11 px-4 rounded-xl border border-black/10 bg-zinc-50 text-black text-sm font-mono placeholder:text-zinc-400 focus:outline-none focus:border-black/30 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1.5">E-mailadres</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan@voorbeeld.nl"
                className="w-full h-11 px-4 rounded-xl border border-black/10 bg-zinc-50 text-black text-sm placeholder:text-zinc-400 focus:outline-none focus:border-black/30 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full h-12 bg-black text-white rounded-xl font-medium hover:bg-[#f24f13] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 width={16} height={16} className="animate-spin" /> : <Search width={16} height={16} />}
            Zoeken
          </button>
        </form>
      )}

      {order && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-black/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#eeebdf] flex items-center justify-center">
                <Package width={20} height={20} className="text-zinc-600" />
              </div>
              <div>
                <p className="font-mono text-base font-semibold text-black">{order.order_number}</p>
                <p className="text-xs text-zinc-500">{formatDate(order.created_at)}</p>
              </div>
            </div>
            {order.order_items && order.order_items.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-zinc-50 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-black">{item.product_name}</p>
                      <p className="text-xs text-zinc-500">{item.color_name} — {item.size} — ×{item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-black">€{Number(item.line_total).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between text-sm">
              <span className="text-zinc-500">Totaal</span>
              <span className="font-semibold text-black">€{Number(order.total).toFixed(2)}</span>
            </div>
            <button
              onClick={() => { setOrder(null); setOrderNumber(""); setEmail(""); }}
              className="mt-4 text-xs text-zinc-500 hover:text-black underline"
            >
              Nieuwe zoekopdracht
            </button>
          </div>

          <OrderTimeline order={order} />
        </div>
      )}
    </main>
  );
}
