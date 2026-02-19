"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import { Plus, Pencil, Trash2, Loader2, X, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  product_count?: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  async function fetchCategories() {
    setLoading(true);
    const { data: cats } = await supabase.from("categories").select("id, name, slug, created_at").order("name");
    if (!cats) { setLoading(false); return; }

    const withCounts = await Promise.all(
      cats.map(async (c) => {
        const { count } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("category_id", c.id);
        return { ...c, product_count: count ?? 0 };
      })
    );
    setCategories(withCounts);
    setLoading(false);
  }

  function slugify(s: string) {
    return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setSaving(true);
    const slug = newSlug || slugify(newName);
    await supabase.from("categories").insert({ name: newName.trim(), slug });
    setNewName("");
    setNewSlug("");
    setShowAdd(false);
    setSaving(false);
    fetchCategories();
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    setSaving(true);
    const slug = editSlug || slugify(editName);
    await supabase.from("categories").update({ name: editName.trim(), slug }).eq("id", id);
    setEditingId(null);
    setSaving(false);
    fetchCategories();
  }

  async function handleDelete(id: string) {
    if (!confirm("Categorie verwijderen? Producten worden niet verwijderd.")) return;
    setDeleting(id);
    await supabase.from("categories").delete().eq("id", id);
    setDeleting(null);
    fetchCategories();
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div>
      <AdminHeader
        title="Categorieën"
        subtitle={`${categories.length} categorieën`}
        action={
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 h-9 px-4 bg-[#f24f13] text-white rounded-xl text-sm font-medium hover:bg-[#e04410] transition-colors"
          >
            <Plus width={15} height={15} />
            Nieuwe categorie
          </button>
        }
      />

      <div className="p-8 flex flex-col gap-5">
        {showAdd && (
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-4">Nieuwe categorie</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Naam *</label>
                <input value={newName} onChange={(e) => { setNewName(e.target.value); setNewSlug(slugify(e.target.value)); }}
                  placeholder="Heren"
                  className="w-full h-10 px-3 bg-[#0f0f0f] border border-white/5 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Slug</label>
                <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="heren"
                  className="w-full h-10 px-3 bg-[#0f0f0f] border border-white/5 rounded-xl text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/15 transition-colors font-mono" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowAdd(false)} className="flex items-center gap-1.5 h-9 px-4 bg-white/5 text-white/50 rounded-xl text-sm hover:bg-white/8 hover:text-white transition-colors">
                <X width={14} height={14} /> Annuleren
              </button>
              <button onClick={handleAdd} disabled={saving || !newName.trim()} className="flex items-center gap-1.5 h-9 px-4 bg-[#f24f13] text-white rounded-xl text-sm font-medium hover:bg-[#e04410] transition-colors disabled:opacity-50">
                {saving ? <Loader2 width={14} height={14} className="animate-spin" /> : <Check width={14} height={14} />}
                Toevoegen
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center gap-2 text-white/30 text-sm">
              <Loader2 width={16} height={16} className="animate-spin" /> Laden...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-white/30 text-sm">Geen categorieën</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Naam</th>
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Slug</th>
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Producten</th>
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Aangemaakt</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3">
                      {editingId === c.id ? (
                        <input value={editName} onChange={(e) => { setEditName(e.target.value); setEditSlug(slugify(e.target.value)); }}
                          className="h-8 px-3 bg-[#0f0f0f] border border-white/10 rounded-lg text-white text-sm focus:outline-none w-36" />
                      ) : (
                        <span className="text-white text-sm font-medium">{c.name}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editingId === c.id ? (
                        <input value={editSlug} onChange={(e) => setEditSlug(e.target.value)}
                          className="h-8 px-3 bg-[#0f0f0f] border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none w-36" />
                      ) : (
                        <span className="text-white/40 text-xs font-mono">{c.slug}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-white/60 text-sm">{c.product_count}</span>
                    </td>
                    <td className="px-5 py-3 text-white/40 text-xs">{formatDate(c.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {editingId === c.id ? (
                          <>
                            <button onClick={() => handleUpdate(c.id)} disabled={saving} className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-colors">
                              {saving ? <Loader2 width={13} height={13} className="animate-spin" /> : <Check width={13} height={13} />}
                            </button>
                            <button onClick={() => setEditingId(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
                              <X width={13} height={13} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditingId(c.id); setEditName(c.name); setEditSlug(c.slug); }}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors">
                              <Pencil width={13} height={13} />
                            </button>
                            <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-400/10 text-white/30 hover:text-red-400 transition-colors">
                              {deleting === c.id ? <Loader2 width={13} height={13} className="animate-spin" /> : <Trash2 width={13} height={13} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
