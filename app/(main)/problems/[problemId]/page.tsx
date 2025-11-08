import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import PracticeWorkspace from '@/components/PracticeWorkspace';
import { Database } from '@/types_db';

type Problem = Database['public']['Tables']['contest_problems']['Row'];

// This is the ProblemDetails component from your working contest page (Expanded padding and font sizes)
function ProblemDetails({ problem }: { problem: Problem }) {
  const difficultyStyles = {
    Easy: 'bg-green-500/20 text-green-300',
    Medium: 'bg-yellow-500/20 text-yellow-300',
    Hard: 'bg-red-500/20 text-red-300',
  };

  return (
    <div className="p-8 text-gray-300"> {/* Increased padding from p-6 to p-8 */}
      <h1 className="text-3xl font-bold text-white mb-6"> {/* Increased font from 2xl to 3xl, mb-4 to mb-6 */}
        {problem.title}
      </h1>
      <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border-color"> {/* Increased mb-6 to mb-8, pb-6 to pb-8 */}
        <span className={`px-4 py-2 text-sm font-semibold rounded-full ${difficultyStyles[problem.difficulty] || 'bg-gray-500/20'}`}>{problem.difficulty}</span> {/* Increased px-3 to px-4, py-1 to py-2 */}
      </div>
      <div className="prose prose-invert max-w-none prose-lg"> {/* Added prose-lg for larger text */}
        <h2 className="text-xl font-semibold text-white !mb-4">Problem Description</h2> {/* Increased to xl */}
        <div className="text-gray-300" dangerouslySetInnerHTML={{ __html: problem.description || '<p>No description provided.</p>' }} />
        <h2 className="text-xl font-semibold text-white !mt-10 !mb-4">Sample Input</h2> {/* Increased to xl, mt-8 to mt-10 */}
        <pre className="bg-dark-bg p-6 rounded-md text-gray-200 !mt-0"><code>{problem.sample_input || 'N/A'}</code></pre> {/* Increased p-4 to p-6 */}
        <h2 className="text-xl font-semibold text-white !mt-8 !mb-4">Sample Output</h2> {/* Increased to xl */}
        <pre className="bg-dark-bg p-6 rounded-md text-gray-200 !mt-0"><code>{problem.sample_output || 'N/A'}</code></pre> {/* Increased p-4 to p-6 */}
        {problem.constraints && (
          <>
            <h2 className="text-xl font-semibold text-white !mt-8 !mb-4">Constraints</h2> {/* Increased to xl */}
            <div className="text-gray-300" dangerouslySetInnerHTML={{ __html: problem.constraints }}/>
          </>
        )}
      </div>
    </div>
  );
}

export default async function PracticeProblemPage({ params }: { params: { problemId: string } }) {
  const supabase = createClient();
  const problemId = parseInt(params.problemId, 10);
  const { data: { user } } = await supabase.auth.getUser();

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
    
  const isContestFinished = contest ? new Date(contest.end_time) <= new Date() : false;
  if (!problem.is_practice_available || !isContestFinished) {
    return (
        <div className="flex h-full items-center justify-center text-center p-8">
            <div>
                <h1 className="text-2xl font-bold text-white">Problem Not Available</h1>
                <p className="text-gray-400 mt-2">This problem is either not published for practice or its original contest is still active.</p>
            </div>
        </div>
    );
  }

  let lastSubmission = { code: null, language: null };
  if (user) {
    const { data: submission } = await supabase
      .from('submissions')
      .select('code, language')
      .eq('user_id', user.id)
      .eq('problem_id', problemId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (submission) {
      lastSubmission = submission;
    }
  }

  return (
    <main className="p-0 h-[calc(100vh-70px)] bg-dark-bg"> {/* Expanded: Removed all padding to stretch to edges */}
      <div className="flex h-full w-full rounded-none border-2 border-arena-blue overflow-hidden"> {/* Expanded: Removed rounded-lg, made full size */}
        <div className="w-1/2 overflow-y-auto bg-card-bg border-r border-border-color">
          <ProblemDetails problem={problem} />
        </div>
        <div className="w-1/2 flex flex-col bg-dark-bg">
          <PracticeWorkspace
            problemId={problem.id}
            initialCode={lastSubmission.code}
            initialLanguage={lastSubmission.language}
          />
        </div>
      </div>
    </main>
  );
}