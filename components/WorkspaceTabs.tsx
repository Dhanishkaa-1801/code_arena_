// In: components/WorkspaceTabs.tsx
'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { runCode } from '@/app/actions/submissions';
import { type SubmissionState, type RunCodeState } from '@/app/actions/submissions';

const TABS = ['Testcase', 'Result'];

interface WorkspaceTabsProps {
  submissionResult: SubmissionState;
  code: string;
  language: string;
}

function RunButton() {
    const { pending } = useFormStatus();
    return (
        <button 
            type="submit" 
            disabled={pending}
            className="px-4 py-2 bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg font-bold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
            {pending ? 'Running...' : 'Run Code'}
        </button>
    );
}

export default function WorkspaceTabs({ submissionResult, code, language }: WorkspaceTabsProps) {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [customInput, setCustomInput] = useState('');
  
  const initialState: RunCodeState = { verdict: null, output: null, error: null };
  const [runState, runAction] = useFormState(runCode, initialState);

  // Automatically switch to the Result tab when an official submission completes
  if (submissionResult.verdict && submissionResult.verdict !== 'Processing...' && activeTab !== 'Result') {
    setActiveTab('Result');
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab Headers */}
      <div className="flex-shrink-0 border-b border-border-color">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium ${activeTab === tab ? 'text-white border-b-2 border-arena-pink' : 'text-gray-400 hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Testcase Tab */}
      {activeTab === 'Testcase' && (
        <form action={runAction} className="flex-1 flex flex-col min-h-0 bg-dark-bg">
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            <input type="hidden" name="code" value={code} />
            <input type="hidden" name="language" value={language} />
            
            <div>
              <label htmlFor="custom-input" className="text-gray-300 mb-2 block font-sans">Input</label>
              <textarea
                id="custom-input"
                name="customInput"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter custom input to test your code..."
                className="w-full h-24 bg-card-bg border border-border-color rounded-md p-2 text-white resize-none font-mono"
              />
            </div>
            
            {/* --- FINALIZED DISPLAY LOGIC (v2) --- */}
            {/* This logic now pivots on the verdict, not the error field. */}
            {runState.verdict && (
              <>
                {/* If the verdict is "Accepted", ALWAYS show the success block. */}
                {runState.verdict === 'Accepted' ? (
                  <div>
                    <label className="text-gray-300 mb-2 block font-sans">Output</label>
                    <div className="w-full bg-card-bg border border-border-color rounded-md p-2">
                      <pre className="text-white whitespace-pre-wrap">
                        {runState.output}
                      </pre>
                      <p className="mt-2 text-sm text-arena-green font-semibold font-sans">
                        Execution Finished (Accepted)
                      </p>
                    </div>
                  </div>
                ) : (
                  /* For any other verdict, show the error block. */
                  <div>
                    <label className="text-gray-300 mb-2 block font-sans">Error: <span className="text-red-400">{runState.verdict}</span></label>
                    <pre className="w-full bg-red-900/20 border border-red-500/50 rounded-md p-2 text-red-300 whitespace-pre-wrap">
                      {runState.error}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Bar at the bottom */}
          <div className="flex-shrink-0 p-3 flex justify-end border-t border-border-color">
            <RunButton />
          </div>
        </form>
      )}

      {/* Result Tab (for official submissions) */}
      {activeTab === 'Result' && (
        <div className="flex-grow p-4 overflow-y-auto bg-dark-bg font-mono text-sm">
          {submissionResult.verdict === 'Accepted' ? (
            <div className="text-arena-green">
              <span className="font-bold text-lg">Accepted</span>
              <p className="text-gray-400 text-sm mt-1 font-sans">Your solution passed all hidden test cases.</p>
            </div>
          ) : submissionResult.verdict && submissionResult.verdict !== 'Processing...' ? (
            <div className="text-red-400">
              <span className="font-bold text-lg">{submissionResult.verdict}</span>
              {submissionResult.error && (
                <pre className="mt-4 p-4 bg-card-bg rounded-md text-red-300 whitespace-pre-wrap">{submissionResult.error}</pre>
              )}
            </div>
          ) : (
            <p className="text-gray-500 font-sans">Submit your code to see the official result.</p>
          )}
        </div>
      )}
    </div>
  );
}