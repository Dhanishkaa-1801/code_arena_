import { DashboardStat } from "@/types";

export default function DashboardCard({ stat }: { stat: DashboardStat }) {
  return (
    <div className="bg-card-bg rounded-xl p-6 border border-border-color text-center shadow-lg shadow-black/20">
      <h3 className="text-gray-400 mb-4 uppercase tracking-wider text-sm">{stat.label}</h3>
      <div className={`text-5xl font-bold mb-2 ${stat.colorClass}`}>{stat.value}</div>
      <p className="text-gray-400 text-sm">{stat.details}</p>
    </div>
  );
}