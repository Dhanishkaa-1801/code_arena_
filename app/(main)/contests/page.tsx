// In: app/(main)/contests/page.tsx

import { createClient } from '@/utils/supabase/server';
import ContestCard from '@/components/ContestCard';
import { Database } from '@/types_db';
import { AdminLink } from '@/components/AdminLink'; // Import the AdminLink component

// This ensures this page is always rendered fresh on every visit.
export const dynamic = 'force-dynamic';

// Define a more complete type for our contests
type ContestWithStatus = Database['public']['Tables']['contests']['Row'] & {
  status: 'Upcoming' | 'Active' | 'Finished';
};

// Helper function to determine the contest status
const getContestStatus = (
  startTime: string,
  endTime: string
): 'Upcoming' | 'Active' | 'Finished' => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) return 'Upcoming';
  if (now >= start && now <= end) return 'Active';
  return 'Finished';
};

export default async function ContestsLobbyPage() {
  const supabase = createClient();
  
  const { data: contestsData, error } = await supabase
    .from('contests')
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching contests:', error);
    return <p className="text-center text-red-400">Could not load contests. Please try again later.</p>;
  }

  // Map the raw data to include the status
  const contests: ContestWithStatus[] = contestsData.map(contest => ({
    ...contest,
    status: getContestStatus(contest.start_time, contest.end_time),
  }));

  // Filter contests into their respective categories
  const activeContests = contests.filter(c => c.status === 'Active');
  const upcomingContests = contests.filter(c => c.status === 'Upcoming');
  const finishedContests = contests.filter(c => c.status === 'Finished');

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8">
      {/* This AdminLink will only be visible if you are logged in as an admin */}
      <AdminLink />

      <div className="space-y-12 mt-8">
        {/* Active Contests Section */}
        {activeContests.length > 0 && (
          <section>
            <h2 className="text-3xl font-extrabold text-white mb-6">
              <span className="text-arena-mint">Active</span> Contests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeContests.map(contest => <ContestCard key={contest.id} contest={contest} />)}
            </div>
          </section>
        )}
        
        {/* Upcoming Contests Section */}
        {upcomingContests.length > 0 && (
          <section>
            <h2 className="text-3xl font-extrabold text-white mb-6">
              <span className="text-arena-blue">Upcoming</span> Contests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingContests.map(contest => <ContestCard key={contest.id} contest={contest} />)}
            </div>
          </section>
        )}

        {/* Finished Contests Section */}
        {finishedContests.length > 0 && (
          <section>
            <h2 className="text-3xl font-extrabold text-white mb-6">
              <span className="text-gray-400">Past</span> Contests
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finishedContests.map(contest => <ContestCard key={contest.id} contest={contest} />)}
            </div>
          </section>
        )}

        {/* Message for when there are no contests at all */}
        {contests.length === 0 && (
          <div className="text-center py-20 bg-gray-900/50 rounded-lg">
            <h3 className="text-2xl font-bold text-gray-300">No Contests Scheduled</h3>
            <p className="text-gray-500 mt-2">Check back soon for new challenges!</p>
          </div>
        )}
      </div>
    </main>
  );
}