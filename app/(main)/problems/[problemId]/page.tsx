import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import PracticeWorkspace from '@/components/PracticeWorkspace';
import { Database } from '@/types_db';

type Problem = Database['public']['Tables']['contest_problems']['Row'];

function ProblemDetails({ problem }: { problem: Problem }) {
  const difficultyStyles: Record<'Easy' | 'Medium' | 'Hard', string> = {
    Easy: 'bg-green-500/20 text-green-300',
    Medium: 'bg-yellow-500/20 text-yellow-300',
    Hard: 'bg-red-500/20 text-red-300',
  };

  // Narrow difficulty before indexing
  const difficultyClass =
    (problem.difficulty &&
      difficultyStyles[problem.difficulty as keyof typeof difficultyStyles]) ||
    'bg-gray-500/20';

  return (
    <div className="p-8 text-gray-300">
      <h1 className="text-3xl font-bold text-white mb-6">
        {problem.title}
      </h1>
      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border-color">
        <span
          className={`px-4 py-2 text-sm font-semibold rounded-full ${difficultyClass}`}
        >
          {problem.difficulty}
        </span>
      </div>
      <div className="prose prose-invert max-w-none prose-lg">
        <h2 className="text-xl font-semibold text-white !mb-4">
          Problem Description
        </h2>
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
export default async function PracticeProblemPage({
  params,
}: {
  params: { problemId: string };
}) {
  const supabase = createClient();
  const problemId = parseInt(params.problemId, 10);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: problem, error: problemError } = await supabase
    .from('contest_problems')
    .select('*')
    .eq('id', problemId)
    .single();

  if (problemError || !problem) {
    notFound();
  }

  const { data: contest } = await supabase
    .from('contests')
    .select('end_time')
    .eq('id', problem.contest_id)
    .single();

  const isContestFinished = contest
    ? new Date(contest.end_time) <= new Date()
    : false;

  if (!problem.is_practice_available || !isContestFinished) {
    return (
      <div className="flex h-full items-center justify-center text-center p-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Problem Not Available</h1>
          <p className="text-gray-400 mt-2">
            This problem is either not published for practice or its original
            contest is still active.
          </p>
        </div>
      </div>
    );
  }

  // --------- LAST SUBMISSION PREFILL (FIXED) ---------
  let lastSubmissionCode: string | null = null;
  let lastSubmissionLanguage: string | null = null;

  if (user) {
    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select('code, language, submitted_at')
      .eq('user_id', user.id)
      .eq('problem_id', problemId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (submissionError) {
      console.error('Error fetching last submission:', submissionError);
    }

    if (submission) {
      lastSubmissionCode = submission.code;
      lastSubmissionLanguage = submission.language;
    }
  }

  return (
    <main className="p-4 sm:p-8 h-[calc(100vh-70px)] bg-dark-bg">
      <div className="max-w-screen-2xl mx-auto h-full">
        <div className="flex h-full w-full rounded-lg border-2 border-arena-blue overflow-hidden shadow-2xl shadow-arena-blue/10">
          <div className="w-1/2 overflow-y-auto bg-card-bg border-r border-border-color">
            <ProblemDetails problem={problem} />
          </div>
          <div className="w-1/2 flex flex-col bg-dark-bg">
            <PracticeWorkspace
              problemId={problem.id}
              initialCode={lastSubmissionCode}
              initialLanguage={lastSubmissionLanguage}
            />
          </div>
        </div>
      </div>
    </main>
  );
}