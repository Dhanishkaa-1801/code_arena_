// app/(main)/contests/[id]/problems/[problemId]/page.tsx

import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ProblemWorkspace from '@/components/ProblemWorkspace';
import { Database } from '@/types_db';

type Problem = Database['public']['Tables']['contest_problems']['Row'];

function ProblemDetails({ problem }: { problem: Problem }) {
  return (
    <div className="p-6 prose prose-invert max-w-none bg-gray-800 rounded-lg">
      <h1 className="text-3xl font-bold text-white mb-4">{problem.title}</h1>
      <div className="mt-4 text-gray-300" dangerouslySetInnerHTML={{ __html: problem.description || '<p>No description provided.</p>' }} />
      <h2 className="mt-8 text-xl font-semibold text-white">Sample Input</h2>
      <pre className="bg-gray-900/50 p-4 rounded-md text-gray-200"><code>{problem.sample_input || 'N/A'}</code></pre>
      <h2 className="mt-6 text-xl font-semibold text-white">Sample Output</h2>
      <pre className="bg-gray-900/50 p-4 rounded-md text-gray-200"><code>{problem.sample_output || 'N/A'}</code></pre>
      {problem.constraints && (
        <>
          <h2 className="mt-6 text-xl font-semibold text-white">Constraints</h2>
          <div className="mt-2 text-gray-300" dangerouslySetInnerHTML={{ __html: problem.constraints }}/>
        </>
      )}
    </div>
  );
}

export default async function ProblemPage({ params }: { params: { id: string, problemId: string } }) {
  const supabase = createClient();
  const contestId = Number(params.id);

  const { data: { user } } = await supabase.auth.getUser();

  // --- EFFICIENT DATA FETCHING WITH LAST SUBMISSION ---
  const problemPromise = supabase
    .from('contest_problems')
    .select('*')
    .eq('id', params.problemId)
    .single();
    
  const contestPromise = supabase
    .from('contests')
    .select('end_time')
    .eq('id', contestId)
    .single();

  // Fetch the user's most recent submission for THIS problem
  const lastSubmissionPromise = user ? supabase
    .from('submissions')
    .select('code, language')
    .eq('user_id', user.id)
    .eq('problem_id', params.problemId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle() : Promise.resolve({ data: null, error: null });
    
  const [
    { data: problem, error: problemError }, 
    { data: contest, error: contestError },
    { data: lastSubmission, error: submissionError }
  ] = await Promise.all([
    problemPromise,
    contestPromise,
    lastSubmissionPromise
  ]);

  if (problemError || contestError || !problem || !contest) {
    notFound();
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="w-1/2 overflow-y-auto p-4 bg-gray-900">
        <ProblemDetails problem={problem} />
      </div>

      <div className="w-1/2 flex flex-col bg-gray-800 border-l border-gray-700">
        <ProblemWorkspace
          problem={problem}
          contestId={contestId}
          contestEndTime={contest.end_time}
          lastSubmission={lastSubmission} // Pass the new data down
        />
      </div>
    </div>
  );
}