'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import DownloadResultsButton from '@/components/DownloadResultsButton';

const PENALTY_PER_SWITCH_MS = 20 * 60 * 1000; // 20 minutes

export default function RealtimeLeaderboard({
  initialSubmissions,
  monitoringData = [],
  contest,
  isAdmin,
}: {
  initialSubmissions: any[];
  monitoringData: any[];
  contest: any;
  isAdmin: boolean;
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const supabase = createClient();

  const contestStartTime = new Date(contest.start_time).getTime();

  // user_id -> monitoring info
  const monitoringMap = useMemo(() => {
    const map = new Map<
      string,
      { switches: number; runs: number; firstOpenedAt?: string }
    >();
    for (const row of monitoringData) {
      map.set(row.user_id, {
        switches: row.tab_switches ?? 0,
        runs: row.run_count ?? 0,
        firstOpenedAt: row.first_opened_at ?? undefined,
      });
    }
    return map;
  }, [monitoringData]);

  // Realtime accepted submissions
  useEffect(() => {
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contest.id, supabase]);

  // ---------- AGGREGATION ----------
  const userScores: { [key: string]: any } = {};
  const solvedProblemsByUser: { [key: string]: Set<number> } = {};

  for (const sub of submissions) {
    const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
    if (!profile) continue;
    const userId = profile.id;

    if (!userScores[userId]) {
      const mon = monitoringMap.get(userId) || {
        switches: 0,
        runs: 0,
        firstOpenedAt: undefined,
      };
      const switches = mon.switches ?? 0;

      userScores[userId] = {
        user_id: userId,
        full_name: profile.full_name,
        roll_no: profile.roll_no,
        department: profile.department,
        year: profile.year,
        problems_solved: 0,

        // we'll compute penalty_time after we know start/end
        penalty_time: 0,
        best_execution_time: Infinity,
        best_memory: Infinity,
        last_submission_time: 0,

        // per-user start time = first_opened_at (fallback: contest start)
        start_time: mon.firstOpenedAt
          ? new Date(mon.firstOpenedAt).getTime()
          : contestStartTime,

        tab_switches: switches,
        run_count: mon.runs ?? 0,
      };
      solvedProblemsByUser[userId] = new Set();
    }

    // best stats
    userScores[userId].best_execution_time = Math.min(
      userScores[userId].best_execution_time,
      sub.execution_time ?? Infinity
    );
    userScores[userId].best_memory = Math.min(
      userScores[userId].best_memory,
      sub.memory ?? Infinity
    );

    // count a problem only once
    if (!solvedProblemsByUser[userId].has(sub.problem_id)) {
      solvedProblemsByUser[userId].add(sub.problem_id);
      userScores[userId].problems_solved += 1;

      const subTime = new Date(sub.submitted_at).getTime();
      userScores[userId].last_submission_time = Math.max(
        userScores[userId].last_submission_time,
        subTime
      );
    }
  }

  // 👉 FINAL TIME CALC
  // Total Time = (Finish - Start) + (switches * 20min)
  for (const entry of Object.values(userScores) as any[]) {
    const startMs = entry.start_time ?? contestStartTime;
    const endMs = entry.last_submission_time || startMs;
    const durationMs = Math.max(0, endMs - startMs);
    const penaltyMs = (entry.tab_switches ?? 0) * PENALTY_PER_SWITCH_MS;
    entry.penalty_time = durationMs + penaltyMs; // used for display + sorting
  }

  // Sort by score desc, then total time asc
  const sortedLeaderboard = Object.values(userScores).sort((a: any, b: any) => {
    if (b.problems_solved !== a.problems_solved) return b.problems_solved - a.problems_solved;
    return a.penalty_time - b.penalty_time;
  });
  // -------------------

  // Formatters
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
  const formatDateHeader = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  const formatTimeOfDay = (ts: number | null) => {
    if (!ts) return '-';
    return new Date(ts).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formattedLeaderboard = sortedLeaderboard.map((entry: any, index: number) => ({
    ...entry,
    rank: index + 1,
    display_time: formatPenaltyTime(entry.penalty_time),
    best_execution_time: formatExecTime(entry.best_execution_time),
    best_memory: formatMemory(entry.best_memory),
    start_time_str: formatTimeOfDay(entry.start_time),
    finish_time_str: formatTimeOfDay(entry.last_submission_time),
  }));

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Leaderboard
          </h1>
          <h2 className="text-xl text-arena-mint font-semibold mb-2">
            {contest.name}
          </h2>
          <div className="flex gap-4 text-sm text-gray-400 font-mono">
            <span className="bg-gray-800/50 px-3 py-1 rounded border border-gray-700">
              Start: {formatDateHeader(contest.start_time)}
            </span>
            <span className="bg-gray-800/50 px-3 py-1 rounded border border-gray-700">
              End: {formatDateHeader(contest.end_time)}
            </span>
          </div>
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
              <th className="px-6 py-3">Rank</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Roll No</th>
              <th className="px-6 py-3">Dept</th>
              <th className="px-6 py-3 text-center">Score</th>
              <th className="px-6 py-3">Total Time</th>
              <th className="px-6 py-3 text-center">Start Time</th>
              <th className="px-6 py-3 text-center">Finished At</th>
              <th className="px-6 py-3 text-center">Best Time</th>
              <th className="px-6 py-3 text-center">Memory</th>
              {isAdmin && (
                <>
                  <th className="px-6 py-3 text-center text-yellow-500">
                    ⚠ Switches
                  </th>
                  <th className="px-6 py-3 text-center text-blue-400">
                    ▶ Runs
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {formattedLeaderboard.map((entry: any) => (
              <tr
                key={entry.user_id}
                className="border-b border-border-color hover:bg-slate-800 animate-fadeIn"
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
                <td className="px-6 py-4 text-center font-bold text-2xl text-arena-mint">
                  {entry.problems_solved}
                </td>
                <td className="px-6 py-4 font-mono">
                  {entry.display_time}
                </td>
                <td className="px-6 py-4 text-center font-mono text-gray-400">
                  {entry.start_time_str}
                </td>
                <td className="px-6 py-4 text-center font-mono text-gray-400">
                  {entry.finish_time_str}
                </td>
                <td className="px-6 py-4 text-center font-mono text-cyan-300">
                  {entry.best_execution_time}
                </td>
                <td className="px-6 py-4 text-center font-mono text-purple-300">
                  {entry.best_memory}
                </td>
                {isAdmin && (
                  <>
                    <td className="px-6 py-4 text-center font-bold text-yellow-500 bg-yellow-900/10">
                      {entry.tab_switches}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-blue-400 bg-blue-900/10">
                      {entry.run_count}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {formattedLeaderboard.length === 0 && (
          <p className="p-8 text-center text-gray-500 font-medium">
            No correct submissions yet. The leaderboard is waiting for a hero!
          </p>
        )}
      </div>
    </>
  );
}