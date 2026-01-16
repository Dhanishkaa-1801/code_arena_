'use server';

import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// --- TYPES ---
export type RunCodeState = {
  verdict: string | null;
  stdout: string | null;
  error: string | null;
};

export type SubmissionState = { verdict?: string | null; error?: string | null };

const languageIdMap: { [key: string]: number } = {
  python: 71,
  cpp: 54,
  java: 62,
  c: 50,
};

// --- HELPERS ---
const runCodeSchema = z.object({
  code: z.string(),
  language: z.string(),
  input: z.string().optional(),
});

const decodeBase64 = (value?: string | null): string | null =>
  value ? Buffer.from(value, 'base64').toString('utf-8') : null;

// 🔁 Stream mapping (final target mapping)
function getStreamFromDepartment(dept: string | null): '1' | '2' | '3' {
  if (!dept) return '3';
  const d = dept.toUpperCase();

  // Stream 1 (Core/General): AERO, BME, CIVIL, MECH, R&A.
  if (['AERO', 'BME', 'CIVIL', 'MECH', 'R&A'].includes(d)) return '1';

  // Stream 2 (Electrical): ECE, EEE, EIE.
  if (['ECE', 'EEE', 'EIE'].includes(d)) return '2';

  // Stream 3 (Comp/IT): AIDS, CSE, IT, M.Tech.
  if (['CSE', 'IT', 'AIDS', 'AI&DS', 'MTECH', 'M.TECH'].includes(d)) return '3';

  return '3';
}

