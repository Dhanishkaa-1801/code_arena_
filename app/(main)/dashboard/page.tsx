import DashboardCard from '@/components/DashboardCard';
import RecentActivity from '@/components/RecentActivity';
import { DASHBOARD_STATS } from '@/data/mockData';

export default function DashboardPage() {
  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DASHBOARD_STATS.map((stat) => (
          <DashboardCard key={stat.label} stat={stat} />
        ))}
      </div>
      <RecentActivity />
    </div>
  );
}