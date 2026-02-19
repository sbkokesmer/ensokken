"use client";

import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { Product, getPrimaryImage, formatPrice } from "@/lib/types";
import { Search, X, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function SearchOverlay() {
  const { isSearchOpen, toggleSearch } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "unset";
      setSearchTerm("");
      setResults([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(url, is_primary, sort_order)")
        .ilike("name", `%${searchTerm}%`)
        .eq("is_active", true)
        .limit(9);
      setResults(data ?? []);
    }, 200);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-md transition-opacity duration-300"
        onClick={toggleSearch}
      ></div>

      <div className="absolute top-0 left-0 w-full bg-white shadow-2xl transform transition-transform duration-300 ease-out">
        <div className="max-w-4xl mx-auto px-6 py-8">

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Zoeken</h2>
            <button
              onClick={toggleSearch}
              className="p-2 -mr-2 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-100"
            >
              <X width={24} height={24} />
            </button>
          </div>

          <div className="relative mb-12">
            <input
              ref={inputRef}
              type="text"
              placeholder="Waar ben je naar op zoek?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-3xl md:text-4xl font-medium text-black placeholder:text-zinc-300 border-b-2 border-zinc-100 pb-4 focus:outline-none focus:border-black transition-colors bg-transparent"
            />
            <Search className="absolute right-0 top-2 text-zinc-400" width={32} height={32} />
          </div>

          <div className="min-h-[200px] pb-8">
            {searchTerm.length > 1 ? (
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-6">Resultaten ({results.length})</h3>
                {results.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={toggleSearch}
                        className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors"
                      >
                        <div className="w-16 h-20 bg-white rounded-lg border border-zinc-200 p-2 shrink-0">
                          <img
                            src={getPrimaryImage(product)}
                            alt={product.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-black group-hover:text-[#f24f13] transition-colors">{product.name}</h4>
                          <p className="text-sm text-zinc-500 mt-1">{formatPrice(product.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500">Geen resultaten gevonden voor &ldquo;{searchTerm}&rdquo;.</p>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-6 flex items-center gap-2">
                  <TrendingUp width={16} height={16} className="text-[#f24f13]" />
                  Populaire Zoekopdrachten
                </h3>
                <div className="flex flex-wrap gap-3">
                  {["Essential White", "Midnight Black", "Sunset Orange", "Wintercollectie"].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchTerm(tag)}
                      className="px-4 py-2 rounded-full bg-zinc-50 text-zinc-600 text-sm hover:bg-black hover:text-white transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
