'use client';

import { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import { useFormState, useFormStatus } from 'react-dom';
import { submitPracticeCode } from '@/app/actions/submissions';
import WorkspaceTabs from './WorkspaceTabs';
import { type SubmissionState } from '@/app/actions/submissions';

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
  initialLanguage,
}: PracticeWorkspaceProps) {
  // Initialize from server-provided last submission
  const [code, setCode] = useState(initialCode ?? '');
  const [language, setLanguage] = useState<'python' | 'cpp' | 'java' | 'c'>(
    (initialLanguage ?? 'python') as any
  );

  const [submissionState, submitAction] = useFormState<SubmissionState, FormData>(
    submitPracticeCode,
    { verdict: '', error: null }
  );

  // IMPORTANT: keep local state in sync when server props change
  useEffect(() => {
    setCode(initialCode ?? '');
    setLanguage((initialLanguage ?? 'python') as any);
  }, [initialCode, initialLanguage, problemId]);

  const getEditorMode = (lang: string) => {
    if (lang === 'c' || lang === 'cpp') return 'c_cpp';
    return lang;
  };

  return (
    <div className="relative flex flex-col h-full bg-dark-bg">
      {/* Language Selector */}
      <div className="flex-shrink-0 bg-card-bg p-2 flex items-center justify-end border-b border-border-color">
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
          onChange={setCode}
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

      {/* Tabs for Run/Result */}
      <div className="flex-shrink-0 h-2/5 border-t-2 border-arena-blue">
        <WorkspaceTabs submissionResult={submissionState} code={code} language={language} />
      </div>

      {/* Submit Button */}
      <div className="flex-shrink-0 bg-card-bg p-3 border-t border-border-color">
        <form action={submitAction}>
          <input type="hidden" name="code" value={code} />
          <input type="hidden" name="language" value={language} />
          <input type="hidden" name="problemId" value={problemId} />
          <SubmitButton />
        </form>
      </div>
    </div>
  );
}