interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-5 border ${accent ? "bg-white border-white/20" : "bg-[#161616] border-white/[0.06]"}`}>
      <p className={`text-xs font-medium uppercase tracking-wider mb-3 ${accent ? "text-black/40" : "text-white/35"}`}>{label}</p>
      <p className={`text-2xl font-semibold ${accent ? "text-black" : "text-white"}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${accent ? "text-black/40" : "text-white/25"}`}>{sub}</p>}
    </div>
  );
}
