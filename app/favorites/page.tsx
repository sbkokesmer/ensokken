"use client";

import { useFavorites } from "@/context/FavoritesContext";
import Link from "next/link";
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";

export default function FavoritesPage() {
  const { favoriteProducts, toggleFavorite } = useFavorites();

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto animate-in fade-in duration-500 min-h-[60vh]">
      <Link href="/collection" className="mb-8 text-sm text-zinc-500 hover:text-black flex items-center gap-1 w-fit">
        <ArrowLeft width={14} height={14} /> Terug naar Collectie
      </Link>
      
      <header className="mb-10 border-b border-black/5 pb-6">
          <h1 className="text-3xl font-semibold text-black tracking-tight mb-2">Mijn Favorieten</h1>
          <p className="text-zinc-500">Je opgeslagen producten staan hier.</p>
      </header>

      {favoriteProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6 text-zinc-300">
                <Heart width={32} height={32} />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">Je favorietenlijst is leeg</h3>
            <p className="text-zinc-500 mb-8 max-w-md">Je hebt nog geen producten toegevoegd. Klik op het hartje om producten hier toe te voegen.</p>
            <Link href="/collection" className="px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-[#222] transition-colors">
                Ontdek Producten
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-10">
            {favoriteProducts.map((product) => (
              <div key={product.id} className="group flex flex-col h-full relative">
                {/* Remove Button */}
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(product.id);
                    }}
                    className="absolute top-3 right-3 z-20 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-[#f24f13] hover:bg-zinc-50 transition-colors"
                    title="Verwijder uit favorieten"
                >
                    <Heart width={16} height={16} fill="#f24f13" />
                </button>

                <Link href={`/product/${product.id}`} className="block">
                    <div className="aspect-[4/5] bg-white rounded-2xl overflow-hidden border border-black/5 relative mb-3 hover:border-black/20 transition-all duration-300">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        loading="lazy" 
                        className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h3 className="font-medium text-black text-sm mt-1">{product.name}</h3>
                      <span className="text-zinc-500 font-semibold text-sm">{product.price}</span>
                    </div>
                </Link>
                
                <Link 
                    href={`/product/${product.id}`}
                    className="mt-3 w-full py-2.5 bg-black text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#222] transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                >
                    In Winkelwagen <ShoppingBag width={14} height={14} />
                </Link>
              </div>
            ))}
        </div>
      )}
    </main>
  );
}
