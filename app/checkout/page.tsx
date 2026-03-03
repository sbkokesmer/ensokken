"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, CreditCard, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postcode: string;
  phone: string;
}

export default function CheckoutPage() {
  const { cart, subtotal, shippingCost, total, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postcode: "",
    phone: "",
  });

  const handleInvalid = (e: React.InvalidEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.validity.valueMissing) {
      e.target.setCustomValidity("Vul dit veld in.");
    } else if (e.target.validity.typeMismatch && e.target.type === "email") {
      e.target.setCustomValidity("Voer een geldig e-mailadres in.");
    }
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.setCustomValidity("");
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const shippingAddress = {
        name: `${formData.firstName} ${formData.lastName}`,
        address: formData.address,
        city: formData.city,
        postcode: formData.postcode,
        phone: formData.phone,
        email: formData.email,
      };

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user?.id ?? null,
          status: "pending",
          payment_status: "paid",
          subtotal,
          shipping_cost: shippingCost,
          total,
          shipping_address: shippingAddress,
          payment_method: "card",
        })
        .select("id, order_number")
        .single();

      if (orderError || !orderData) {
        throw new Error(orderError?.message ?? "Order creation failed");
      }

      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        variant_id: null,
        product_name: item.name,
        color_name: item.selectedColor,
        size: item.selectedSize,
        quantity: item.quantity,
        unit_price: item.price,
        line_total: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      setOrderNumber(orderData.order_number);
      clearCart();
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      alert("Er is een fout opgetreden bij het plaatsen van je bestelling. Probeer het opnieuw.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Je winkelwagen is leeg</h2>
        <p className="text-zinc-500 mb-8">Je moet producten in je winkelwagen hebben om naar de kassa te gaan.</p>
        <Link href="/collection" className="px-6 py-3 bg-black text-white rounded-xl">
          Begin met winkelen
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-black/5 shadow-xl text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-[#17a6a6]/10 text-[#17a6a6] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 width={40} height={40} />
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">Bestelling Ontvangen!</h1>
          <p className="text-zinc-500 mb-8">
            Je bestelling is succesvol aangemaakt. Bestelgegevens zijn naar je e-mailadres verzonden.
          </p>
          <div className="bg-zinc-50 p-4 rounded-xl mb-8 text-sm text-zinc-600">
            <p>Bestelnummer: <span className="font-mono font-bold text-black">{orderNumber}</span></p>
          </div>
          <div className="flex flex-col gap-3">
            {user && (
              <Link href="/account" className="block w-full py-3.5 bg-zinc-100 text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors text-sm">
                Mijn bestellingen bekijken
              </Link>
            )}
            <Link href="/" className="block w-full py-4 bg-black text-white rounded-xl font-medium hover:bg-[#222] transition-colors">
              Terug naar Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <Link href="/cart" className="mb-8 text-sm text-zinc-500 hover:text-black flex items-center gap-1 w-fit">
        <ArrowLeft width={14} height={14} /> Terug naar Winkelwagen
      </Link>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-black tracking-tight mb-8">Afrekenen</h1>

          <form onSubmit={handlePayment} className="space-y-8">
            <section className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">1</span>
                Contactgegevens
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">E-mailadres</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                    placeholder="voorbeeld@email.com"
                    onInvalid={handleInvalid}
                    onInput={handleInput}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="newsletter" className="rounded border-zinc-300 text-black focus:ring-black" />
                  <label htmlFor="newsletter" className="text-sm text-zinc-600">Ik wil op de hoogte blijven van aanbiedingen</label>
                </div>
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
                  <input
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange("firstName")}
                    onInvalid={handleInvalid}
                    onInput={handleInput}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Achternaam</label>
                  <input
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange("lastName")}
                    onInvalid={handleInvalid}
                    onInput={handleInput}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Adres</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.address}
                    onChange={handleChange("address")}
                    onInvalid={handleInvalid}
                    onInput={handleInput}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none resize-none"
                  ></textarea>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Stad</label>
                  <input
                    required
                    type="text"
                    value={formData.city}
                    onChange={handleChange("city")}
                    onInvalid={handleInvalid}
                    onInput={handleInput}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Postcode</label>
                  <input
                    required
                    type="text"
                    value={formData.postcode}
                    onChange={handleChange("postcode")}
                    onInvalid={handleInvalid}
                    onInput={handleInput}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Telefoon</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange("phone")}
                    placeholder="+31 6 12345678"
                    onInvalid={handleInvalid}
                    onInput={handleInput}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center">3</span>
                Betaalmethode
              </h2>

              <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 mb-6 flex items-center gap-3">
                <ShieldCheck className="text-[#17a6a6]" width={20} height={20} />
                <p className="text-xs text-zinc-600">Je betaling is beveiligd met een 256-bit SSL-certificaat.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Naam op kaart</label>
                  <input
                    required
                    type="text"
                    onInvalid={handleInvalid}
                    onInput={handleInput}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none"
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs font-medium text-zinc-500 mb-1.5">Kaartnummer</label>
                  <input
                    required
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    onInvalid={handleInvalid}
                    onInput={handleInput}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none"
                  />
                  <div className="absolute right-4 top-[34px] text-zinc-400">
                    <CreditCard width={20} height={20} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">Vervaldatum</label>
                    <input
                      required
                      type="text"
                      placeholder="MM/JJ"
                      maxLength={5}
                      onInvalid={handleInvalid}
                      onInput={handleInput}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">CVC</label>
                    <input
                      required
                      type="text"
                      placeholder="123"
                      maxLength={3}
                      onInvalid={handleInvalid}
                      onInput={handleInput}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 border-transparent focus:bg-white focus:border-black focus:ring-0 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            </section>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-black text-white rounded-xl font-medium shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#222] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verwerken...
                </>
              ) : (
                <>
                  <Lock width={16} height={16} />
                  €{total.toFixed(2)} Betalen
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:w-96 shrink-0">
          <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-200 sticky top-24">
            <h3 className="font-semibold text-lg text-black mb-6">Besteloverzicht</h3>

            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="w-16 h-16 bg-white rounded-lg border border-zinc-200 flex items-center justify-center shrink-0">
                    <img src={item.image} className="w-12 object-contain" alt={item.name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{item.name}</h4>
                    <p className="text-xs text-zinc-500">{item.selectedSize} - {item.quantity} Stuks</p>
                    <p className="text-sm font-semibold mt-1">€{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6 border-t border-zinc-200 pt-6">
              <div className="flex justify-between text-zinc-600 text-sm">
                <span>Subtotaal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>
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
