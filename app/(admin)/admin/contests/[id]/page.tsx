import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ManageContestProblemsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const contestId = params.id;

  const [contestRes, problemsRes] = await Promise.all([
    supabase.from('contests').select('name').eq('id', contestId).single(),
    supabase.from('contest_problems').select('*').eq('contest_id', contestId).order('created_at')
  ]);
  
  const { data: contest, error: contestError } = contestRes;
  const { data: problems, error: problemsError } = problemsRes;
  
  if (contestError) {
    console.error("Contest fetch error:", contestError);
    notFound();
  }

  // --- UPDATED SERVER ACTION ---
  // The 'description' field is no longer needed here.
  const addProblem = async (formData: FormData) => {
    'use server';

    const title = formData.get('title') as string;
    const difficulty = formData.get('difficulty') as 'Easy' | 'Medium' | 'Hard';
    const contestId = formData.get('contestId') as string;

    if (!title || !difficulty || !contestId) {
        return { error: 'Missing required fields.' };
    }

    const supabase = createClient();
    const { error } = await supabase.from('contest_problems').insert({
        contest_id: contestId,
        title,
        difficulty,
        // The 'description' field is now omitted and will default to null in the DB
    });

    if (error) {
        console.error("Error adding problem:", error);
        return { error: 'Failed to add problem.' };
    }
    
    revalidatePath(`/admin/contests/${contestId}`);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold">
        Manage Problems for: <span className="text-arena-blue">{contest.name}</span>
      </h2>
      <p className="text-gray-400 mt-1 mb-8">Quickly add problem stubs, then click "Edit Details" to add the full question and test cases.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1: Add Problem Form */}
        <div className="md:col-span-1">
          <div className="bg-card-bg p-6 rounded-lg border border-border-color sticky top-24">
            <h3 className="text-xl font-semibold mb-4 text-arena-mint">Add New Problem</h3>
            
            {/* --- UPDATED FORM --- */}
            <form action={addProblem} className="space-y-4">
              <input type="hidden" name="contestId" value={contestId} />
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300">Problem Title</label>
                <input type="text" name="title" id="title" required className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-2" />
              </div>

              {/* The description textarea has been REMOVED from this form */}
              
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-300">Difficulty</label>
                <select name="difficulty" id="difficulty" required className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-2">
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 px-4 bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg font-bold rounded-md">
                Add Problem 
              </button>
            </form>
          </div>
        </div>

        {/* Column 2: List of Existing Problems */}
        <div className="md:col-span-2">
           <div className="bg-card-bg p-6 rounded-lg border border-border-color">
            <h3 className="text-xl font-semibold mb-4 text-arena-blue">Existing Problems ({problems?.length || 0})</h3>
            <div className="space-y-4">
              {problems && problems.length > 0 ? problems.map(problem => (
                <div key={problem.id} className="p-4 bg-dark-bg rounded-md border border-border-color">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{problem.title}</p>
                      {/* This description will now likely be empty until edited, which is fine */}
                      <p className="mt-2 text-sm text-gray-400 truncate">{problem.description || 'No question added yet. Click "Edit Details".'}</p>
                    </div>
                    <div className="flex-shrink-0 ml-4 flex items-center space-x-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        problem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                        problem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>{problem.difficulty}</span>
                      
                      <Link 
                        href={`/admin/contests/${contestId}/problems/${problem.id}`} 
                        className="text-sm font-semibold text-arena-blue hover:underline"
                      >
                        Edit Details
                      </Link>
                    </div>
                  </div>
                </div>
              )) : <p className="text-gray-400">No problems have been added to this contest yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}