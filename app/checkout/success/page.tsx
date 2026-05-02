"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Truck, Loader2, AlertTriangle, Package } from "lucide-react";
import Link from "next/link";
import { postJson } from "@/lib/api";
import { Order } from "@/lib/types";

function SuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderNumber = searchParams.get("order");
  const { clearCart } = useCart();
  const { user } = useAuth();

  const [status, setStatus] = useState<"loading" | "paid" | "pending" | "error">("loading");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setError("Geen sessie-ID gevonden");
      return;
    }
    (async () => {
      try {
        const res = await postJson<{ order: Order; paid: boolean }>("confirm-order", { session_id: sessionId });
        setOrder(res.order);
        setStatus(res.paid ? "paid" : "pending");
        if (res.paid) clearCart();
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Bevestiging mislukt");
      }
    })();
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-zinc-400" width={32} height={32} />
          <p className="text-zinc-500">Betaling controleren...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-black/5 shadow-xl text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle width={32} height={32} />
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">Bevestiging mislukt</h1>
          <p className="text-zinc-500 mb-6">{error}</p>
          <Link href="/cart" className="block w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-[#222]">
            Terug naar winkelwagen
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-black/5 shadow-xl text-center animate-in zoom-in duration-500">
        {status === "paid" ? (
          <>
            <div className="w-20 h-20 bg-[#17a6a6]/10 text-[#17a6a6] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 width={40} height={40} />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">Bedankt voor je bestelling!</h1>
            <p className="text-zinc-500 mb-6">
              Je betaling is ontvangen. We sturen je een e-mail zodra je bestelling onderweg is.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package width={40} height={40} />
            </div>
            <h1 className="text-2xl font-bold text-black mb-2">Bestelling ontvangen</h1>
            <p className="text-zinc-500 mb-6">
              Je betaling wordt nog verwerkt. We bevestigen je bestelling zodra de betaling rond is.
            </p>
          </>
        )}

        <div className="bg-zinc-50 p-4 rounded-xl mb-6 text-sm text-zinc-600">
          <p>Bestelnummer: <span className="font-mono font-bold text-black">{order?.order_number || orderNumber}</span></p>
          {order && <p className="mt-1">Totaal: <span className="font-bold text-black">€{Number(order.total).toFixed(2)}</span></p>}
        </div>

        <div className="flex flex-col gap-3">
          <Link href={`/track`} className="block w-full py-3.5 bg-[#f24f13] text-white rounded-xl font-medium hover:bg-[#d63f0a] flex items-center justify-center gap-2">
            <Truck width={14} height={14} /> Bestelling volgen
          </Link>
          {user && (
            <Link href="/account" className="block w-full py-3.5 bg-zinc-100 text-black rounded-xl font-medium hover:bg-zinc-200 text-sm">
              Mijn bestellingen bekijken
            </Link>
          )}
          <Link href="/" className="block w-full py-4 bg-black text-white rounded-xl font-medium hover:bg-[#222]">
            Terug naar Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" width={32} height={32} /></div>}>
      <SuccessInner />
    </Suspense>
  );
}
