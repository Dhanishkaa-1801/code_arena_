'use server';

import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// --- TYPE DEFINITIONS ---
export type RunCodeState = {
  verdict: string | null;
  output: string | null;
  error: string | null;
};
export type SubmissionState = { verdict?: string | null; error?: string | null };

const languageIdMap: { [key: string]: number } = { python: 71, cpp: 54, java: 62, c: 50 };

// --- "Run Code" ACTION ---
// This function does not need any changes.
const runCodeSchema = z.object({ code: z.string(), language: z.string(), customInput: z.string() });

export async function runCode(prevState: RunCodeState, formData: FormData): Promise<RunCodeState> {
  const validated = runCodeSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validated.success) return { verdict: 'Error', output: null, error: "Invalid input for running code." };
  
  const { code, language, customInput } = validated.data;
  const languageId = languageIdMap[language];
  if (!languageId) return { verdict: 'Error', output: null, error: "Invalid language." };

  try {
    const response = await fetch(`${process.env.JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-RapidAPI-Key': process.env.JUDGE0_API_KEY!, 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' },
      body: JSON.stringify({
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(customInput).toString('base64'),
      }),
    });

    if (!response.ok) throw new Error("API request to Judge0 failed.");

    const result = await response.json();
    const statusId = result.status?.id;
    const verdict = result.status?.description || 'Error';

    if (statusId === 3) { // Status 3 is "Accepted"
      return { 
        verdict: "Accepted",
        output: result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf-8') : '(No output was produced)',
        error: null,
      };
    } else { // Any other status is an error
      const errorMessage = result.compile_output || result.stderr;
      return { 
        verdict,
        output: null,
        error: errorMessage ? Buffer.from(errorMessage, 'base64').toString('utf-8') : 'An unknown error occurred.',
      };
    }
  } catch (error: any) {
    console.error("Run code failed:", error);
    return { verdict: 'System Error', output: null, error: "Failed to execute code." };
  }
}

// --- "Submit Code" ACTION (UPDATED) ---
// This is the main part that has been changed.
const submissionSchema = z.object({
  code: z.string().min(1, "Code cannot be empty."),
  language: z.string(),
  problemId: z.coerce.number(),
  // CONTEST ID IS NOW OPTIONAL
  contestId: z.coerce.number().optional().nullable(),
});

export async function submitCode(prevState: SubmissionState, formData: FormData): Promise<SubmissionState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to submit." };

  const validated = submissionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validated.success) return { error: "Invalid submission data." };

  // contestId can now be null or undefined
  const { code, language, problemId, contestId } = validated.data;
  const languageId = languageIdMap[language];
  if (!languageId) return { error: "Invalid language selected." };
  
  try {
    // --- CONTEST-SPECIFIC LOGIC ---
    // This block only runs if a contestId is provided.
    if (contestId) {
      const { data: contest, error: contestError } = await supabase
        .from('contests')
        .select('end_time')
        .eq('id', contestId)
        .single();

      if (contestError || !contest) {
        throw new Error("Contest not found.");
      }

      if (new Date() > new Date(contest.end_time)) {
        return { verdict: 'Error', error: "The contest has already ended. Submissions are closed." };
      }
    }

    // --- The rest of the logic is now generic and works for both modes ---

    const { data: testCases, error: testCaseError } = await supabase.from('problem_test_cases').select('input, expected_output').eq('problem_id', problemId);
    if (testCaseError || !testCases || testCases.length === 0) throw new Error("Could not find test cases for this problem.");
    
    const judge0Submissions = testCases.map(tc => ({
      source_code: Buffer.from(code).toString('base64'),
      language_id: languageId,
      stdin: Buffer.from(tc.input || '').toString('base64'),
      expected_output: Buffer.from(tc.expected_output || '').toString('base64'),
    }));

    const response = await fetch(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-RapidAPI-Key': process.env.JUDGE0_API_KEY!, 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' },
      body: JSON.stringify({ submissions: judge0Submissions }),
    });

    if (!response.ok) throw new Error(`Judge0 API request failed: ${response.statusText}`);

    const tokens = await response.json();
    if (!Array.isArray(tokens) || tokens.length === 0) {
        throw new Error("Judge0 did not return submission tokens.");
    }
    const tokenParams = tokens.map((t: { token: string }) => t.token).join(',');

    let results;
    
    // Polling logic
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const resultsResponse = await fetch(`${process.env.JUDGE0_API_URL}/submissions/batch?tokens=${tokenParams}&base64_encoded=true&fields=status_id,status,time,memory,compile_output,stderr`, {
            headers: { 'X-RapidAPI-Key': process.env.JUDGE0_API_KEY!, 'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com' }
        });
        results = await resultsResponse.json();
        const isProcessing = results.submissions.some((res: any) => res.status_id === 1 || res.status_id === 2);
        if (!isProcessing) break;
    }
    
    // Result aggregation logic
    let finalVerdict = 'Accepted';
    let detailedError = null;
    let totalTime = 0;
    let maxMemory = 0;

    for (const result of results.submissions) {
      totalTime = Math.max(totalTime, parseFloat(result.time || '0'));
      maxMemory = Math.max(maxMemory, result.memory || 0);

      if (result.status_id !== 3) {
          finalVerdict = result.status.description;
          detailedError = result.compile_output || result.stderr;
          break;
      }
    }

    // --- SAVE SUBMISSION (Now handles null contest_id) ---
    const { error: insertError } = await supabase.from('submissions').insert({
      user_id: user.id, 
      contest_id: contestId, // This will be null for practice problems, which is correct
      problem_id: problemId, 
      code: code, 
      language_id: languageId, 
      language: language, 
      verdict: finalVerdict, 
      execution_time: totalTime, 
      memory: maxMemory,
    });

    if (insertError) {
        console.error("Error saving submission:", insertError);
        throw new Error("Failed to save your submission result.");
    }

    // --- REVALIDATE PATHS (Conditional) ---
    if (contestId) {
      revalidatePath(`/contests/${contestId}/leaderboard`);
    }
    // Always revalidate the problem bank to update the status icon
    revalidatePath('/problems');
    revalidatePath(`/problems/${problemId}`); // Also revalidate the specific problem page

    return { 
      verdict: finalVerdict,
      error: detailedError ? Buffer.from(detailedError, 'base64').toString('utf-8') : null 
    };

  } catch (error: any) {
    console.error("Submission processing failed:", error);
    return { error: error.message || "An unexpected error occurred during submission." };
  }
}

// ... (keep your existing runCode and submitCode functions at the top of the file)

// --- NEW "Submit Practice Code" ACTION ---
// This action is ONLY for the practice zone. It does not handle contests.

const practiceSubmissionSchema = z.object({
  code: z.string().min(1, "Code cannot be empty."),
  language: z.string(),
  problemId: z.coerce.number(),
});

export async function submitPracticeCode(prevState: SubmissionState, formData: FormData): Promise<SubmissionState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to submit." };

  const validated = practiceSubmissionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validated.success) return { error: "Invalid submission data." };

  const { code, language, problemId } = validated.data;
  const languageId = languageIdMap[language];
  if (!languageId) return { error: "Invalid language selected." };
  
  try {
    // No contest deadline check needed for practice mode.

    const { data: testCases, error: testCaseError } = await supabase.from('problem_test_cases').select('input, expected_output').eq('problem_id', problemId);
    if (testCaseError || !testCases || testCases.length === 0) throw new Error("Could not find test cases for this problem.");
    
    // The Judge0 logic is identical to your original submitCode function.
    // ... (Your full Judge0 batch submission and polling logic goes here) ...
    // ...
    const finalVerdict = 'Accepted'; // Placeholder for your logic
    const totalTime = 0.1; // Placeholder for your logic
    const maxMemory = 1024; // Placeholder for your logic
    let detailedError = null; // Placeholder for your logic

    // Save submission with contest_id explicitly as null.
    const { error: insertError } = await supabase.from('submissions').insert({
      user_id: user.id, 
      contest_id: null, // Always null for practice submissions
      problem_id: problemId, 
      code: code, 
      language_id: languageId, 
      language: language, 
      verdict: finalVerdict, 
      execution_time: totalTime, 
      memory: maxMemory,
    });

    if (insertError) throw new Error("Failed to save your submission result.");

    // Revalidate paths to update the UI
    revalidatePath('/problems');
    revalidatePath(`/problems/${problemId}`);

    return { 
      verdict: finalVerdict,
      error: detailedError
    };

  } catch (error: any) {
    console.error("Practice submission failed:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}

