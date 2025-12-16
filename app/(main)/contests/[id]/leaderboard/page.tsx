import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import DownloadResultsButton from '@/components/DownloadResultsButton';
import Link from 'next/link';

// Raw data type used during aggregation
type RawLeaderboardEntry = {
  user_id: string;
  full_name: string | null;
  roll_no: string | null;
  department: string | null;
  year: number | null;
  problems_solved: number;
  penalty_time: number;
  best_execution_time: number;
  best_memory: number;
};

// Final type passed to UI and CSV download
type FormattedLeaderboardEntry = {
  rank: number;
  full_name: string | null;
  roll_no: string | null;
  department: string | null;
  year: number | null;
  problems_solved: number;
  penalty_time: string;
  best_execution_time: string;
  best_memory: string;
  user_id: string;
};

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const contestId = params.id;

  // --- FETCH USER ROLE (for CSV download visibility) ---
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null };

  const isAdmin = profile?.role === 'admin';

  // --- FETCH CONTEST (start + end time + name) ---
  const { data: contest, error: contestError } = await supabase
    .from('contests')
    .select('start_time, end_time, name')
    .eq('id', contestId)
    .single();

  if (contestError || !contest) {
    notFound();
  }

  const contestStartTime = new Date(contest.start_time).getTime();

  // --- FETCH ONLY IN-CONTEST ACCEPTED SUBMISSIONS ---
  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select(
      `
      submitted_at,
      problem_id,
      execution_time,
      memory,
      profiles (
        id,
        full_name,
        roll_no,
        department,
        year
      )
    `
    )
    .eq('contest_id', contestId)
    .eq('verdict', 'Accepted')
    .gte('submitted_at', contest.start_time) // >= contest start
    .lte('submitted_at', contest.end_time)   // <= contest end
    .order('submitted_at', { ascending: true });

  if (submissionsError) {
    console.error('Leaderboard submissions fetch error:', submissionsError.message);
    return <p className="text-center text-red-500">Could not load leaderboard data.</p>;
  }

  // --- AGGREGATE SCORES ---
  const userScores: { [userId: string]: RawLeaderboardEntry } = {};
  const solvedProblemsByUser: { [userId: string]: Set<number> } = {};

  for (const sub of submissions || []) {
    const profileRow = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
    if (!profileRow) continue;

    const userId = profileRow.id as string;

    if (!userScores[userId]) {
      userScores[userId] = {
        user_id: userId,
        full_name: profileRow.full_name,
        roll_no: profileRow.roll_no,
        department: profileRow.department,
        year: profileRow.year,
        problems_solved: 0,
        penalty_time: 0,
        best_execution_time: Infinity,
        best_memory: Infinity,
      };
      solvedProblemsByUser[userId] = new Set();
    }

    // Best execution time & memory across all accepted submissions
    userScores[userId].best_execution_time = Math.min(
      userScores[userId].best_execution_time,
      sub.execution_time || Infinity
    );
    userScores[userId].best_memory = Math.min(
      userScores[userId].best_memory,
      sub.memory || Infinity
    );

    // Only first accepted per problem counts towards solved count + penalty
    if (!solvedProblemsByUser[userId].has(sub.problem_id)) {
      solvedProblemsByUser[userId].add(sub.problem_id);
      userScores[userId].problems_solved++;

      const timeFromStart = new Date(sub.submitted_at).getTime() - contestStartTime;
      userScores[userId].penalty_time += timeFromStart;
    }
  }

  const rawLeaderboard = Object.values(userScores).sort((a, b) => {
    if (b.problems_solved !== a.problems_solved) {
      return b.problems_solved - a.problems_solved;
    }
    return a.penalty_time - b.penalty_time;
  });

  // --- FORMATTING HELPERS ---
  const formatPenaltyTime = (ms: number) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  };

  const formatExecTime = (time: number) =>
    time === Infinity ? 'N/A' : `${time.toFixed(3)}s`;

  const formatMemory = (kb: number) => (kb === Infinity ? 'N/A' : `${kb} KB`);

  const formattedLeaderboard: FormattedLeaderboardEntry[] = rawLeaderboard.map(
    (entry, index) => ({
      ...entry,
      rank: index + 1,
      penalty_time: formatPenaltyTime(entry.penalty_time),
      best_execution_time: formatExecTime(entry.best_execution_time),
      best_memory: formatMemory(entry.best_memory),
    })
  );

  // --- RENDER ---
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* Header with contest name and optional CSV download */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Leaderboard
          </h1>
          <h2 className="text-xl text-arena-mint font-semibold">
            {contest.name}
          </h2>
        </div>
        {isAdmin && formattedLeaderboard.length > 0 && (
          <DownloadResultsButton
            data={formattedLeaderboard}
            contestName={contest.name}
          />
        )}
      </div>

      <div className="bg-card-bg rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Rank
              </th>
              <th scope="col" className="px-6 py-3">
                Name
              </th>
              <th scope="col" className="px-6 py-3">
                Roll No
              </th>
              <th scope="col" className="px-6 py-3">
                Dept
              </th>
              <th scope="col" className="px-6 py-3">
                Year
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Score
              </th>
              <th scope="col" className="px-6 py-3">
                Total Time
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Best Time
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Memory
              </th>
            </tr>
          </thead>
          <tbody>
            {formattedLeaderboard.map((entry) => (
              <tr
                key={entry.user_id}
                className="border-b border-border-color hover:bg-slate-800"
              >
                <td className="px-6 py-4 font-bold text-lg text-white">
                  {entry.rank}
                </td>

                <td className="px-6 py-4 font-semibold text-white">
                  <Link
                    href={`/profile/${entry.user_id}`}
                    className="hover:underline hover:text-arena-mint transition-colors"
                  >
                    {entry.full_name}
                  </Link>
                </td>

                <td className="px-6 py-4 font-mono">{entry.roll_no}</td>
                <td className="px-6 py-4">{entry.department}</td>
                <td className="px-6 py-4 text-center">{entry.year}</td>
                <td className="px-6 py-4 text-center font-bold text-2xl text-arena-mint">
                  {entry.problems_solved}
                </td>
                <td className="px-6 py-4 font-mono">{entry.penalty_time}</td>
                <td className="px-6 py-4 text-center font-mono text-cyan-300">
                  {entry.best_execution_time}
                </td>
                <td className="px-6 py-4 text-center font-mono text-purple-300">
                  {entry.best_memory}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {formattedLeaderboard.length === 0 && (
          <p className="p-8 text-center text-gray-500">
            No correct submissions yet. The leaderboard is waiting for a hero!
          </p>
        )}
      </div>
    </div>
  );
}