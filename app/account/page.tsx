"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User, Package, LogOut, Save, Loader2, ChevronRight, LayoutDashboard } from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  color_name: string;
  size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  created_at: string;
  order_items?: OrderItem[];
}

const statusLabels: Record<string, string> = {
  pending: "In afwachting",
  confirmed: "Bevestigd",
  processing: "Verwerking",
  shipped: "Verzonden",
  delivered: "Bezorgd",
  cancelled: "Geannuleerd",
  refunded: "Terugbetaald",
};

const statusColors: Record<string, string> = {
  pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
  confirmed: "text-blue-700 bg-blue-50 border-blue-200",
  processing: "text-orange-700 bg-orange-50 border-orange-200",
  shipped: "text-cyan-700 bg-cyan-50 border-cyan-200",
  delivered: "text-green-700 bg-green-50 border-green-200",
  cancelled: "text-red-700 bg-red-50 border-red-200",
  refunded: "text-zinc-700 bg-zinc-100 border-zinc-200",
};

type Tab = "profile" | "orders";

export default function AccountPage() {
  const { user, profile, signOut, updateProfile, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === "orders" && user) {
      fetchOrders();
    }
  }, [activeTab, user]);

  async function fetchOrders() {
    setOrdersLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setOrders(data ?? []);
    setOrdersLoading(false);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    const { error } = await updateProfile({ full_name: fullName, phone });
    setSaving(false);
    if (error) {
      setSaveMsg("Er is iets misgegaan.");
    } else {
      setSaveMsg("Opgeslagen!");
      setTimeout(() => setSaveMsg(null), 3000);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eeebdf]">
        <Loader2 className="animate-spin text-black/30" width={32} height={32} />
      </div>
    );
  }

  const tabs = [
    { id: "profile" as Tab, label: "Mijn profiel", icon: User },
    { id: "orders" as Tab, label: "Bestellingen", icon: Package },
  ];

  return (
    <main className="min-h-screen bg-[#eeebdf] pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-black tracking-tight">
                Hallo, {profile?.full_name?.split(" ")[0] || "daar"}
              </h1>
              <p className="text-zinc-500 text-sm mt-0.5">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => router.push("/admin")}
                  className="flex items-center gap-2 text-sm font-medium text-[#f24f13] hover:text-white hover:bg-[#f24f13] transition-all duration-200 px-4 py-2 rounded-xl border border-[#f24f13]/30 hover:border-[#f24f13]"
                >
                  <LayoutDashboard width={15} height={15} />
                  <span>Admin Panel</span>
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-sm text-zinc-500 hover:text-black transition-colors px-4 py-2 rounded-xl hover:bg-black/5"
              >
                <LogOut width={15} height={15} />
                <span className="hidden sm:block">Uitloggen</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-1 bg-black/5 rounded-2xl p-1.5 mb-8 w-full sm:w-auto sm:inline-flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white text-black shadow-sm"
                    : "text-zinc-500 hover:text-black"
                }`}
              >
                <Icon width={15} height={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
            <div className="p-6 border-b border-black/5">
              <h2 className="text-base font-semibold text-black">Persoonlijke gegevens</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Beheer je accountinformatie</p>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                    Volledige naam
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jan de Vries"
                    className="w-full h-11 px-4 rounded-xl border border-black/10 bg-[#eeebdf]/50 text-black text-sm placeholder:text-zinc-400 focus:outline-none focus:border-black/30 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                    E-mailadres
                  </label>
                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="w-full h-11 px-4 rounded-xl border border-black/5 bg-black/5 text-zinc-400 text-sm cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                    Telefoonnummer
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+31 6 12345678"
                    className="w-full h-11 px-4 rounded-xl border border-black/10 bg-[#eeebdf]/50 text-black text-sm placeholder:text-zinc-400 focus:outline-none focus:border-black/30 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/5">
                {saveMsg && (
                  <p className={`text-sm font-medium ${saveMsg === "Opgeslagen!" ? "text-green-600" : "text-red-500"}`}>
                    {saveMsg}
                  </p>
                )}
                <div className="ml-auto">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 h-10 px-5 bg-black text-[#eeebdf] rounded-xl text-sm font-medium hover:bg-[#f24f13] transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <Loader2 width={14} height={14} className="animate-spin" />
                    ) : (
                      <Save width={14} height={14} />
                    )}
                    Opslaan
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
            <div className="p-6 border-b border-black/5">
              <h2 className="text-base font-semibold text-black">Mijn bestellingen</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Overzicht van al je bestellingen</p>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-black/30" width={28} height={28} />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#eeebdf] flex items-center justify-center mb-4">
                  <Package width={24} height={24} className="text-zinc-400" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium text-black mb-1">Nog geen bestellingen</p>
                <p className="text-xs text-zinc-500 mb-6 max-w-xs">
                  Je hebt nog geen bestellingen geplaatst. Ontdek onze collectie!
                </p>
                <a
                  href="/collection"
                  className="flex items-center gap-2 h-10 px-5 bg-black text-[#eeebdf] rounded-xl text-sm font-medium hover:bg-[#f24f13] transition-colors duration-300"
                >
                  Bekijk collectie
                  <ChevronRight width={14} height={14} />
                </a>
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {orders.map((order) => (
                  <div key={order.id} className="p-5">
                    <button
                      onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="w-full flex items-center justify-between gap-4 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#eeebdf] flex items-center justify-center shrink-0">
                          <Package width={18} height={18} className="text-zinc-600" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-black font-mono">{order.order_number}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{formatDate(order.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${statusColors[order.status] || "text-zinc-600 bg-zinc-50 border-zinc-200"}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                        <span className="text-sm font-semibold text-black">€{Number(order.total).toFixed(2)}</span>
                        <ChevronRight
                          width={14}
                          height={14}
                          className={`text-zinc-400 transition-transform duration-200 ${expandedOrder === order.id ? "rotate-90" : ""}`}
                        />
                      </div>
                    </button>

                    {expandedOrder === order.id && order.order_items && order.order_items.length > 0 && (
                      <div className="mt-4 pl-14 space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-zinc-50 rounded-xl px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-black">{item.product_name}</p>
                              <p className="text-xs text-zinc-500">{item.color_name} — {item.size} — x{item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium text-black">€{Number(item.line_total).toFixed(2)}</p>
                          </div>
                        ))}
                        <div className="flex justify-between text-xs text-zinc-500 px-1 pt-1">
                          <span>Verzending: {Number(order.shipping_cost) === 0 ? "Gratis" : `€${Number(order.shipping_cost).toFixed(2)}`}</span>
                          <span className="font-semibold text-black">Totaal: €{Number(order.total).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
