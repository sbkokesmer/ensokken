interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export default function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div className="rounded-2xl p-5 border bg-[#161616] border-white/[0.06]">
      <p className="text-xs font-medium uppercase tracking-wider mb-3 text-white/35">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
      {sub && <p className="text-xs mt-1 text-white/25">{sub}</p>}
    </div>
  );
}
