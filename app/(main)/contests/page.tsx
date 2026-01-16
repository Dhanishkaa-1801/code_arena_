import { createClient } from '@/utils/supabase/server';
import ContestCard from '@/components/ContestCard';
import { Database } from '@/types_db';
import { AdminLink } from '@/components/AdminLink';
import Link from 'next/link';
import { Filter } from 'lucide-react';

export const dynamic = 'force-dynamic';

type ContestWithStatus = Database['public']['Tables']['contests']['Row'] & {
  status: 'Upcoming' | 'Active' | 'Finished';
};

// Timezone-safe status helper
const getContestStatus = (
  startTime: string,
  endTime: string
): 'Upcoming' | 'Active' | 'Finished' => {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (now < start) return 'Upcoming';
  if (now >= start && now <= end) return 'Active';
  return 'Finished';
};

export default async function ContestsLobbyPage({
  searchParams,
}: {
  searchParams: { stream?: string };
}) {
  const supabase = createClient();

  const { data: contestsData, error } = await supabase
    .from('contests')
    .select('*')
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching contests:', error);
    return (
      <p className="text-center text-red-400">
        Could not load contests. Please try again later.
      </p>
    );
  }

  const contests: ContestWithStatus[] = contestsData.map((contest) => ({
    ...contest,
    status: getContestStatus(contest.start_time, contest.end_time),
  }));

  const selectedStream =
    (searchParams.stream as 'all' | '1' | '2' | '3' | undefined) || 'all';

  // Strict Stream Filtering
  const filteredContests = contests.filter((c) => {
    const s = ((c as any).stream as string | null) || 'all';
    if (selectedStream === 'all') return true;
    return s === selectedStream;
  });

  const activeContests = filteredContests.filter((c) => c.status === 'Active');
  const upcomingContests = filteredContests.filter((c) => c.status === 'Upcoming');
  const finishedContests = filteredContests.filter((c) => c.status === 'Finished');

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 animate-fadeIn">
      <AdminLink />

      {/* --- Filter Box (Styled to match your established UI) --- */}
      <div className="mt-8 bg-card-bg border border-border-color p-5 rounded-xl flex flex-col md:flex-row items-center gap-6">
        <div className="flex items-center gap-3 text-gray-400 shrink-0">
          <Filter size={18} className="text-arena-pink" />
          <span className="text-sm font-bold uppercase tracking-wider">
            Filter by Stream
          </span>
        </div>
        
        <div className="h-8 w-px bg-border-color hidden md:block" />

        <div className="flex flex-wrap gap-3">
          <Link
            href="/contests"
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              selectedStream === 'all'
                ? 'bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg'
                : 'bg-dark-bg text-gray-400 hover:text-white border border-border-color'
            }`}
          >
            All Streams
          </Link>

          {/* Updated labels only – logic unchanged */}
          <Link
            href="/contests?stream=1"
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              selectedStream === '1'
                ? 'bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg'
                : 'bg-dark-bg text-gray-400 hover:text-white border border-border-color'
            }`}
          >
            Stream 1 – AERO / BME / CIVIL / MECH / R&amp;A
          </Link>

          <Link
            href="/contests?stream=2"
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              selectedStream === '2'
                ? 'bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg'
                : 'bg-dark-bg text-gray-400 hover:text-white border border-border-color'
            }`}
          >
            Stream 2 – ECE / EEE / EIE
          </Link>

          <Link
            href="/contests?stream=3"
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
              selectedStream === '3'
                ? 'bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg'
                : 'bg-dark-bg text-gray-400 hover:text-white border border-border-color'
            }`}
          >
            Stream 3 – CSE / IT / AI&amp;DS / M.Tech
          </Link>
        </div>
      </div>

      {/* --- CONTEST SECTIONS (Standard Fonts Restored) --- */}
      <div className="space-y-12 mt-12">
        
        {/* Active Section */}
        <section>
          <h2 className="text-3xl font-extrabold text-white mb-6">
            <span className="text-arena-mint">Active</span> Contests
          </h2>
          {activeContests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeContests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-900/50 rounded-lg text-gray-400">
              No active contests right now.
            </div>
          )}
        </section>

        {/* Upcoming Section */}
        <section>
          <h2 className="text-3xl font-extrabold text-white mb-6">
            <span className="text-arena-blue">Upcoming</span> Contests
          </h2>
          {upcomingContests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingContests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-900/50 rounded-lg text-gray-400">
              No upcoming contests scheduled.
            </div>
          )}
        </section>

        {/* Past Section */}
        <section>
          <h2 className="text-3xl font-extrabold text-white mb-6">
            <span className="text-gray-400">Past</span> Contests
          </h2>
          {finishedContests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {finishedContests.map((contest) => (
                <ContestCard key={contest.id} contest={contest} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-900/50 rounded-lg text-gray-400">
              No past contests yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}