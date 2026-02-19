"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import Link from "next/link";
import { ShoppingBag, ChevronDown, Heart, Star, Truck, ShieldCheck } from "lucide-react";

interface ProductClientProps {
  product: Product;
}

export default function ProductClient({ product }: ProductClientProps) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const images = (product.product_images ?? []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const fallback = 'https://images.pexels.com/photos/4495705/pexels-photo-4495705.jpeg?auto=compress&cs=tinysrgb&w=800';
  const primaryImg = images.find(i => i.is_primary)?.url ?? images[0]?.url ?? fallback;

  const uniqueColors = Array.from(
    new Map((product.product_variants ?? []).map(v => [v.color_hex, v])).values()
  );
  const availableSizes = Array.from(new Set((product.product_variants ?? []).map(v => v.size))).sort();

  const [currentImage, setCurrentImage] = useState(primaryImg);
  const [selectedColor, setSelectedColor] = useState(uniqueColors[0]?.color_hex ?? "");
  const [selectedColorName, setSelectedColorName] = useState(uniqueColors[0]?.color_name ?? "");
  const [selectedSize, setSelectedSize] = useState(availableSizes[0] ?? "40-43");
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isCareOpen, setIsCareOpen] = useState(false);

  useEffect(() => {
    setCurrentImage(primaryImg);
    if (uniqueColors.length > 0) {
      setSelectedColor(uniqueColors[0].color_hex);
      setSelectedColorName(uniqueColors[0].color_name);
    }
  }, [product.id]);

  function handleColorChange(hex: string, name: string, idx: number) {
    setSelectedColor(hex);
    setSelectedColorName(name);
    if (images[idx]) setCurrentImage(images[idx].url);
  }

  const isFav = isFavorite(product.id);

  return (
    <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <span>/</span>
        <Link href="/collection" className="hover:text-black transition-colors">Collectie</Link>
        <span>/</span>
        <span className="text-black font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="aspect-[4/5] bg-[#f4f4f5] rounded-[2rem] relative overflow-hidden group">
            {product.badge && (
              <span className="absolute top-6 left-6 bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full z-20 uppercase tracking-wider">
                {product.badge}
              </span>
            )}
            <div className="absolute inset-0 opacity-10 transition-colors duration-500" style={{ backgroundColor: selectedColor }} />
            <img
              src={currentImage}
              className="w-full h-full object-cover object-center mix-blend-multiply transition-all duration-500 hover:scale-105"
              alt={product.name}
            />
            <button
              onClick={() => toggleFavorite(product.id)}
              className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform z-20"
            >
              <Heart width={20} height={20} className={isFav ? "fill-black text-black" : "text-zinc-400"} />
            </button>
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map(img => (
                <button
                  key={img.url}
                  onClick={() => setCurrentImage(img.url)}
                  className={`aspect-square rounded-xl border-2 overflow-hidden ${currentImage === img.url ? 'border-black' : 'border-transparent'}`}
                >
                  <img src={img.url} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col h-full">
          <div className="sticky top-24">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-black tracking-tight mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-black">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span className="text-xs text-zinc-500 font-medium">(128 Reviews)</span>
              </div>
              <p className="text-3xl font-medium text-black">€{Number(product.price).toFixed(2)}</p>
            </div>

            {product.description && (
              <div className="prose prose-zinc text-zinc-600 mb-8 leading-relaxed">
                {product.description}
              </div>
            )}

            <div className="space-y-8 border-t border-zinc-100 pt-8">
              {uniqueColors.length > 0 && (
                <div>
                  <span className="text-sm font-bold text-black mb-3 block uppercase tracking-wide">
                    Kleur: <span className="font-normal normal-case text-zinc-600">{selectedColorName}</span>
                  </span>
                  <div className="flex gap-3">
                    {uniqueColors.map((v, idx) => (
                      <button
                        key={v.color_hex}
                        onClick={() => handleColorChange(v.color_hex, v.color_name, idx)}
                        className={`w-10 h-10 rounded-full border border-black/10 transition-all ${selectedColor === v.color_hex ? 'ring-2 ring-black ring-offset-2' : ''}`}
                        style={{ backgroundColor: v.color_hex }}
                        title={v.color_name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {availableSizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-black uppercase tracking-wide">Maat</span>
                    <button className="text-xs text-zinc-500 underline">Maattabel</button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {availableSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-3 rounded-xl border transition-all text-sm font-medium ${
                          selectedSize === size
                            ? 'bg-black text-white border-black shadow-md'
                            : 'border-zinc-200 bg-white text-black hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => addToCart(product, selectedSize, selectedColor, selectedColorName)}
                className="w-full py-4 bg-black hover:bg-[#222] text-white rounded-xl font-bold shadow-lg shadow-black/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-lg"
              >
                <ShoppingBag width={20} height={20} />
                In Winkelwagen
              </button>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 text-xs font-medium text-zinc-600 bg-zinc-50 p-3 rounded-lg">
                  <Truck size={18} />
                  <span>Gratis verzending<br />vanaf €50</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-zinc-600 bg-zinc-50 p-3 rounded-lg">
                  <ShieldCheck size={18} />
                  <span>30 dagen<br />bedenktijd</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <div className="border-b border-zinc-100">
                  <button
                    onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                    className="flex justify-between items-center w-full py-4 font-medium text-sm text-black"
                  >
                    Productkenmerken
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isDescriptionOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isDescriptionOpen && (
                    <div className="pb-4 text-sm text-zinc-500 leading-relaxed animate-in slide-in-from-top-2">
                      %85 Biologisch Katoen, %13 Polyamide, %2 Elastaan.<br />
                      Speciale ademende breitechnologie voor maximaal comfort.
                    </div>
                  )}
                </div>
                <div className="border-b border-zinc-100">
                  <button
                    onClick={() => setIsCareOpen(!isCareOpen)}
                    className="flex justify-between items-center w-full py-4 font-medium text-sm text-black"
                  >
                    Wasvoorschriften
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isCareOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isCareOpen && (
                    <div className="pb-4 text-sm text-zinc-500 leading-relaxed animate-in slide-in-from-top-2">
                      Binnenstebuiten wassen op 30°C.<br />
                      Geen bleekmiddel gebruiken.<br />
                      Niet in de droger.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
