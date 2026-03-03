"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import { Plus, Pencil, Trash2, Search, Loader2, X, ChevronDown } from "lucide-react";

interface Category { id: string; name: string; }
interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  badge: string;
  is_active: boolean;
  category_id: string | null;
  description: string;
  created_at: string;
  categories?: { name: string } | null;
  product_images?: { url: string; is_primary: boolean }[];
}

const emptyForm = {
  sku: "", name: "", description: "", price: "", badge: "", category_id: "", is_active: true,
  images: ["", "", ""],
  variants: [
    { color_hex: "#f0f0f0", color_name: "Crème", size: "36-39", stock_quantity: 0 },
    { color_hex: "#f0f0f0", color_name: "Crème", size: "40-43", stock_quantity: 0 },
    { color_hex: "#f0f0f0", color_name: "Crème", size: "44-46", stock_quantity: 0 },
  ],
};

type FormState = typeof emptyForm;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*, categories(name), product_images(url, is_primary)").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name"),
    ]);
    setProducts(prods ?? []);
    setCategories(cats ?? []);
    setLoading(false);
  }

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditId(p.id);
    setFormError(null);
    const imgs = p.product_images?.map((i) => i.url) ?? [];
    while (imgs.length < 3) imgs.push("");
    setForm({
      sku: p.sku,
      name: p.name,
      description: p.description,
      price: String(p.price),
      badge: p.badge,
      category_id: p.category_id ?? "",
      is_active: p.is_active,
      images: imgs.slice(0, 3),
      variants: emptyForm.variants,
    });
    setShowModal(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Dit product verwijderen?")) return;
    setDeleting(id);
    await supabase.from("products").delete().eq("id", id);
    setDeleting(null);
    fetchAll();
  }

  async function handleSave() {
    if (!form.name.trim() || !form.price || !form.sku.trim()) {
      setFormError("Vul alle verplichte velden in (SKU, naam, prijs).");
      return;
    }
    setSaving(true);
    setFormError(null);

    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description,
      price: parseFloat(form.price),
      badge: form.badge,
      category_id: form.category_id || null,
      is_active: form.is_active,
    };

    let productId = editId;

    if (editId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editId);
      if (error) { setFormError(error.message); setSaving(false); return; }
      await supabase.from("product_images").delete().eq("product_id", editId);
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error) { setFormError(error.message); setSaving(false); return; }
      productId = data.id;
    }

    const imgInserts = form.images
      .filter((url) => url.trim())
      .map((url, i) => ({ product_id: productId!, url: url.trim(), is_primary: i === 0, sort_order: i }));
    if (imgInserts.length) await supabase.from("product_images").insert(imgInserts);

    if (!editId && form.variants.some((v) => v.color_hex)) {
      const varInserts = form.variants.map((v) => ({ ...v, product_id: productId! }));
      await supabase.from("product_variants").upsert(varInserts, { onConflict: "product_id,color_hex,size" });
    }

    setSaving(false);
    setShowModal(false);
    fetchAll();
  }

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "all"
        ? true
        : categoryFilter === "none"
        ? !p.category_id
        : p.category_id === categoryFilter;
    return matchSearch && matchCategory;
  });

  const primaryImg = (p: Product) => p.product_images?.find((i) => i.is_primary)?.url ?? p.product_images?.[0]?.url ?? "";

  return (
    <div>
      <AdminHeader
        title="Producten"
        subtitle={`${products.length} producten`}
        action={
          <button
            onClick={openAdd}
            className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium transition-colors"
            style={{ background: "var(--at-btn-primary-bg)", color: "var(--at-btn-primary-text)" }}
          >
            <Plus width={15} height={15} />
            Nieuw product
          </button>
        }
      />

      <div className="p-8 flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search width={14} height={14} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--at-text-muted)" }} />
            <input
              type="text"
              placeholder="Zoeken op naam of SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl text-sm focus:outline-none transition-colors"
              style={{ background: "var(--at-surface)", border: "1px solid var(--at-border)", color: "var(--at-text)" }}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[{ id: "all", label: `Tümü (${products.length})` }, ...categories.map((c) => ({ id: c.id, label: `${c.name} (${products.filter((p) => p.category_id === c.id).length})` })), ...(products.some((p) => !p.category_id) ? [{ id: "none", label: `Zonder categorie (${products.filter((p) => !p.category_id).length})` }] : [])].map((item) => (
              <button
                key={item.id}
                onClick={() => setCategoryFilter(item.id)}
                className="h-8 px-3 rounded-lg text-xs font-medium transition-colors"
                style={categoryFilter === item.id
                  ? { background: "var(--at-text)", color: "var(--at-bg)" }
                  : { background: "var(--at-surface)", border: "1px solid var(--at-border)", color: "var(--at-text-secondary)" }
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--at-surface)", border: "1px solid var(--at-border)" }}>
          {loading ? (
            <div className="p-12 text-center text-sm flex items-center justify-center gap-2" style={{ color: "var(--at-text-muted)" }}>
              <Loader2 width={16} height={16} className="animate-spin" /> Laden...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm" style={{ color: "var(--at-text-muted)" }}>Geen producten gevonden</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--at-border)" }}>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Product</th>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>SKU</th>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Categorie</th>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Prijs</th>
                  <th className="text-left px-5 py-3 text-xs font-medium" style={{ color: "var(--at-text-muted)" }}>Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="transition-colors" style={{ borderBottom: "1px solid var(--at-border)" }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {primaryImg(p) ? (
                          <img src={primaryImg(p)} alt={p.name} className="w-9 h-9 rounded-lg object-cover" style={{ background: "var(--at-hover-btn)" }} />
                        ) : (
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xs" style={{ background: "var(--at-hover-btn)", color: "var(--at-text-placeholder)" }}>?</div>
                        )}
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--at-text)" }}>{p.name}</p>
                          {p.badge && <span className="text-[10px] font-medium" style={{ color: "var(--at-text-secondary)" }}>{p.badge}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono" style={{ color: "var(--at-text-dim)" }}>{p.sku}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: "var(--at-text-secondary)" }}>{p.categories?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-sm font-medium" style={{ color: "var(--at-text)" }}>€{Number(p.price).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${p.is_active ? "text-green-400 bg-green-400/10" : "text-zinc-400 bg-zinc-400/10"}`}>
                        {p.is_active ? "Actief" : "Inactief"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => openEdit(p)}
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
                          <Pencil width={13} height={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:text-red-400 hover:bg-red-400/10"
                          style={{ color: "var(--at-text-muted)" }}
                        >
                          {deleting === p.id ? <Loader2 width={13} height={13} className="animate-spin" /> : <Trash2 width={13} height={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div
            className="relative rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{ background: "var(--at-surface)", border: "1px solid var(--at-border-strong)" }}
          >
            <div
              className="sticky top-0 px-6 py-4 flex items-center justify-between z-10"
              style={{ background: "var(--at-surface-2)", borderBottom: "1px solid var(--at-border)" }}
            >
              <h2 className="font-semibold text-base" style={{ color: "var(--at-text)" }}>{editId ? "Product bewerken" : "Nieuw product"}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: "var(--at-text-dim)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "var(--at-hover-btn)";
                  (e.currentTarget as HTMLElement).style.color = "var(--at-hover-btn-text)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--at-text-dim)";
                }}
              >
                <X width={16} height={16} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--at-text-dim)" }}>SKU *</label>
                  <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="ENS-WHITE-001"
                    className="w-full h-10 px-3 rounded-xl text-sm focus:outline-none transition-colors"
                    style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--at-text-dim)" }}>Naam *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Essential White"
                    className="w-full h-10 px-3 rounded-xl text-sm focus:outline-none transition-colors"
                    style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--at-text-dim)" }}>Prijs (€) *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="26.00"
                    className="w-full h-10 px-3 rounded-xl text-sm focus:outline-none transition-colors"
                    style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--at-text-dim)" }}>Label</label>
                  <select value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl text-sm focus:outline-none transition-colors appearance-none"
                    style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }}>
                    <option value="">Geen label</option>
                    <option value="Nieuw">Nieuw</option>
                    <option value="Premium">Premium</option>
                    <option value="Aanbieding">Aanbieding</option>
                    <option value="Standaard">Standaard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--at-text-dim)" }}>Categorie</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl text-sm focus:outline-none transition-colors appearance-none"
                    style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }}>
                    <option value="">Geen categorie</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--at-text-dim)" }}>Status</label>
                  <select value={form.is_active ? "true" : "false"} onChange={(e) => setForm({ ...form, is_active: e.target.value === "true" })}
                    className="w-full h-10 px-3 rounded-xl text-sm focus:outline-none transition-colors appearance-none"
                    style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }}>
                    <option value="true">Actief</option>
                    <option value="false">Inactief</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--at-text-dim)" }}>Beschrijving</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} placeholder="Productbeschrijving..."
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-colors resize-none"
                  style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }} />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: "var(--at-text-dim)" }}>Afbeeldingen (URL)</label>
                <div className="flex flex-col gap-2">
                  {form.images.map((url, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs w-5 text-center" style={{ color: "var(--at-text-faint)" }}>{i + 1}</span>
                      <input value={url} onChange={(e) => {
                        const imgs = [...form.images]; imgs[i] = e.target.value; setForm({ ...form, images: imgs });
                      }}
                        placeholder={i === 0 ? "Hoofdafbeelding URL" : `Afbeelding ${i + 1} URL`}
                        className="flex-1 h-9 px-3 rounded-xl text-xs focus:outline-none transition-colors"
                        style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }} />
                      {url && <img src={url} className="w-9 h-9 rounded-lg object-cover" style={{ background: "var(--at-hover-btn)" }} onError={(e) => (e.currentTarget.style.display = "none")} />}
                    </div>
                  ))}
                </div>
              </div>

              {!editId && (
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: "var(--at-text-dim)" }}>Varianten (kleur + maat)</label>
                  <div className="flex flex-col gap-2">
                    {form.variants.map((v, i) => (
                      <div key={i} className="grid grid-cols-4 gap-2 items-center">
                        <input value={v.color_hex} onChange={(e) => {
                          const vs = [...form.variants]; vs[i] = { ...vs[i], color_hex: e.target.value }; setForm({ ...form, variants: vs });
                        }} placeholder="#f0f0f0" className="h-8 px-2 rounded-lg text-xs focus:outline-none font-mono"
                          style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }} />
                        <input value={v.color_name} onChange={(e) => {
                          const vs = [...form.variants]; vs[i] = { ...vs[i], color_name: e.target.value }; setForm({ ...form, variants: vs });
                        }} placeholder="Crème" className="h-8 px-2 rounded-lg text-xs focus:outline-none"
                          style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }} />
                        <select value={v.size} onChange={(e) => {
                          const vs = [...form.variants]; vs[i] = { ...vs[i], size: e.target.value }; setForm({ ...form, variants: vs });
                        }} className="h-8 px-2 rounded-lg text-xs focus:outline-none appearance-none"
                          style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }}>
                          <option>36-39</option><option>40-43</option><option>44-46</option>
                        </select>
                        <input type="number" min="0" value={v.stock_quantity} onChange={(e) => {
                          const vs = [...form.variants]; vs[i] = { ...vs[i], stock_quantity: parseInt(e.target.value) || 0 }; setForm({ ...form, variants: vs });
                        }} placeholder="Voorraad" className="h-8 px-2 rounded-lg text-xs focus:outline-none"
                          style={{ background: "var(--at-surface-input)", border: "1px solid var(--at-border-input)", color: "var(--at-text)" }} />
                      </div>
                    ))}
                    <button type="button" onClick={() => setForm({ ...form, variants: [...form.variants, { color_hex: "#f0f0f0", color_name: "Crème", size: "40-43", stock_quantity: 0 }] })}
                      className="flex items-center gap-1.5 text-xs transition-colors mt-1" style={{ color: "var(--at-text-muted)" }}>
                      <Plus width={12} height={12} /> Variant toevoegen
                    </button>
                  </div>
                </div>
              )}

              {formError && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2.5">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-10 rounded-xl text-sm transition-colors"
                  style={{ background: "var(--at-btn-secondary-bg)", color: "var(--at-btn-secondary-text)" }}
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 h-10 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: "var(--at-btn-primary-bg)", color: "var(--at-btn-primary-text)" }}
                >
                  {saving && <Loader2 width={14} height={14} className="animate-spin" />}
                  {editId ? "Bijwerken" : "Toevoegen"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
