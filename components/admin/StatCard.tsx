interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
}

export default function StatCard({ label, value, sub }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "var(--at-surface)", border: "1px solid var(--at-border)" }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "var(--at-text-muted)" }}>{label}</p>
      <p className="text-2xl font-semibold" style={{ color: "var(--at-text)" }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--at-text-faint)" }}>{sub}</p>}
    </div>
  );
}
