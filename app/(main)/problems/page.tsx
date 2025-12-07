// In: app/(main)/problems/page.tsx

import { createClient } from '@/utils/supabase/server';
import PracticeProblemTable from '@/components/PracticeProblemTable';
import type { PracticeProblem } from '@/components/PracticeProblemTable';

export const dynamic = 'force-dynamic';

export default async function ProblemBankPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Fetch problems from finished contests
  // CHANGED: Added 'name' to the select so we can detect the Collection contest
  const { data: problems, error: problemsError } = await supabase
    .from('contest_problems')
    .select(`id, title, difficulty, contests ( name, end_time )`)
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
    .map(p => {
      // CHANGED: Logic to check if this is from the Collection
      // @ts-ignore
      const contestName = p.contests?.name || '';
      // Ensure this string matches exactly what you named your contest in the DB
      const isCollection = contestName === 'Practice Problem Collection';

      return {
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        status: problemStatusMap.get(p.id) || 'Not Attempted',
        // If it's from our special contest, label it Collection, else Contest
        source: isCollection ? 'Collection' : 'Contest',
      };
    });

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