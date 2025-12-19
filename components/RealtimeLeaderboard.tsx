'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import DownloadResultsButton from '@/components/DownloadResultsButton';

export default function RealtimeLeaderboard({ 
  initialSubmissions, 
  contest, 
  isAdmin 
}: { 
  initialSubmissions: any[], 
  contest: any, 
  isAdmin: boolean 
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const supabase = createClient();
  const contestStartTime = new Date(contest.start_time).getTime();

  useEffect(() => {
    // Listen for new "Accepted" submissions for this specific contest
    const channel = supabase
      .channel(`contest-leaderboard-${contest.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'submissions',
          filter: `contest_id=eq.${contest.id}`,
        },
        async (payload) => {
          if (payload.new.verdict === 'Accepted') {
            // Fetch the profile for the new submission to match your join logic
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name, roll_no, department, year')
              .eq('id', payload.new.user_id)
              .single();

            const newSubWithProfile = { ...payload.new, profiles: profile };
            setSubmissions((current) => [...current, newSubWithProfile]);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [contest.id, supabase]);

  // --- YOUR EXACT AGGREGATION LOGIC ---
  const userScores: { [key: string]: any } = {};
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
  
  const sortedLeaderboard = Object.values(userScores).sort((a: any, b: any) => {
    if (b.problems_solved !== a.problems_solved) return b.problems_solved - a.problems_solved;
    return a.penalty_time - b.penalty_time;
  });

  // --- YOUR EXACT FORMATTING HELPERS ---
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

  const formattedLeaderboard = sortedLeaderboard.map((entry: any, index: number) => ({
    ...entry,
    rank: index + 1,
    penalty_time: formatPenaltyTime(entry.penalty_time),
    best_execution_time: formatExecTime(entry.best_execution_time),
    best_memory: formatMemory(entry.best_memory),
  }));

  return (
    <>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Leaderboard</h1>
          <h2 className="text-xl text-arena-mint font-semibold">{contest.name}</h2>
        </div>
        {isAdmin && formattedLeaderboard.length > 0 && (
          <DownloadResultsButton data={formattedLeaderboard} contestName={contest.name} />
        )}
      </div>

      <div className="bg-card-bg rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-800/50">
            <tr>
              <th className="px-6 py-3">Rank</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Roll No</th>
              <th className="px-6 py-3">Dept</th>
              <th className="px-6 py-3">Year</th>
              <th className="px-6 py-3 text-center">Score</th>
              <th className="px-6 py-3">Total Time</th>
              <th className="px-6 py-3 text-center">Best Time</th>
              <th className="px-6 py-3 text-center">Memory</th>
            </tr>
          </thead>
          <tbody>
            {formattedLeaderboard.map((entry: any) => (
              <tr key={entry.user_id} className="border-b border-border-color hover:bg-slate-800 animate-fadeIn">
                <td className="px-6 py-4 font-bold text-lg text-white">{entry.rank}</td>
                <td className="px-6 py-4 font-semibold text-white">
                  <Link href={`/profile/${entry.user_id}`} className="hover:underline hover:text-arena-mint transition-colors">
                    {entry.full_name}
                  </Link>
                </td>
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
        {formattedLeaderboard.length === 0 && (
          <p className="p-8 text-center text-gray-500 font-medium">No correct submissions yet. The leaderboard is waiting for a hero!</p>
        )}
      </div>
    </>
  );
}