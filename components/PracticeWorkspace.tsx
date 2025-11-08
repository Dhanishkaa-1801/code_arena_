'use client';

import { useState } from 'react';
import AceEditor from 'react-ace';
import { useFormState, useFormStatus } from 'react-dom';
import { submitPracticeCode } from '@/app/actions/submissions'; // <-- Uses the NEW action
import WorkspaceTabs from './WorkspaceTabs'; // We can reuse this if it's simple enough
import { type SubmissionState } from '@/app/actions/submissions';

// Import editor modes and themes
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/theme-github_dark';

interface PracticeWorkspaceProps {
  problemId: number;
  initialCode: string | null;
  initialLanguage: string | null;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-6 py-2 bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg font-bold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  );
}

export default function PracticeWorkspace({ 
  problemId, 
  initialCode, 
  initialLanguage 
}: PracticeWorkspaceProps) {
  
  const [code, setCode] = useState(initialCode || '');
  const [language, setLanguage] = useState(initialLanguage || 'python');
  const [submissionState, submitAction] = useFormState(submitPracticeCode, { verdict: '', error: null });
  
  const getEditorMode = (lang: string) => {
    if (lang === 'c' || lang === 'cpp') return 'c_cpp';
    return lang;
  };

  return (
    // This layout is guaranteed to work.
    <div className="relative flex flex-col h-full bg-dark-bg">
      {/* 1. Language Selector (Fixed Height) */}
      <div className="flex-shrink-0 bg-card-bg p-2 flex items-center justify-end border-b border-border-color">
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-700 text-white text-sm rounded-md p-1"
        >
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="c">C</option>
        </select>
      </div>

      {/* 2. Editor (Grows to fill available space) */}
      <div className="flex-grow relative min-h-0">
        <AceEditor
          mode={getEditorMode(language)}
          theme="github_dark"
          onChange={setCode}
          value={code}
          name="code-editor"
          fontSize={16}
          width="100%"
          height="100%"
          setOptions={{ enableBasicAutocompletion: true, enableLiveAutocompletion: true, showPrintMargin: false }}
          className="absolute top-0 left-0"
        />
      </div>
      
      {/* 3. Tabs for Run/Result (Fixed Height) */}
      <div className="flex-shrink-0 h-2/5 border-t-2 border-arena-blue">
        <WorkspaceTabs 
          submissionResult={submissionState}
          code={code}
          language={language}
        />
      </div>

      {/* 4. Final Submit Button Bar (Fixed Height) */}
      <div className="flex-shrink-0 bg-card-bg p-3 border-t border-border-color">
        <form action={submitAction}>
          <input type="hidden" name="code" value={code} />
          <input type="hidden" name="language" value={language} />
          <input type="hidden" name="problemId" value={problemId} />
          {/* No contestId is needed here */}
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}