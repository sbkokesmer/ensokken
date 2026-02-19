"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { ArrowLeft, Truck, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { cart, updateQuantity, subtotal, shippingCost, total, cartCount } = useCart();
  
  const freeShippingThreshold = 100; // Changed to 100 Euro for realism
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercentage = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <Link href="/collection" className="mb-8 text-sm text-zinc-500 hover:text-black flex items-center gap-1 w-fit">
        <ArrowLeft width={14} height={14} /> Terug naar Winkelen
      </Link>
      <header className="mb-10">
          <h1 className="text-3xl font-semibold text-black tracking-tight mb-2">Mijn Winkelwagen ({cartCount})</h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-6">
              {/* Shipping Progress */}
              {cart.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-black/5 flex items-center gap-5 shadow-sm">
                    <div className="w-12 h-12 rounded-full bg-[#eeebdf] flex items-center justify-center text-[#f24f13] shrink-0">
                        <Truck width={24} height={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between text-sm font-medium mb-2">
                            <span className="text-black">Nog</span>
                            {remainingForFreeShipping > 0 ? (
                              <span className="text-zinc-400">€{remainingForFreeShipping.toFixed(2)} voor gratis verzending</span>
                            ) : (
                              <span className="text-[#17a6a6] font-bold">Gratis Verzending!</span>
                            )}
                        </div>
                        <div className="h-2 w-full bg-[#eeebdf] rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 rounded-full ${remainingForFreeShipping <= 0 ? 'bg-[#17a6a6]' : 'bg-black'}`} 
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
              )}

              {/* Empty State */}
              {cart.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-24 h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6 text-zinc-300">
                        <ShoppingBag width={40} height={40} />
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-2">Je winkelwagen is leeg</h3>
                    <Link href="/collection" className="mt-6 px-8 py-4 bg-black text-white rounded-xl font-medium hover:bg-[#222] transition-colors text-lg">
                        Terug naar Collectie
                    </Link>
                </div>
              )}

              {/* Cart Items */}
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.variantId} className="flex gap-6 p-6 bg-white rounded-3xl border border-black/5 shadow-sm">
                    {/* Larger Image Container */}
                    <div className="w-32 h-32 bg-[#f9f9f9] rounded-2xl flex items-center justify-center shrink-0">
                      <img src={item.image} className="w-24 object-contain" alt={item.name} />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-semibold text-lg text-black mb-1">{item.name}</h3>
                          <p className="text-sm text-zinc-500">{item.selectedSize}</p>
                        </div>
                        <span className="font-bold text-xl text-black">€{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                      
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-3 bg-[#eeebdf] rounded-xl px-3 py-1.5">
                          <button 
                            onClick={() => updateQuantity(item.variantId, -1)} 
                            className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-lg text-zinc-600 transition-colors text-lg"
                          >
                            -
                          </button>
                          <span className="text-base font-semibold w-6 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.variantId, 1)} 
                            className="w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-lg text-zinc-600 transition-colors text-lg"
                          >
                            +
                          </button>
                        </div>
                        {/* Unit Price Display */}
                        <span className="text-sm text-zinc-400">Stukprijs: €{item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>

          {/* Summary Box */}
          {cart.length > 0 && (
            <div className="lg:w-[26rem] shrink-0">
                <div className="bg-white p-8 rounded-[2.5rem] border border-black/5 sticky top-24 shadow-sm">
                    <h3 className="font-semibold text-xl text-black mb-8">Besteloverzicht</h3>
                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between text-zinc-600 text-base">
                            <span>Subtotaal</span>
                            <span>€{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-zinc-600 text-base">
                            <span>Verzending</span>
                            <span className={shippingCost === 0 ? "text-[#17a6a6] font-medium" : ""}>
                              {shippingCost === 0 ? "Gratis" : `€${shippingCost.toFixed(2)}`}
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold text-black border-t border-black/5 pt-6 mb-8">
                        <span>Totaal</span>
                        <span>€{total.toFixed(2)}</span>
                    </div>
                    <Link 
                      href="/checkout"
                      className="w-full py-5 bg-black text-white rounded-2xl font-medium text-lg shadow-xl shadow-black/10 active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-[#222]"
                    >
                        Afrekenen <ArrowRight width={20} height={20} />
                    </Link>
                </div>
            </div>
          )}
      </div>
    </main>
  );
}
