import ContestCard from '@/components/ContestCard';
import { CONTESTS } from '@/data/mockData';

export default function ContestsPage() {
  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CONTESTS.map((contest) => (
          <ContestCard key={contest.id} contest={contest} />
        ))}
      </div>
    </div>
  );
}