"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User, Package, MapPin, LogOut, Save, Loader2, ChevronRight } from "lucide-react";

type Tab = "profile" | "orders";

export default function AccountPage() {
  const { user, profile, signOut, updateProfile, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

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
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-black transition-colors px-4 py-2 rounded-xl hover:bg-black/5"
            >
              <LogOut width={15} height={15} />
              <span className="hidden sm:block">Uitloggen</span>
            </button>
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
          </div>
        )}
      </div>
    </main>
  );
}
