import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  subtext?: string;
}

export function StatCard({ label, value, icon, subtext }: StatCardProps) {
  return (
    <div className="p-4 rounded-xl card-surface relative overflow-hidden">
      <div className="absolute top-3 right-3 text-slate-500 opacity-60">
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-100">{value}</p>
        {subtext && <p className="text-[11px] text-slate-500">{subtext}</p>}
      </div>
    </div>
  );
}
