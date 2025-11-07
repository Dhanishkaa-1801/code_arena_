// components/ProblemWorkspace.tsx
'use client';

import { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import { Database } from '@/types_db';
import { useFormState, useFormStatus } from 'react-dom';
import { submitCode } from '@/app/actions/submissions';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-github_dark';

type Problem = Database['public']['Tables']['contest_problems']['Row'];
type Contest = Database['public']['Tables']['contests']['Row'];
// Define the shape for our new prop
type LastSubmission = {
  code: string | null;
  language: string | null;
} | null;

interface ProblemWorkspaceProps {
  problem: Problem;
  contestId: Contest['id'];
  contestEndTime: Contest['end_time'];
  lastSubmission: LastSubmission; // The new prop
}

function SubmitButton({ isContestOver }: { isContestOver: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={isContestOver || pending}
      className="px-6 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
    >
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

export default function ProblemWorkspace({ problem, contestId, contestEndTime, lastSubmission }: ProblemWorkspaceProps) {
  // --- THIS IS THE KEY CHANGE ---
  // Use the last submission data for the initial state, or fallback to defaults.
  const [code, setCode] = useState(lastSubmission?.code || '');
  const [language, setLanguage] = useState(lastSubmission?.language || 'python');
  
  const initialState = { verdict: '', error: null };
  const [state, dispatch] = useFormState(submitCode, initialState);
  
  const [isContestOver, setIsContestOver] = useState(new Date() > new Date(contestEndTime));

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
    <div className="flex-1 flex flex-col h-full bg-gray-900">
      <form action={dispatch} className="flex-1 flex flex-col">
        <input type="hidden" name="code" value={code} />
        <input type="hidden" name="language" value={language} />
        <input type="hidden" name="problemId" value={problem.id} />
        <input type="hidden" name="contestId" value={contestId} />

        <div className="flex-shrink-0 bg-gray-800 p-2 flex items-center justify-between">
          <div className="flex items-center">
            <label htmlFor="language-select" className="text-sm text-gray-400 mr-2">Language:</label>
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 text-white text-sm rounded-md p-1 focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isContestOver}
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="c">C</option>
            </select>
          </div>
        </div>
        
        <div className="flex-grow relative">
          {isContestOver && (
            <div className="absolute inset-0 bg-gray-900/50 z-10 flex items-center justify-center">
              <p className="text-2xl font-bold text-red-500">Contest Has Ended</p>
            </div>
          )}
          <AceEditor
            mode={getEditorMode(language)}
            theme="github_dark"
            onChange={(newCode) => setCode(newCode)}
            value={code}
            name="code-editor"
            readOnly={isContestOver}
            fontSize={16}
            width="100%"
            height="100%"
            setOptions={{ enableBasicAutocompletion: true, enableLiveAutocompletion: true }}
            className="absolute top-0 left-0"
          />
        </div>
        
        <div className="flex-shrink-0 bg-gray-800 p-3 flex items-center justify-between">
          <div className="text-sm font-mono">
            <span className="text-gray-400">Verdict: </span>
            <span className="font-semibold text-white">{state.verdict || 'Not Submitted'}</span>
            {state.error && <span className="ml-4 text-red-400">{state.error}</span>}
          </div>
          <SubmitButton isContestOver={isContestOver} />
        </div>
      </form>
    </div>
  );
}