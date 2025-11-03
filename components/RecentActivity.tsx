import { RECENT_ACTIVITIES } from "@/data/mockData";

export default function RecentActivity() {
  return (
    <div className="bg-card-bg rounded-xl p-6 border border-border-color mt-6 shadow-lg shadow-black/20">
      <h3 className="text-arena-blue text-xl font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {RECENT_ACTIVITIES.map((activity, index) => (
          <div key={index} className="p-4 bg-arena-purple/10 border-l-4 border-arena-purple rounded-r-md">
            <strong className="text-gray-200">{activity.action}:</strong> <span className="text-gray-300">{activity.title}</span>
            <div className="text-gray-400 text-xs mt-1">{activity.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}