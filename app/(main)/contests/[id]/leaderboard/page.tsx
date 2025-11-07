// app/(main)/contests/[id]/leaderboard/page.tsx

import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';

type LeaderboardEntry = {
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

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const contestId = params.id;

  const { data: contest, error: contestError } = await supabase
    .from('contests')
    .select('start_time, name')
    .eq('id', contestId)
    .single();
  
  if (contestError || !contest) { notFound(); }
  const contestStartTime = new Date(contest.start_time).getTime();

  // The query already fetches the required fields, so no changes needed here.
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

  const userScores: { [key: string]: LeaderboardEntry } = {};
  const solvedProblemsByUser: { [key: string]: Set<number> } = {};

  for (const sub of submissions) {
    const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
    if (!profile) continue;

    const userId = profile.id;

    if (!userScores[userId]) {
      userScores[userId] = {
        user_id: userId,
        full_name: profile.full_name,
        roll_no: profile.roll_no,
        department: profile.department,
        year: profile.year,
        problems_solved: 0,
        penalty_time: 0,
        best_execution_time: Infinity,
        best_memory: Infinity,
      };
      solvedProblemsByUser[userId] = new Set();
    }
    
    userScores[userId].best_execution_time = Math.min(userScores[userId].best_execution_time, sub.execution_time || Infinity);
    userScores[userId].best_memory = Math.min(userScores[userId].best_memory, sub.memory || Infinity);

    if (!solvedProblemsByUser[userId].has(sub.problem_id)) {
      solvedProblemsByUser[userId].add(sub.problem_id);
      userScores[userId].problems_solved++;
      
      const submissionTime = new Date(sub.submitted_at).getTime();
      const timeFromStart = submissionTime - contestStartTime;
      userScores[userId].penalty_time += timeFromStart;
    }
  }
  
  const leaderboard = Object.values(userScores);

  leaderboard.sort((a, b) => {
    if (b.problems_solved !== a.problems_solved) return b.problems_solved - a.problems_solved;
    return a.penalty_time - b.penalty_time;
  });

  const formatPenaltyTime = (ms: number) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const formatExecTime = (time: number | null) => {
    if (time === null || time === Infinity) return 'N/A';
    return `${time.toFixed(3)}s`;
  };
  
  const formatMemory = (kb: number | null) => {
    if (kb === null || kb === Infinity) return 'N/A';
    return `${kb} KB`;
  };

  return (
    // --- LAYOUT CHANGE: Use max-w-7xl for a wider table ---
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Leaderboard</h1>
      <h2 className="text-xl text-arena-mint font-semibold mb-8">{contest.name}</h2>
      <div className="bg-card-bg rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
            {/* --- UI CHANGE: Added back all the columns --- */}
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
            {leaderboard.map((entry, index) => (
              <tr key={entry.user_id} className="border-b border-border-color hover:bg-slate-800">
                <td className="px-6 py-4 font-bold text-lg text-white">{index + 1}</td>
                <td className="px-6 py-4 font-semibold text-white">{entry.full_name}</td>
                <td className="px-6 py-4 font-mono">{entry.roll_no}</td>
                <td className="px-6 py-4">{entry.department}</td>
                <td className="px-6 py-4 text-center">{entry.year}</td>
                <td className="px-6 py-4 text-center font-bold text-2xl text-arena-mint">{entry.problems_solved}</td>
                <td className="px-6 py-4 font-mono">{formatPenaltyTime(entry.penalty_time)}</td>
                <td className="px-6 py-4 text-center font-mono text-cyan-300">{formatExecTime(entry.best_execution_time)}</td>
                <td className="px-6 py-4 text-center font-mono text-purple-300">{formatMemory(entry.best_memory)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leaderboard.length === 0 && <p className="p-8 text-center text-gray-500">No correct submissions yet. The leaderboard is waiting for a hero!</p>}
      </div>
    </div>
  );
}