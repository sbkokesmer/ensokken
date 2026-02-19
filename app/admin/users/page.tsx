"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import { Loader2, Eye, X, Heart, ShoppingCart, ShoppingBag } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  is_admin: boolean;
  created_at: string;
}

interface CartItem {
  id: string;
  quantity: number;
  product_variants: { color_name: string; size: string; product_id: string } | null;
  products: { name: string; price: number } | null;
}

interface Favorite {
  id: string;
  products: { name: string; price: number } | null;
}

interface UserDetail {
  profile: Profile;
  cartItems: CartItem[];
  favorites: Favorite[];
  orderCount: number;
  totalSpent: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_admin", false)
      .order("created_at", { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }

  async function viewUser(profile: Profile) {
    setDetailLoading(true);
    const [
      { data: cartItems },
      { data: favorites },
      { data: orders },
    ] = await Promise.all([
      supabase.from("cart_items")
        .select("id, quantity, product_variants(color_name, size, product_id), products(name, price)")
        .eq("user_id", profile.id),
      supabase.from("favorites")
        .select("id, products(name, price)")
        .eq("user_id", profile.id),
      supabase.from("orders")
        .select("total, payment_status")
        .eq("user_id", profile.id),
    ]);

    const totalSpent = (orders ?? []).filter((o) => o.payment_status === "paid").reduce((sum, o) => sum + Number(o.total), 0);

    setSelected({
      profile,
      cartItems: (cartItems as CartItem[]) ?? [],
      favorites: (favorites as Favorite[]) ?? [],
      orderCount: orders?.length ?? 0,
      totalSpent,
    });
    setDetailLoading(false);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div>
      <AdminHeader title="Gebruikers" subtitle={`${users.length} geregistreerde klanten`} />

      <div className="p-8">
        <div className="bg-[#161616] border border-white/[0.06] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 flex items-center justify-center gap-2 text-white/30 text-sm">
              <Loader2 width={16} height={16} className="animate-spin" /> Laden...
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-white/30 text-sm">Geen gebruikers gevonden</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Gebruiker</th>
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">E-mail</th>
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Telefoon</th>
                  <th className="text-left px-5 py-3 text-white/30 text-xs font-medium">Geregistreerd</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center">
                          <span className="text-white/50 text-xs font-semibold uppercase">{u.email?.[0] ?? "?"}</span>
                        </div>
                        <p className="text-white text-sm font-medium">{u.full_name || "—"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white/60 text-sm">{u.email}</td>
                    <td className="px-5 py-3 text-white/40 text-sm">{u.phone || "—"}</td>
                    <td className="px-5 py-3 text-white/40 text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => viewUser(u)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-colors"
                      >
                        <Eye width={13} height={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {(selected || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-[#161616] border border-white/[0.08] rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            {detailLoading ? (
              <div className="p-16 flex items-center justify-center gap-2 text-white/30">
                <Loader2 width={20} height={20} className="animate-spin" />
              </div>
            ) : selected ? (
              <>
                <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/[0.05] px-6 py-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center">
                      <span className="text-white/50 text-sm font-semibold uppercase">{selected.profile.email?.[0] ?? "?"}</span>
                    </div>
                    <div>
                      <h2 className="text-white font-semibold text-sm">{selected.profile.full_name || "Naamloos"}</h2>
                      <p className="text-white/30 text-xs">{selected.profile.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                    <X width={16} height={16} />
                  </button>
                </div>

                <div className="p-6 flex flex-col gap-6">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#0d0d0d] rounded-xl p-3 text-center">
                      <p className="text-white text-lg font-semibold">{selected.orderCount}</p>
                      <p className="text-white/30 text-xs mt-0.5">Bestellingen</p>
                    </div>
                    <div className="bg-[#0d0d0d] rounded-xl p-3 text-center">
                      <p className="text-white text-lg font-semibold">€{selected.totalSpent.toFixed(2)}</p>
                      <p className="text-white/30 text-xs mt-0.5">Uitgegeven</p>
                    </div>
                    <div className="bg-[#0d0d0d] rounded-xl p-3 text-center">
                      <p className="text-white text-lg font-semibold">{selected.favorites.length}</p>
                      <p className="text-white/30 text-xs mt-0.5">Favorieten</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingCart width={14} height={14} className="text-white" />
                      <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Winkelwagen ({selected.cartItems.length})</p>
                    </div>
                    {selected.cartItems.length === 0 ? (
                      <p className="text-white/20 text-sm text-center py-4">Lege winkelwagen</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {selected.cartItems.map((item) => (
                          <div key={item.id} className="bg-[#0d0d0d] rounded-xl px-4 py-3 flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm font-medium">{item.products?.name ?? "—"}</p>
                              <p className="text-white/40 text-xs">{item.product_variants?.color_name ?? "—"} · {item.product_variants?.size ?? "—"} · ×{item.quantity}</p>
                            </div>
                            <p className="text-white/60 text-sm">€{((item.products?.price ?? 0) * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Heart width={14} height={14} className="text-white" />
                      <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Favorieten ({selected.favorites.length})</p>
                    </div>
                    {selected.favorites.length === 0 ? (
                      <p className="text-white/20 text-sm text-center py-4">Geen favorieten</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {selected.favorites.map((fav) => (
                          <div key={fav.id} className="bg-[#0d0d0d] rounded-xl px-4 py-3 flex items-center justify-between">
                            <p className="text-white text-sm">{fav.products?.name ?? "—"}</p>
                            <p className="text-white/40 text-sm">€{Number(fav.products?.price ?? 0).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
