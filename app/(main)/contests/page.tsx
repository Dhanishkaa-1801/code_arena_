import { createClient } from '@/utils/supabase/server';
import ContestCard from '@/components/ContestCard';
import { Database } from '@/types_db';
import { AdminLink } from '@/components/AdminLink';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type ContestWithStatus = Database['public']['Tables']['contests']['Row'] & {
  status: 'Upcoming' | 'Active' | 'Finished';
};

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

  // Read ?stream= from URL
  const selectedStream =
    (searchParams.stream as 'all' | '1' | '2' | '3' | undefined) || 'all';

  // 🔁 UPDATED: when a specific stream is selected, show only that stream
  const filteredContests = contests.filter((c) => {
    const s = ((c as any).stream as string | null) || 'all'; // '1' | '2' | '3' | 'all'

    if (selectedStream === 'all') return true; // show everything

    // For Stream 1/2/3, show only exact matches
    return s === selectedStream;
  });

  const activeContests = filteredContests.filter((c) => c.status === 'Active');
  const upcomingContests = filteredContests.filter((c) => c.status === 'Upcoming');
  const finishedContests = filteredContests.filter((c) => c.status === 'Finished');

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8">
      <AdminLink />

      {/* Stream Filter */}
      <div className="mt-6 flex flex-wrap gap-3">
        {[
          { label: 'All Streams', value: 'all' },
          { label: 'Stream 1', value: '1' },
          { label: 'Stream 2', value: '2' },
          { label: 'Stream 3', value: '3' },
        ].map((opt) => (
          <Link
            key={opt.value}
            href={
              opt.value === 'all'
                ? '/contests'
                : `/contests?stream=${opt.value}`
            }
            className={`px-3 py-1 rounded-full text-sm transition ${
              selectedStream === opt.value
                ? 'bg-arena-mint text-dark-bg font-semibold'
                : 'bg-dark-bg text-gray-400 hover:text-white'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="space-y-12 mt-8">
        {/* Active Contests */}
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

        {/* Upcoming Contests */}
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

        {/* Past Contests */}
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

        {contests.length === 0 && (
          <div className="text-center py-20 bg-gray-900/50 rounded-lg">
            <h3 className="text-2xl font-bold text-gray-300">
              No Contests Scheduled
            </h3>
            <p className="text-gray-500 mt-2">
              Check back soon for new challenges!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}