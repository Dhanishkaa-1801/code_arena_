// app/actions/submissions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export type SubmissionState = {
  verdict?: string | null;
  error?: string | null;
};

const languageIdMap: { [key: string]: number } = {
  python: 71,
  cpp: 54,
  java: 62,
  c: 50,
};

const submissionSchema = z.object({
  code: z.string().min(1, "Code cannot be empty."),
  language: z.string(),
  problemId: z.coerce.number(),
  contestId: z.coerce.number(),
});

export async function submitCode(prevState: SubmissionState, formData: FormData): Promise<SubmissionState> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to submit." };
  }

  const validated = submissionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validated.success) { return { error: "Invalid submission data." }; }

  const { code, language, problemId, contestId } = validated.data;
  const languageId = languageIdMap[language];
  if (!languageId) { return { error: "Invalid language selected." }; }
  
  try {
    const { data: testCases, error: testCaseError } = await supabase
      .from('problem_test_cases')
      .select('input, expected_output')
      .eq('problem_id', problemId);

    if (testCaseError || !testCases || testCases.length === 0) {
      throw new Error("Could not find test cases for this problem.");
    }
    
    const judge0Submissions = testCases.map(tc => ({
      source_code: code,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.expected_output,
    }));

    const response = await fetch(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY!,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
      },
      body: JSON.stringify({ submissions: judge0Submissions }),
    });

    if (!response.ok) {
      throw new Error(`Judge0 API request failed: ${response.statusText}`);
    }

    const tokens = await response.json();
    const tokenParams = tokens.map((t: { token: string }) => t.token).join(',');

    let finalVerdict = 'Processing...';
    let results;
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const resultsResponse = await fetch(`${process.env.JUDGE0_API_URL}/submissions/batch?tokens=${tokenParams}&base64_encoded=false&fields=status_id,time,memory`, {
            headers: {
                'X-RapidAPI-Key': process.env.JUDGE0_API_KEY!,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            }
        });
        results = await resultsResponse.json();
        const isProcessing = results.submissions.some((res: any) => res.status_id === 1 || res.status_id === 2);
        if (!isProcessing) { break; }
    }
    
    let totalTime = 0;
    let maxMemory = 0;
    for (const result of results.submissions) {
      totalTime = Math.max(totalTime, parseFloat(result.time || '0'));
      maxMemory = Math.max(maxMemory, result.memory || 0);

      if (result.status_id !== 3) {
          finalVerdict = result.status_id === 4 ? 'Wrong Answer' : result.status_id === 5 ? 'Time Limit Exceeded' : result.status_id === 6 ? 'Compilation Error' : 'Runtime Error';
          break;
      }
      finalVerdict = 'Accepted';
    }

    // --- THIS IS THE ONLY CHANGE IN THIS FILE ---
    const { error: insertError } = await supabase.from('submissions').insert({
      user_id: user.id,
      contest_id: contestId,
      problem_id: problemId,
      code: code,
      language_id: languageId,
      language: language, // 👈 THE NEWLY ADDED LINE
      verdict: finalVerdict,
      execution_time: totalTime,
      memory: maxMemory,
    });

    if (insertError) { throw new Error("Failed to save your submission result."); }

    revalidatePath(`/contests/${contestId}/leaderboard`);

    return { verdict: finalVerdict };
  } catch (error: any) {
    console.error("Submission processing failed:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}