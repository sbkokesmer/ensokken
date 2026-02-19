interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
      <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-3">{label}</p>
      <p className={`text-2xl font-semibold ${accent ? "text-[#f24f13]" : "text-white"}`}>{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </div>
  );
}
