import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ProblemWorkspace from '@/components/ProblemWorkspace';
import { Database } from '@/types_db';
import { getStreamFromDepartment } from '@/utils/streams';

type Problem = Database['public']['Tables']['contest_problems']['Row'];

// Left panel: problem details
function ProblemDetails({ problem, index }: { problem: Problem; index: number }) {
  const difficultyStyles: Record<'Easy' | 'Medium' | 'Hard', string> = {
    Easy: 'bg-green-500/20 text-green-300',
    Medium: 'bg-yellow-500/20 text-yellow-300',
    Hard: 'bg-red-500/20 text-red-300',
  };

  const problemLetter = String.fromCharCode(65 + index);

  const difficultyClass =
    (problem.difficulty &&
      difficultyStyles[problem.difficulty as keyof typeof difficultyStyles]) ||
    'bg-gray-500/20';

  return (
    <div className="p-8 text-gray-300">
      <h1 className="text-3xl font-bold text-white mb-6">
        {`${problemLetter}. ${problem.title}`}
      </h1>

      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border-color">
        <span
          className={`px-4 py-2 text-sm font-semibold rounded-full ${difficultyClass}`}
        >
          {problem.difficulty}
        </span>
      </div>

      <div className="prose prose-invert max-w-none prose-lg">
        <h2 className="text-xl font-semibold text-white !mb-4">Problem Description</h2>
        <div
          className="text-gray-300"
          dangerouslySetInnerHTML={{
            __html: problem.description || '<p>No description provided.</p>',
          }}
        />

        <h2 className="text-xl font-semibold text-white !mt-10 !mb-4">
          Sample Input
        </h2>
        <pre className="bg-dark-bg p-6 rounded-md text-gray-200 !mt-0">
          <code>{problem.sample_input || 'N/A'}</code>
        </pre>

        <h2 className="text-xl font-semibold text-white !mt-8 !mb-4">
          Sample Output
        </h2>
        <pre className="bg-dark-bg p-6 rounded-md text-gray-200 !mt-0">
          <code>{problem.sample_output || 'N/A'}</code>
        </pre>

        {problem.constraints && (
          <>
            <h2 className="text-xl font-semibold text-white !mt-8 !mb-4">
              Constraints
            </h2>
            <div
              className="text-gray-300"
              dangerouslySetInnerHTML={{ __html: problem.constraints }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default async function ProblemPage({
  params,
  searchParams,
}: {
  params: { id: string; problemId: string };
  searchParams: { index?: string };
}) {
  const supabase = createClient();
  const contestId = Number(params.id);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const problemPromise = supabase
    .from('contest_problems')
    .select('*')
    .eq('id', params.problemId)
    .single();

  const contestPromise = supabase
    .from('contests')
    .select('end_time, stream')
    .eq('id', contestId)
    .single();

  const profilePromise = supabase
    .from('profiles')
    .select('department')
    .eq('id', user.id)
    .single();

  const lastSubmissionPromise = supabase
    .from('submissions')
    .select('code, language')
    .eq('user_id', user.id)
    .eq('problem_id', params.problemId)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const [
    { data: problem, error: problemError },
    { data: contest, error: contestError },
    { data: profile },
    { data: lastSubmission },
  ] = await Promise.all([
    problemPromise,
    contestPromise,
    profilePromise,
    lastSubmissionPromise,
  ]);

  if (problemError || contestError || !problem || !contest) {
    notFound();
  }

  // Stream lock logic
  let isLocked = false;
  if (contest.stream && contest.stream !== 'all') {
    const userStream = getStreamFromDepartment(profile?.department || null);
    if (userStream !== contest.stream) {
      isLocked = true;
    }
  }

  const problemIndex = Number(searchParams.index || 0);

  return (
    <main className="p-4 sm:p-8 h-[calc(100vh-70px)] bg-dark-bg">
      <div className="max-w-screen-2xl mx-auto h-full">
        <div className="flex h-full w-full rounded-lg border-2 border-arena-blue overflow-hidden shadow-2xl shadow-arena-blue/10">
          <div className="w-1/2 overflow-y-auto bg-card-bg border-r border-border-color">
            <ProblemDetails problem={problem} index={problemIndex} />
          </div>
          <div className="w-1/2 flex flex-col bg-dark-bg">
            <ProblemWorkspace
              problem={problem}
              contestId={contestId}
              contestEndTime={contest.end_time}
              lastSubmission={lastSubmission}
              isLocked={isLocked}
            />
          </div>
        </div>
      </div>
    </main>
  );
}