// --- 1. RUN CODE (TESTING ONLY) ---
export async function runCode(payload: {
  code: string;
  language: string;
  input: string;
}): Promise<RunCodeState> {
  const validated = runCodeSchema.safeParse(payload);
  if (!validated.success) {
    return { verdict: 'Error', stdout: null, error: 'Invalid input for running code.' };
  }

  const { code, language, input } = validated.data;
  const languageId = languageIdMap[language];
  if (!languageId) {
    return { verdict: 'Error', stdout: null, error: 'Invalid language selected.' };
  }

  try {
    const response = await fetch(
      `${process.env.JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_code: Buffer.from(code).toString('base64'),
          language_id: languageId,
          stdin: Buffer.from(input || '').toString('base64'),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Judge0 API request failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('runCode raw result:', JSON.stringify(result));

    const statusId = result.status?.id;
    const verdict = result.status?.description || 'Error';

    const stdout = decodeBase64(result.stdout);
    const stderr = decodeBase64(result.stderr);
    const compileOut = decodeBase64(result.compile_output);
    const message = decodeBase64(result.message);

    // Accepted → show stdout
    if (statusId === 3) {
      return {
        verdict: 'Accepted',
        stdout: stdout ?? '(No output was produced)',
        error: null,
      };
    }

    // Non-accepted → build a detailed error message
    let errorText =
      compileOut ??
      stderr ??
      message ??
      stdout ??
      null;

    if (!errorText) {
      const lower = verdict.toLowerCase();
      if (lower.includes('wrong answer')) {
        errorText =
          'Your output did not match the expected output for the provided input.';
      } else if (lower.includes('time limit')) {
        errorText = 'Your program exceeded the time limit.';
      } else if (lower.includes('internal error')) {
        errorText =
          'Internal error inside the judge. Please try again or contact the admin if this keeps happening.';
      } else {
        errorText = 'The judge reported an error but did not provide additional details.';
      }
    }

    return {
      verdict,
      stdout: null,
      error: errorText,
    };
  } catch (e: any) {
    console.error('Run code failed:', e);
    return { verdict: 'System Error', stdout: null, error: 'Failed to execute code.' };
  }
}

// --- 2. SUBMIT CONTEST CODE (STREAM CHECK + PROCTORING) ---
export async function submitCode(
  prevState: SubmissionState,
  formData: FormData
): Promise<SubmissionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Login required.' };

  const code = formData.get('code') as string;
  const language = formData.get('language') as string;
  const problemId = Number(formData.get('problemId'));
  const contestId = Number(formData.get('contestId'));

  // 🚨 Disqualification check based on tab switches
  if (contestId) {
    const { data: monitoring } = await supabase
      .from('contest_monitoring')
      .select('tab_switches')
      .eq('user_id', user.id)
      .eq('contest_id', contestId)
      .maybeSingle();

    if (monitoring && monitoring.tab_switches >= 3) {
      return {
        verdict: 'Error',
        error:
          '⛔ DISQUALIFIED: You have exceeded the maximum number of tab switches allowed. Submissions are disabled.',
      };
    }
  }

  // Fetch contest with end_time + stream
  const { data: contest } = await supabase
    .from('contests')
    .select('end_time, stream')
    .eq('id', contestId)
    .single();

  // If contest missing or ended, block
  if (!contest || new Date() > new Date(contest.end_time)) {
    return {
      verdict: 'Error',
      error: 'This contest has ended. Please go to the Problem Bank to practice.',
    };
  }

  // Stream restriction: only allow submissions if user's stream matches contest.stream (unless 'all')
  if (contest.stream && contest.stream !== 'all') {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('department')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error for stream check:', profileError);
      return {
        verdict: 'Error',
        error: 'Could not verify your profile stream. Please contact admin.',
      };
    }

    const userStream = getStreamFromDepartment(profile.department);
    const contestStream = contest.stream as '1' | '2' | '3' | 'all';

    if (contestStream !== 'all' && userStream !== contestStream) {
      return {
        verdict: 'Error',
        error: 'This contest is not available for your stream.',
      };
    }
  }

  // If contest is active, stream matches, and NOT disqualified, proceed
  return processSubmission(user.id, problemId, contestId, code, language);
}

// --- 3. SUBMIT PRACTICE CODE (FLEXIBLE) ---
export async function submitPracticeCode(
  prevState: SubmissionState,
  formData: FormData
): Promise<SubmissionState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Login required.' };

  const code = formData.get('code') as string;
  const language = formData.get('language') as string;
  const problemId = Number(formData.get('problemId'));

  // Find which contest this problem belongs to
  const { data: problem } = await supabase
    .from('contest_problems')
    .select('contest_id, contests(end_time)')
    .eq('id', problemId)
    .single();

  const realContestId = problem?.contest_id;
  // @ts-ignore
  const endTime = problem?.contests?.end_time;

  // If contest exists and is still live, block practice submissions
  if (realContestId && endTime && new Date() < new Date(endTime)) {
    return {
      verdict: 'Error',
      error: 'This contest is LIVE! Please submit via the Contest page.',
    };
  }

  // Otherwise (collection or ended contest), allow submission
  return processSubmission(user.id, problemId, realContestId || null, code, language);
}

// --- 4. SHARED HELPER: JUDGING & SAVING ---
async function processSubmission(
  userId: string,
  problemId: number,
  contestId: number | null,
  code: string,
  language: string
): Promise<SubmissionState> {
  console.log(`\n--- STARTING SUBMISSION [User: ${userId}, Problem: ${problemId}] ---`);

  const supabase = createClient();
  const languageId = languageIdMap[language];

  try {
    // A. Fetch Test Cases
    const { data: testCases, error: tcError } = await supabase
      .from('problem_test_cases')
      .select('input, expected_output')
      .eq('problem_id', problemId);

    if (tcError) console.error('❌ Test Case DB Error:', tcError);
    if (!testCases?.length) throw new Error('No test cases found.');

    console.log(`✅ Found ${testCases.length} test cases.`);

    // B. Send to Judge0 (Batch)
    console.log('🚀 Sending to Judge0...');
    const judge0Submissions = testCases.map((tc) => ({
      source_code: Buffer.from(code).toString('base64'),
      language_id: languageId,
      stdin: Buffer.from(tc.input || '').toString('base64'),
      expected_output: Buffer.from(tc.expected_output || '').toString('base64'),
    }));

    const response = await fetch(
      `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=true`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions: judge0Submissions }),
      }
    );

    if (!response.ok) {
      throw new Error(`Judge0 batch request failed: ${response.status} ${response.statusText}`);
    }

    const tokens = await response.json();
    if (!tokens || !tokens.length) throw new Error('Judge API Error (No tokens returned)');

    const tokenStr = tokens.map((t: any) => t.token).join(',');

    // C. Poll for Results
    let results;
    console.log('⏳ Polling Judge0...');
    while (true) {
      await new Promise((r) => setTimeout(r, 2000));
      const res = await fetch(
        `${process.env.JUDGE0_API_URL}/submissions/batch?tokens=${tokenStr}&base64_encoded=true&fields=status_id,status,time,memory,compile_output,stderr`
      );

      if (!res.ok) {
        throw new Error(`Judge0 poll request failed: ${res.status} ${res.statusText}`);
      }

      results = await res.json();
      if (!results.submissions.some((s: any) => s.status_id === 1 || s.status_id === 2)) break;
    }

    // D. Calculate Verdict
    let finalVerdict = 'Accepted';
    let detailedError: string | null = null;
    let totalTime = 0;
    let maxMemory = 0;

    for (const result of results.submissions) {
      totalTime = Math.max(totalTime, parseFloat(result.time || '0'));
      maxMemory = Math.max(maxMemory, result.memory || 0);

      if (result.status_id !== 3) {
        const desc = result.status?.description || 'Error';
        finalVerdict = desc;

        const compileOut = decodeBase64(result.compile_output);
        const stderr = decodeBase64(result.stderr);

        if (compileOut) {
          detailedError = compileOut;
        } else if (stderr) {
          detailedError = stderr;
        } else if (desc.toLowerCase().includes('wrong answer')) {
          detailedError =
            'Your output did not match the expected output on at least one test case.';
        } else if (desc.toLowerCase().includes('time limit')) {
          detailedError =
            'Your program exceeded the time limit on at least one test case.';
        } else {
          detailedError = 'The judge reported an error but did not provide details.';
        }

        break;
      }
    }

    // E. INSERT INTO DB
    console.log('💾 Attempting DB Insert...');
    const payload = {
      user_id: userId,
      contest_id: contestId,
      problem_id: problemId,
      code,
      language,
      language_id: languageId,
      verdict: finalVerdict,
      execution_time: totalTime,
      memory: maxMemory,
    };

    const { data: insertedData, error: insertError } = await supabase
      .from('submissions')
      .insert(payload)
      .select()
      .single();

    if (insertError) {
      console.error('❌ DB INSERT FAILED. REASON:', insertError);
      console.error('Payload was:', JSON.stringify(payload));
      throw new Error('Database refused the submission: ' + insertError.message);
    }

    console.log('✅ DB INSERT SUCCESS. New Submission ID:', insertedData.id);

    // F. Update UI
    revalidatePath('/problems');
    revalidatePath(`/problems/${problemId}`);
    revalidatePath(`/profile/${userId}`);
    if (contestId) revalidatePath(`/contests/${contestId}/leaderboard`);

    console.log('--- SUBMISSION COMPLETE ---\n');

    return {
      verdict: finalVerdict,
      error: detailedError,
    };
  } catch (err: any) {
    console.error('❌ Submission Workflow Failed:', err);
    return { error: err.message || 'Submission failed.' };
  }
}