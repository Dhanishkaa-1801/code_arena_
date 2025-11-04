import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import ProblemEditorForm from './problem-editor-form'; // We will create this next

export default async function EditProblemPage({ params }: { params: { id: string; problemId: string } }) {
  const supabase = createClient();
  const contestId = params.id;
  const problemId = params.problemId;

  // Fetch the problem and its test cases
  const { data: problem, error } = await supabase
    .from('contest_problems')
    .select(`*, problem_test_cases(*)`)
    .eq('id', problemId)
    .single();

  if (error || !problem) {
    notFound();
  }

  // Server Action to save all details
  const updateProblemDetails = async (formData: FormData) => {
    'use server';

    const supabase = createClient();

    // 1. Get all data from the form
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const sampleInput = formData.get('sampleInput') as string;
    const sampleOutput = formData.get('sampleOutput') as string;
    const constraints = formData.get('constraints') as string;
    const difficulty = formData.get('difficulty') as 'Easy' | 'Medium' | 'Hard';
    
    // Test cases are passed as a JSON string
    const testCasesStr = formData.get('testCases') as string;
    const testCases = JSON.parse(testCasesStr);

    // 2. Update the main problem details
    const { error: problemUpdateError } = await supabase
      .from('contest_problems')
      .update({ title, description, sample_input: sampleInput, sample_output: sampleOutput, constraints, difficulty })
      .eq('id', problemId);

    if (problemUpdateError) {
      console.error('Problem update error:', problemUpdateError);
      return redirect(`/admin/contests/${contestId}/problems/${problemId}?error=update_failed`);
    }

    // 3. Replace the test cases (delete old ones, insert new ones)
    // This is simpler and more reliable than trying to diff them.
    const { error: deleteError } = await supabase.from('problem_test_cases').delete().eq('problem_id', problemId);
    if (deleteError) {
      console.error('Test case delete error:', deleteError);
    }
    
    const testCasesToInsert = testCases.map((tc: any) => ({
      problem_id: problemId,
      input: tc.input,
      expected_output: tc.output,
      is_hidden: true // All judge test cases are hidden by default
    }));

    if (testCasesToInsert.length > 0) {
      const { error: insertError } = await supabase.from('problem_test_cases').insert(testCasesToInsert);
      if (insertError) {
        console.error('Test case insert error:', insertError);
      }
    }
    
    // 4. Revalidate and redirect
    revalidatePath(`/admin/contests/${contestId}`);
    revalidatePath(`/admin/contests/${contestId}/problems/${problemId}`);
    redirect(`/admin/contests/${contestId}`);
  };

  return (
    <div>
      <Link href={`/admin/contests/${contestId}`} className="text-sm text-arena-blue hover:underline mb-4 inline-block">
        &larr; Back to Contest Problems
      </Link>
      <h2 className="text-3xl font-bold mb-6">Edit Problem Details</h2>
      
      {/* The form is a Client Component to manage the dynamic test cases */}
      <ProblemEditorForm problem={problem} action={updateProblemDetails} />
    </div>
  );
}