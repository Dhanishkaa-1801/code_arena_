// In: app/(main)/problems/page.tsx

import { createClient } from '@/utils/supabase/server';
import PracticeProblemTable from '@/components/PracticeProblemTable';
import type { PracticeProblem } from '@/components/PracticeProblemTable';

// We force the page to be dynamic so it fetches fresh data (and the green tick) on every load
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProblemBankPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <p className="text-center p-8 text-gray-400">
        Please log in to view the problem bank.
      </p>
    );
  }

  // 1. Fetch all problems that are available for practice
  // We join with the 'contests' table to check the end_time and get the name
  const { data: rawProblems, error: problemsError } = await supabase
    .from('contest_problems')
    .select(
      `
      id, 
      title, 
      difficulty, 
      contests!inner (
        name,
        end_time
      )
    `
    )
    .eq('is_practice_available', true)
    .lt('contests.end_time', new Date().toISOString()) // Only show problems from ended contests
    .order('id', { ascending: true });

  if (problemsError) {
    console.error('Error fetching problems:', problemsError);
    return (
      <p className="text-center text-red-500">
        Could not load practice problems.
      </p>
    );
  }

  // 2. Fetch the user's submissions to calculate status (Solved/Attempted)
  const { data: userSubmissions, error: submissionsError } = await supabase
    .from('submissions')
    .select('problem_id, verdict')
    .eq('user_id', user.id);

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError);
    // We don't block the page, we just assume "Not Attempted" if this fails
  }

  // 3. Create a map for fast lookup of submission status
  // Map Key: problemId -> Value: 'Solved' | 'Attempted'
  const submissionMap = new Map<number, PracticeProblem['status']>(); // 🔁 typed to PracticeProblem['status']

  if (userSubmissions) {
    userSubmissions.forEach((sub) => {
      const currentStatus = submissionMap.get(sub.problem_id);

      // If we already marked it as Solved, leave it as Solved
      if (currentStatus === 'Solved') return;

      if (sub.verdict === 'Accepted') {
        submissionMap.set(sub.problem_id, 'Solved');
      } else {
        // If it's not Accepted, mark as Attempted (unless already Solved)
        submissionMap.set(sub.problem_id, 'Attempted');
      }
    });
  }

  // 4. Merge data to create the final array for the UI
  const practiceProblems: PracticeProblem[] = (rawProblems || []).map((p: any) => {
    // Check our map to see if the user touched this problem
    const status: PracticeProblem['status'] =
      submissionMap.get(p.id) || 'Not Attempted'; // 🔁 explicitly typed

    return {
      id: p.id,
      title: p.title,
      difficulty: p.difficulty as PracticeProblem['difficulty'], // keep as-is, just cast
      status,
      source:
        p.contests?.name === 'Practice Problem Collection'
          ? 'Collection'
          : 'Contest',
    };
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fadeIn">
      <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
        Problem Bank
      </h1>
      <p className="text-lg text-gray-400 mb-8">
        Sharpen your problem-solving skills with our curated collection,
        including challenges from past contests.
      </p>

      <PracticeProblemTable problems={practiceProblems} />
    </div>
  );
}