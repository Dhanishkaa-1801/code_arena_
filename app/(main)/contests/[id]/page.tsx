// In: app/(main)/contests/[id]/page.tsx

import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Countdown from '@/components/Countdown';

export const dynamic = 'force-dynamic';

export default async function ContestArenaPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: contest, error } = await supabase
    .from('contests')
    .select(`
      id,
      name,
      description,
      end_time,
      contest_problems (
        id,
        title,
        difficulty
      )
    `)
    .eq('id', params.id)
    // ✨ ensure nested problems are ordered consistently (A,B,C,...)
    .order('id', { foreignTable: 'contest_problems', ascending: true })
    .single();

  if (error || !contest) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border-color pb-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">{contest.name}</h1>
          <p className="text-gray-400 mt-2">{contest.description}</p>
        </div>
        <div className="bg-card-bg border border-border-color rounded-lg px-6 py-3 text-center shrink-0">
          <p className="text-sm text-gray-400 mb-1">Time Remaining</p>
          <Countdown endTime={contest.end_time} />
        </div>
      </div>

      {/* Leaderboard Button */}
      <div className="mb-10">
        <Link
          href={`/contests/${contest.id}/leaderboard`}
          className="w-full text-center block py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
        >
          View Contest Leaderboard
        </Link>
      </div>

      {/* List of Problems */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">Problems</h2>
        {contest.contest_problems.length > 0 ? (
          contest.contest_problems.map((problem: any, index: number) => (
            <Link
              key={problem.id}
              href={`/contests/${contest.id}/problems/${problem.id}?index=${index}`}
              className="block bg-card-bg border border-border-color p-4 rounded-lg hover:bg-slate-800 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium text-white">
                  {`Problem ${String.fromCharCode(65 + index)}: ${problem.title}`}
                </p>
                <span
                  className={`text-xs px-3 py-1 font-semibold rounded-full
                    ${problem.difficulty === 'Easy' ? 'bg-green-800/50 text-green-300' : ''}
                    ${problem.difficulty === 'Medium' ? 'bg-yellow-800/50 text-yellow-300' : ''}
                    ${problem.difficulty === 'Hard' ? 'bg-red-800/50 text-red-300' : ''}
                  `}
                >
                  {problem.difficulty}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8 bg-card-bg border border-border-color rounded-lg">
            <p>No problems have been added to this contest yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}