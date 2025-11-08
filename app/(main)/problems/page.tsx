import { createClient } from '@/utils/supabase/server';
import PracticeProblemTable from '@/components/PracticeProblemTable';
import type { PracticeProblem } from '@/components/PracticeProblemTable';

export const dynamic = 'force-dynamic';

export default async function ProblemBankPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch problems from finished contests
  const { data: problems, error: problemsError } = await supabase
    .from('contest_problems')
    .select(`id, title, difficulty, contests ( end_time )`)
    .eq('is_practice_available', true)
    .lt('contests.end_time', new Date().toISOString())
    .order('id', { ascending: true });

  if (problemsError) {
    console.error("Error fetching practice problems:", problemsError);
    return <p className="text-center text-red-500">Could not load practice problems.</p>;
  }

  // 2. Fetch user submissions to determine status
  const problemStatusMap = new Map<number, 'Solved' | 'Attempted'>();
  if (user) {
    const { data: subs } = await supabase.from('submissions').select('problem_id, verdict').eq('user_id', user.id);
    if (subs) {
      for (const sub of subs) {
        if (sub.verdict === 'Accepted') {
          problemStatusMap.set(sub.problem_id, 'Solved');
        } else if (!problemStatusMap.has(sub.problem_id)) {
          problemStatusMap.set(sub.problem_id, 'Attempted');
        }
      }
    }
  }

  // 3. Combine all data into the final list for the UI
  const practiceProblems: PracticeProblem[] = (problems || [])
    .filter(p => p.contests)
    .map(p => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      status: problemStatusMap.get(p.id) || 'Not Attempted',
      // --- 'source' PROPERTY ADDED HERE ---
      // This is future-proof. All problems from this query are from contests.
      source: 'Contest',
  }));

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fadeIn">
      <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Problem Bank</h1>
      <p className="text-lg text-gray-400 mb-8">
        Sharpen your problem-solving skills with our curated collection, including challenges from past contests.
      </p>
      
      <PracticeProblemTable problems={practiceProblems} />
    </div>
  );
}