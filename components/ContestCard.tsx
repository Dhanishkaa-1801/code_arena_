import Link from 'next/link';
import Countdown from './Countdown'; // The new component for live countdowns
import { Database } from '@/types_db'; // The auto-generated types from Supabase

// Define a more specific type for the contest prop, combining the DB row with a status.
type Contest = Database['public']['Tables']['contests']['Row'] & {
  status: 'Upcoming' | 'Active' | 'Finished';
};

// A small, self-contained component for the status badge.
const StatusBadge = ({ status }: { status: Contest['status'] }) => {
  const statusStyles = {
    Upcoming: 'bg-blue-500/20 text-blue-300',
    Active: 'bg-green-500/20 text-green-300 animate-pulse',
    Finished: 'bg-gray-500/20 text-gray-400',
  };
  return (
    <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

export default function ContestCard({ contest }: { contest: Contest }) {
  // This function determines what to display in the bottom section of the card
  // based on the contest's live status.
  const renderAction = () => {
    switch (contest.status) {
      case 'Upcoming':
        // If upcoming, we show the live Countdown component.
        return <Countdown targetDate={contest.start_time} />;
      
      case 'Active':
        // If active, show a prominent "Active Now" link.
        return (
          <Link href={`/contests/${contest.id}`} className="w-full text-center py-3 px-4 bg-gradient-to-r from-arena-green to-arena-mint text-dark-bg font-bold rounded-md hover:opacity-90 transition-opacity">
            Active Now
          </Link>
        );
      
      case 'Finished':
        // If finished, link to a future results page.
        return (
          <Link href={`/contests/${contest.id}/results`} className="w-full text-center py-3 px-4 bg-card-bg border border-border-color font-semibold rounded-md hover:bg-slate-700 transition-colors">
            View Results
          </Link>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="bg-card-bg border border-border-color rounded-xl p-6 flex flex-col relative hover:border-arena-pink/50 transition-colors duration-300 shadow-lg shadow-black/20 hover:-translate-y-1">
      <StatusBadge status={contest.status} />
      
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-100 mt-4 mb-2">{contest.name}</h3>
        {/* We use line-clamp to ensure descriptions don't make cards uneven heights */}
        <p className="text-sm text-gray-400 line-clamp-3 min-h-[60px]">
          {contest.description || 'No description provided for this contest.'}
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-border-color flex items-center justify-center">
        {renderAction()}
      </div>
    </div>
  );
}