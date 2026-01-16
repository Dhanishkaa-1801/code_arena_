'use client';

import { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import { Database } from '@/types_db';
import { useFormState, useFormStatus } from 'react-dom';
import { submitCode } from '@/app/actions/submissions';
import { logTabSwitch, markContestOpened } from '@/app/actions/proctor';
import WorkspaceTabs from './WorkspaceTabs';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-github_dark';

type Problem = Database['public']['Tables']['contest_problems']['Row'];
type Contest = Database['public']['Tables']['contests']['Row'];
type LastSubmission = {
  code: string | null;
  language: string | null;
} | null;

interface ProblemWorkspaceProps {
  problem: Problem;
  contestId: Contest['id'];
  contestEndTime: Contest['end_time'];
  lastSubmission: LastSubmission;
  isLocked?: boolean;
}

function SubmitButton({ isContestOver, isDisqualified }: { isContestOver: boolean; isDisqualified: boolean }) {
  const { pending } = useFormStatus();
  let label = pending ? 'Submitting...' : 'Submit Code';
  if (isDisqualified) label = '⛔ Disqualified (Tab Limit)';
  else if (isContestOver) label = 'Contest Ended';

  return (
    <button
      type="submit"
      disabled={isContestOver || pending || isDisqualified}
      className={`w-full px-6 py-2 font-bold rounded-md transition-all shadow-lg 
        ${isDisqualified 
          ? 'bg-red-900/50 text-red-200 cursor-not-allowed border border-red-500/50' 
          : 'bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg hover:opacity-90 disabled:opacity-50'
        }`}
    >
      {label}
    </button>
  );
}

export default function ProblemWorkspace({
  problem,
  contestId,
  contestEndTime,
  lastSubmission,
  isLocked = false,
}: ProblemWorkspaceProps) {
  // 🔒 Locked view for wrong stream
  if (isLocked) {
    return (
      <div className="relative flex flex-col h-full bg-dark-bg items-center justify-center p-8 text-center">
        <div className="bg-card-bg border border-border-color p-8 rounded-lg max-w-md shadow-2xl">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Stream Restricted</h2>
          <p className="text-gray-400 mb-6 leading-relaxed">
            This problem is reserved for a specific stream during the live contest. 
            You cannot access the editor or submit code right now.
          </p>
          <div className="text-sm text-arena-pink font-semibold">
            Check back in the Problem Bank after the contest ends!
          </div>
        </div>
      </div>
    );
  }

  // Record when user first opened a problem in this contest
  useEffect(() => {
    (async () => {
      try {
        await markContestOpened(contestId);
      } catch (e) {
        console.error('Failed to mark contest opened', e);
      }
    })();
  }, [contestId]);

  const [code, setCode] = useState(lastSubmission?.code || '');
  const [language, setLanguage] = useState(lastSubmission?.language || 'python');

  const [submissionState, submitAction] = useFormState(submitCode, {
    verdict: '',
    error: null,
  });

  const [isContestOver, setIsContestOver] = useState(
    new Date() > new Date(contestEndTime)
  );

  const [violations, setViolations] = useState(0);

  // Proctoring: tab switch warnings
  useEffect(() => {
    if (isContestOver || violations >= 3) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        const newCount = violations + 1;
        setViolations(newCount);

        try {
          await logTabSwitch(contestId);
        } catch (err) {
          console.error('Failed to log tab switch', err);
        }

        if (newCount === 1) alert('⚠️ WARNING (1/3): Tab switching is prohibited.');
        else if (newCount === 2) alert('⚠️ FINAL WARNING (2/3): Next violation is disqualification.');
        else if (newCount >= 3) alert('⛔ DISQUALIFIED.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [contestId, violations, isContestOver]);

  // Timer: mark contest over when end time passes
  useEffect(() => {
    const interval = setInterval(() => {
      if (new Date() > new Date(contestEndTime)) {
        setIsContestOver(true);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [contestEndTime]);

  const getEditorMode = (lang: string) => {
    if (lang === 'c' || lang === 'cpp') return 'c_cpp';
    if (lang === 'java') return 'java';
    return 'python';
  };

  return (
    <div className="relative flex flex-col h-full bg-dark-bg">
      {/* RED FLASHING BANNER */}
      {violations >= 3 && (
        <div className="bg-red-600 text-white text-center text-xs font-bold py-1 animate-pulse z-50">
           ⛔ YOU HAVE BEEN DISQUALIFIED FOR TAB SWITCHING ⛔
        </div>
      )}

      <div className="flex flex-col h-full">
        {/* Language selector */}
        <div className="flex-shrink-0 bg-card-bg p-2 flex items-center justify-end border-b border-border-color">
          {violations > 0 && violations < 3 && (
            <div className="mr-auto px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-200 text-xs font-mono flex items-center gap-2">
              <span>⚠️ Warnings: {violations}/3</span>
            </div>
          )}
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-gray-700 text-white text-sm rounded-md p-1"
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="c">C</option>
          </select>
        </div>

        {/* Editor */}
        <div className="flex-grow relative min-h-0">
          <AceEditor
            mode={getEditorMode(language)}
            theme="github_dark"
            onChange={(newCode) => setCode(newCode)}
            value={code}
            name="code-editor"
            fontSize={16}
            width="100%"
            height="100%"
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              showPrintMargin: false,
            }}
            className="absolute top-0 left-0"
          />
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 h-2/5 border-t-2 border-arena-blue">
          <WorkspaceTabs
            submissionResult={submissionState}
            code={code}
            language={language}
            contestId={contestId}
          />
        </div>

        {/* Submit bar */}
        <div className="flex-shrink-0 bg-card-bg p-3 border-t border-border-color">
          <form action={submitAction}>
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="language" value={language} />
            <input type="hidden" name="problemId" value={problem.id} />
            <input type="hidden" name="contestId" value={contestId} />
            <SubmitButton isContestOver={isContestOver} isDisqualified={violations >= 3} />
          </form>
        </div>
      </div>

      {isContestOver && (
        <div className="absolute inset-0 bg-dark-bg/75 backdrop-blur-sm z-20 flex items-center justify-center">
          <p className="text-3xl font-bold text-red-400 drop-shadow-md">
            Contest Has Ended
          </p>
        </div>
      )}
    </div>
  );
}