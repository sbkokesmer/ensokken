"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { postJson } from "@/lib/api";

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postcode: string;
  phone: string;
  notes: string;
}

function CheckoutInner() {
  const { cart, subtotal, shippingCost, total } = useCart();
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const wasCanceled = searchParams.get("canceled") === "1";

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postcode: "",
    phone: "",
    notes: "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: user?.email || prev.email,
      firstName: profile?.full_name?.split(" ")[0] || prev.firstName,
      lastName: profile?.full_name?.split(" ").slice(1).join(" ") || prev.lastName,
      phone: profile?.phone || prev.phone,
    }));
  }, [user, profile]);

  const handleInvalid = (e: React.InvalidEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.validity.valueMissing) e.target.setCustomValidity("Vul dit veld in.");
    else if (e.target.validity.typeMismatch && e.target.type === "email") e.target.setCustomValidity("Voer een geldig e-mailadres in.");
  };
  const handleInput = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.setCustomValidity("");
  };
  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const { url } = await postJson<{ url: string }>("create-checkout-session", {
        cart,
        user_id: user?.id ?? null,
        email: formData.email,
        shipping: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          postcode: formData.postcode,
          phone: formData.phone,
        },
        notes: formData.notes,
        origin: window.location.origin,
      });

      if (!url) throw new Error("Geen Stripe checkout URL ontvangen");
      window.location.href = url;
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Er is een fout opgetreden.");
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Je winkelwagen is leeg</h2>
        <p className="text-zinc-500 mb-8">Je moet producten in je winkelwagen hebben om naar de kassa te gaan.</p>
        <Link href="/collection" className="px-6 py-3 bg-black text-white rounded-xl">Begin met winkelen</Link>
      </div>
    );
  }

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <Link href="/cart" className="mb-8 text-sm text-zinc-500 hover:text-black flex items-center gap-1 w-fit">
        <ArrowLeft width={14} height={14} /> Terug naar Winkelwagen
      </Link>

      {wasCanceled && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="text-amber-600 shrink-0" width={20} height={20} />
          <p className="text-sm text-amber-800">Je betaling is geannuleerd. Probeer het opnieuw wanneer je klaar bent.</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-black tracking-tight mb-8">Afrekenen</h1>

          <form onSubmit={handlePayment} className="space-y-8">
            <section className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">1</span>
                Contactgegevens
              </h2>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">E-mailadres</label>
                <input
                  required type="email" value={formData.email} onChange={handleChange("email")}
                  placeholder="voorbeeld@email.com"
                  onInvalid={handleInvalid} onInput={handleInput}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none"
                />
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">2</span>
                Bezorgadres
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Voornaam</label>
                  <input required type="text" value={formData.firstName} onChange={handleChange("firstName")} onInvalid={handleInvalid} onInput={handleInput} className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Achternaam</label>
                  <input required type="text" value={formData.lastName} onChange={handleChange("lastName")} onInvalid={handleInvalid} onInput={handleInput} className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Adres</label>
                  <textarea required rows={2} value={formData.address} onChange={handleChange("address")} onInvalid={handleInvalid} onInput={handleInput} className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none resize-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Stad</label>
                  <input required type="text" value={formData.city} onChange={handleChange("city")} onInvalid={handleInvalid} onInput={handleInput} className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Postcode</label>
                  <input required type="text" value={formData.postcode} onChange={handleChange("postcode")} onInvalid={handleInvalid} onInput={handleInput} className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Telefoon</label>
                  <input required type="tel" value={formData.phone} onChange={handleChange("phone")} placeholder="+31 6 12345678" onInvalid={handleInvalid} onInput={handleInput} className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Opmerkingen (optioneel)</label>
                  <textarea rows={2} value={formData.notes} onChange={handleChange("notes")} placeholder="Bezorginstructies..." className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none resize-none" />
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">3</span>
                Betaling
              </h2>
              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex items-center gap-3">
                <ShieldCheck className="text-[#17a6a6] shrink-0" width={22} height={22} />
                <div>
                  <p className="text-sm font-medium text-black">Beveiligde betaling via Stripe</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Kaart, iDEAL en Bancontact ondersteund. Je kaartgegevens komen nooit op onze servers.</p>
                </div>
              </div>
            </section>

            {errorMsg && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{errorMsg}</p>
            )}

            <button
              type="submit" disabled={isProcessing}
              className="w-full py-4 bg-black text-white rounded-xl font-medium shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#222] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Doorverwijzen naar Stripe...
                </>
              ) : (
                <><Lock width={16} height={16} /> Doorgaan naar betaling — €{total.toFixed(2)}</>
              )}
            </button>
          </form>
        </div>

        <div className="lg:w-96 shrink-0">
          <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-200 sticky top-24">
            <h3 className="font-semibold text-lg text-black mb-6">Besteloverzicht</h3>

            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="w-16 h-16 bg-white rounded-lg border border-zinc-200 flex items-center justify-center shrink-0">
                    <img src={item.image} className="w-12 object-contain" alt={item.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{item.name}</h4>
                    <p className="text-xs text-zinc-500">{item.selectedSize} · {item.quantity}×</p>
                    <p className="text-sm font-semibold mt-1">€{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 border-t border-zinc-200 pt-6">
              <div className="flex justify-between text-zinc-600 text-sm"><span>Subtotaal</span><span>€{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-zinc-600 text-sm">
                <span>Verzending</span>
                <span className={shippingCost === 0 ? "text-[#17a6a6] font-medium" : ""}>
                  {shippingCost === 0 ? "Gratis" : `€${shippingCost.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-bold text-black border-t border-zinc-200 pt-4">
              <span>Totaal</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-zinc-400" width={32} height={32} />
      </div>
    }>
      <CheckoutInner />
    </Suspense>
  );
}
