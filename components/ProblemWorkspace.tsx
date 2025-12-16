'use client';

import { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import { Database } from '@/types_db';
import { useFormState, useFormStatus } from 'react-dom';
import { submitCode } from '@/app/actions/submissions';
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
}

function SubmitButton({ isContestOver }: { isContestOver: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={isContestOver || pending}
      className="w-full px-6 py-2 bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg font-bold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Submitting...' : 'Submit Code'}
    </button>
  );
}

export default function ProblemWorkspace({
  problem,
  contestId,
  contestEndTime,
  lastSubmission,
}: ProblemWorkspaceProps) {
  const [code, setCode] = useState(lastSubmission?.code || '');
  const [language, setLanguage] = useState(lastSubmission?.language || 'python');

  const [submissionState, submitAction] = useFormState(submitCode, {
    verdict: '',
    error: null,
  });

  const [isContestOver, setIsContestOver] = useState(
    new Date() > new Date(contestEndTime)
  );

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
      {/* Main content (editor + tabs + submit) */}
      <div className="flex flex-col h-full">
        {/* Language selector */}
        <div className="flex-shrink-0 bg-card-bg p-2 flex items-center justify-end border-b border-border-color">
          <select
            id="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-gray-700 text-white text-sm rounded-md p-1"
            disabled={false} // kept active; overlay will block interaction when contest is over
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

        {/* Tabs: Testcase / Result (Run Code lives here) */}
        <div className="flex-shrink-0 h-2/5 border-t-2 border-arena-blue">
          <WorkspaceTabs submissionResult={submissionState} code={code} language={language} />
        </div>

        {/* Submit bar */}
        <div className="flex-shrink-0 bg-card-bg p-3 border-t border-border-color">
          <form action={submitAction}>
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="language" value={language} />
            <input type="hidden" name="problemId" value={problem.id} />
            <input type="hidden" name="contestId" value={contestId} />
            <SubmitButton isContestOver={isContestOver} />
          </form>
        </div>
      </div>

      {/* Blur overlay only when contest is over */}
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