"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Product, getPrimaryImage, getProductColors, formatPrice } from "@/lib/types";
import Link from "next/link";
import { SlidersHorizontal, ChevronDown, Check, ChevronLeft, ChevronRight, Heart, Loader2 } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

interface Category {
  id: string;
  name: string;
}

const PRICE_RANGES = [
  { key: "0-20", label: "€0 - €20", match: (price: number) => price <= 20 },
  { key: "20+", label: "€20+", match: (price: number) => price > 20 },
];

export default function CollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOpen, setSortOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState("Aanbevolen");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  const { isFavorite, toggleFavorite } = useFavorites();

  const itemsPerPage = 20;

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select("*, product_images(url, is_primary, sort_order), product_variants(id, color_hex, color_name, size, stock_quantity)")
        .eq("is_active", true)
        .order("created_at", { ascending: true }),
      supabase.from("categories").select("id, name").order("name"),
    ]);
    setProducts(productsRes.data ?? []);
    setCategories(categoriesRes.data ?? []);
    setLoading(false);
  }

  const sizeOptions = useMemo(() => {
    const sizes = new Set<string>();
    for (const p of products) for (const v of p.product_variants ?? []) sizes.add(v.size);
    return Array.from(sizes).sort((a, b) => parseInt(a) - parseInt(b));
  }, [products]);

  const colorOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of products) for (const v of p.product_variants ?? []) {
      if (!seen.has(v.color_hex)) seen.set(v.color_hex, v.color_name);
    }
    return Array.from(seen.entries()).map(([hex, name]) => ({ hex, name }));
  }, [products]);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedPrices([]);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 || selectedColors.length > 0 || selectedSizes.length > 0 || selectedPrices.length > 0;

  const filtered = products.filter((p) => {
    if (selectedCategories.length > 0 && (!p.category_id || !selectedCategories.includes(p.category_id))) return false;
    if (selectedColors.length > 0 && !p.product_variants?.some((v) => selectedColors.includes(v.color_hex))) return false;
    if (selectedSizes.length > 0 && !p.product_variants?.some((v) => selectedSizes.includes(v.size))) return false;
    if (selectedPrices.length > 0 && !PRICE_RANGES.some((r) => selectedPrices.includes(r.key) && r.match(p.price))) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (currentSort === "Prijs: Laag naar Hoog") return a.price - b.price;
    if (currentSort === "Prijs: Hoog naar Laag") return b.price - a.price;
    if (currentSort === "Nieuwste") return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = sorted.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row gap-12">

        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 h-fit space-y-8">
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <h2 className="font-semibold text-lg tracking-tight flex items-center gap-2">
              <SlidersHorizontal width={16} height={16} /> Filters
            </h2>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-zinc-500 hover:text-black underline">Wissen</button>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between cursor-pointer group">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Categorie</p>
              <ChevronDown width={14} height={14} className="text-zinc-400 group-hover:text-black transition-colors" />
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={selectedCategories.length === 0}
                  onChange={() => { setSelectedCategories([]); setCurrentPage(1); }}
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedCategories.length === 0 ? "bg-black border-black" : "border-zinc-300 bg-white"}`}>
                  {selectedCategories.length === 0 && <Check className="text-white" width={10} height={10} />}
                </div>
                <span className="text-sm text-zinc-600 group-hover:text-black transition-colors">Alle Sokken</span>
                <span className="ml-auto text-xs text-zinc-400">{products.length}</span>
              </label>
              {categories.map((c) => {
                const checked = selectedCategories.includes(c.id);
                return (
                  <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggle(selectedCategories, setSelectedCategories, c.id)}
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${checked ? "bg-black border-black" : "border-zinc-300 bg-white"}`}>
                      {checked && <Check className="text-white" width={10} height={10} />}
                    </div>
                    <span className="text-sm text-zinc-600 group-hover:text-black transition-colors">{c.name}</span>
                    <span className="ml-auto text-xs text-zinc-400">{products.filter((p) => p.category_id === c.id).length}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-black/5">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Kleur</p>
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((c) => {
                const selected = selectedColors.includes(c.hex);
                return (
                  <button
                    key={c.hex}
                    onClick={() => toggle(selectedColors, setSelectedColors, c.hex)}
                    className={`w-6 h-6 rounded-full border border-black/10 ring-2 transition-all ${selected ? "ring-black/60" : "ring-transparent hover:ring-black/20"}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    aria-pressed={selected}
                  ></button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-black/5">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Maat</p>
            <div className="grid grid-cols-2 gap-2">
              {sizeOptions.map((size) => {
                const selected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => toggle(selectedSizes, setSelectedSizes, size)}
                    className={`px-2 py-1.5 rounded-lg border text-xs font-medium transition-colors ${selected ? "border-black bg-black text-white" : "border-black/5 bg-white hover:border-black"}`}
                    aria-pressed={selected}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-black/5">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Prijs</p>
            <div className="space-y-3">
              {PRICE_RANGES.map((range) => {
                const checked = selectedPrices.includes(range.key);
                return (
                  <label key={range.key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggle(selectedPrices, setSelectedPrices, range.key)}
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${checked ? "bg-black border-black" : "border-zinc-300 bg-white"}`}>
                      {checked && <Check className="text-white" width={10} height={10} />}
                    </div>
                    <span className="text-sm text-zinc-600 group-hover:text-black transition-colors">{range.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-black/5 gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-black tracking-tight">Collectie</h1>
              <span className="text-sm text-zinc-500 mt-1 block">
                {hasActiveFilters ? `${sorted.length} van ${products.length} producten` : `Totaal ${products.length} Producten`}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500">Sorteren:</span>
              <div className="relative z-20">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  onBlur={() => setTimeout(() => setSortOpen(false), 200)}
                  className="flex items-center gap-2 text-sm font-medium bg-white px-4 py-2 rounded-lg border border-black/5 hover:border-black/20 transition-colors shadow-sm focus:outline-none focus:border-black/30 w-48 justify-between"
                >
                  <span>{currentSort}</span>
                  <ChevronDown width={14} height={14} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-black/5 shadow-xl p-1.5 flex flex-col gap-0.5 z-30 animate-in fade-in zoom-in-95 duration-200">
                    {["Aanbevolen", "Nieuwste", "Prijs: Laag naar Hoog", "Prijs: Hoog naar Laag"].map((sort) => (
                      <button
                        key={sort}
                        onClick={() => { setCurrentSort(sort); setSortOpen(false); setCurrentPage(1); }}
                        className="text-left px-3 py-2 text-sm text-zinc-600 hover:text-black hover:bg-zinc-50 rounded-lg transition-colors font-medium"
                      >
                        {sort}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-24 gap-3 text-zinc-400">
              <Loader2 width={20} height={20} className="animate-spin" />
              <span className="text-sm">Laden...</span>
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <p className="text-zinc-500 text-sm">Geen producten gevonden met deze filters.</p>
              <button
                onClick={clearFilters}
                className="text-sm font-medium underline text-black hover:text-zinc-600 transition-colors"
              >
                Filters wissen
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-10">
                {currentProducts.map((product) => {
                  const isFav = isFavorite(product.id);
                  const primaryImg = getPrimaryImage(product);
                  const colors = getProductColors(product);
                  return (
                    <div key={product.id} className="group flex flex-col h-full relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(product.id);
                        }}
                        className="absolute top-3 right-3 z-20 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      >
                        <Heart width={16} height={16} className={isFav ? "fill-[#f24f13] text-[#f24f13]" : "text-zinc-400"} />
                      </button>

                      <Link href={`/product/${product.id}`} className="cursor-pointer flex flex-col h-full">
                        <div className="aspect-[4/5] bg-white rounded-2xl overflow-hidden border border-black/5 relative mb-3 hover:border-black/20 transition-all duration-300">
                          {product.badge && (
                            <span
                              className="absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-full z-10 uppercase tracking-wide"
                              style={{
                                background: product.badge === "Nieuw" ? "#17a6a6" : product.badge === "Aanbieding" ? "#f24f13" : product.badge === "Premium" ? "#1a1a1a" : "#6b7280",
                                color: "#fff",
                              }}
                            >
                              {product.badge}
                            </span>
                          )}
                          <img
                            src={primaryImg}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-1.5 mt-2">
                            {colors.map((c, i) => (
                              <span
                                key={i}
                                className={`w-3 h-3 rounded-full border border-black/10 ${i === 0 ? "ring-1 ring-offset-1 ring-black/20" : ""}`}
                                style={{ backgroundColor: c }}
                              ></span>
                            ))}
                          </div>
                          <h3 className="font-medium text-black text-sm mt-1">{product.name}</h3>
                          <span className="text-zinc-500 font-semibold text-sm">{formatPrice(product.price)}</span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-16 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-black/5 bg-white text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:border-black/20 transition-colors"
                  >
                    <ChevronLeft width={16} height={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border font-medium text-sm transition-colors ${
                        currentPage === page
                          ? "border-black bg-black text-white"
                          : "border-black/5 bg-white text-zinc-600 hover:border-black/20"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-black/5 bg-white text-zinc-600 hover:border-black/20 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight width={16} height={16} />
                  </button>
                </div>
              )}
              <div className="text-center mt-4 text-xs text-zinc-400">
                <span>{startIndex + 1}-{Math.min(startIndex + itemsPerPage, sorted.length)}</span> / {sorted.length} producten getoond
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
