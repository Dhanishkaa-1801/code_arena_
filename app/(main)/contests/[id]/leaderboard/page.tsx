import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import DownloadResultsButton from '@/components/DownloadResultsButton'; // Import the new component

// This type is for the raw data processing
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

// This type is for the final, formatted data passed to the UI and download component
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
  user_id: string; // Keep user_id for the key
};

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const contestId = params.id;

  // --- FETCH USER ROLE ---
  // We need to know if the current user is an admin to show the download button
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null };
  const isAdmin = profile?.role === 'admin';
  // --- END OF USER ROLE FETCH ---

  const { data: contest, error: contestError } = await supabase
    .from('contests')
    .select('start_time, name')
    .eq('id', contestId)
    .single();
  
  if (contestError || !contest) { notFound(); }
  const contestStartTime = new Date(contest.start_time).getTime();

  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select(`
      submitted_at,
      problem_id,
      execution_time,
      memory,
      profiles ( id, full_name, roll_no, department, year )
    `)
    .eq('contest_id', contestId)
    .eq('verdict', 'Accepted')
    .order('submitted_at', { ascending: true });

  if (submissionsError) {
    console.error("Leaderboard submissions fetch error:", submissionsError.message);
    return <p className="text-center text-red-500">Could not load leaderboard data.</p>;
  }

  const userScores: { [key: string]: RawLeaderboardEntry } = {};
  const solvedProblemsByUser: { [key: string]: Set<number> } = {};

  for (const sub of submissions) {
    const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
    if (!profile) continue;
    const userId = profile.id;

    if (!userScores[userId]) {
      userScores[userId] = {
        user_id: userId, full_name: profile.full_name, roll_no: profile.roll_no, department: profile.department,
        year: profile.year, problems_solved: 0, penalty_time: 0, best_execution_time: Infinity, best_memory: Infinity,
      };
      solvedProblemsByUser[userId] = new Set();
    }
    
    userScores[userId].best_execution_time = Math.min(userScores[userId].best_execution_time, sub.execution_time || Infinity);
    userScores[userId].best_memory = Math.min(userScores[userId].best_memory, sub.memory || Infinity);

    if (!solvedProblemsByUser[userId].has(sub.problem_id)) {
      solvedProblemsByUser[userId].add(sub.problem_id);
      userScores[userId].problems_solved++;
      const timeFromStart = new Date(sub.submitted_at).getTime() - contestStartTime;
      userScores[userId].penalty_time += timeFromStart;
    }
  }
  
  const rawLeaderboard = Object.values(userScores).sort((a, b) => {
    if (b.problems_solved !== a.problems_solved) return b.problems_solved - a.problems_solved;
    return a.penalty_time - b.penalty_time;
  });

  // --- FORMATTING LOGIC ---
  const formatPenaltyTime = (ms: number) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  const formatExecTime = (time: number) => time === Infinity ? 'N/A' : `${time.toFixed(3)}s`;
  const formatMemory = (kb: number) => kb === Infinity ? 'N/A' : `${kb} KB`;
  
  // Create the final formatted data for the UI and download component
  const formattedLeaderboard: FormattedLeaderboardEntry[] = rawLeaderboard.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    penalty_time: formatPenaltyTime(entry.penalty_time),
    best_execution_time: formatExecTime(entry.best_execution_time),
    best_memory: formatMemory(entry.best_memory),
  }));
  // --- END OF FORMATTING LOGIC ---

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      {/* --- HEADER WITH CONDITIONAL DOWNLOAD BUTTON --- */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Leaderboard</h1>
          <h2 className="text-xl text-arena-mint font-semibold">{contest.name}</h2>
        </div>
        {/* The DownloadResultsButton is only rendered if the user is an admin */}
        {isAdmin && formattedLeaderboard.length > 0 && (
          <DownloadResultsButton data={formattedLeaderboard} contestName={contest.name} />
        )}
      </div>
      {/* --- END OF HEADER --- */}

      <div className="bg-card-bg rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
            <tr>
              <th scope="col" className="px-6 py-3">Rank</th>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Roll No</th>
              <th scope="col" className="px-6 py-3">Dept</th>
              <th scope="col" className="px-6 py-3">Year</th>
              <th scope="col" className="px-6 py-3 text-center">Score</th>
              <th scope="col" className="px-6 py-3">Total Time</th>
              <th scope="col" className="px-6 py-3 text-center">Best Time</th>
              <th scope="col" className="px-6 py-3 text-center">Memory</th>
            </tr>
          </thead>
          <tbody>
            {formattedLeaderboard.map((entry) => (
              <tr key={entry.user_id} className="border-b border-border-color hover:bg-slate-800">
                <td className="px-6 py-4 font-bold text-lg text-white">{entry.rank}</td>
                <td className="px-6 py-4 font-semibold text-white">{entry.full_name}</td>
                <td className="px-6 py-4 font-mono">{entry.roll_no}</td>
                <td className="px-6 py-4">{entry.department}</td>
                <td className="px-6 py-4 text-center">{entry.year}</td>
                <td className="px-6 py-4 text-center font-bold text-2xl text-arena-mint">{entry.problems_solved}</td>
                <td className="px-6 py-4 font-mono">{entry.penalty_time}</td>
                <td className="px-6 py-4 text-center font-mono text-cyan-300">{entry.best_execution_time}</td>
                <td className="px-6 py-4 text-center font-mono text-purple-300">{entry.best_memory}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {formattedLeaderboard.length === 0 && <p className="p-8 text-center text-gray-500">No correct submissions yet. The leaderboard is waiting for a hero!</p>}
      </div>
    </div>
  );
}