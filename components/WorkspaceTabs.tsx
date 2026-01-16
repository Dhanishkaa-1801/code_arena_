'use client';

import { useState, useTransition, useEffect } from 'react';
import { runCode } from '@/app/actions/submissions';
import { incrementRunCount } from '@/app/actions/proctor';
import { type SubmissionState, type RunCodeState } from '@/app/actions/submissions';

const TABS = ['Testcase', 'Result'] as const;
type Tab = (typeof TABS)[number];

interface WorkspaceTabsProps {
  submissionResult: SubmissionState;
  code: string;
  language: string;
  contestId?: number;
}

export default function WorkspaceTabs({
  submissionResult,
  code,
  language,
  contestId,
}: WorkspaceTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Testcase');
  const [customInput, setCustomInput] = useState('');
  const [runResult, setRunResult] = useState<RunCodeState | null>(null);
  const [isRunning, startTransition] = useTransition();

  // Auto-switch to Result tab when a verdict / error arrives from submitCode
  useEffect(() => {
    if (submissionResult?.verdict || submissionResult?.error) {
      setActiveTab('Result');
    }
  }, [submissionResult]);

  const handleRunCode = () => {
    startTransition(async () => {
      // Log run count (for leaderboard analytics)
      if (contestId) {
        try {
          await incrementRunCount(contestId);
        } catch (e) {
          console.error('Failed to increment run count', e);
        }
      }

      const result = await runCode({
        code,
        language,
        input: customInput,
      });
      setRunResult(result);
    });
  };

  return (
    <div className="flex flex-col h-full bg-dark-bg text-sm">
      {/* Tab Headers */}
      <div className="flex-shrink-0 border-b border-border-color flex bg-card-bg">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'text-white border-b-2 border-arena-pink bg-white/5'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-grow flex flex-col min-h-0 relative">
        {/* === TESTCASE TAB (Run Code) === */}
        {activeTab === 'Testcase' && (
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {/* Input Area */}
              <div>
                <label
                  htmlFor="custom-input"
                  className="text-gray-400 mb-1 block text-xs uppercase tracking-wide"
                >
                  Custom Input
                </label>
                <textarea
                  id="custom-input"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter input here..."
                  className="w-full h-24 bg-black/30 border border-border-color rounded p-3 text-white font-mono resize-none focus:border-arena-pink focus:outline-none transition-colors"
                />
              </div>

              {/* Output Display */}
              {runResult && (
                <div className="animate-fadeIn">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-gray-400 text-xs uppercase tracking-wide">
                      Output
                    </label>
                    <span
                      className={`text-xs font-bold ${
                        runResult.verdict === 'Accepted'
                          ? 'text-green-400'
                          : 'text-red-400'
                      }`}
                    >
                      {runResult.verdict === 'Accepted'
                        ? 'Execution Finished'
                        : runResult.verdict}
                    </span>
                  </div>

                  {runResult.stdout && (
                    <div className="w-full bg-black/30 border border-border-color rounded p-3 mb-2">
                      <pre className="text-white font-mono whitespace-pre-wrap text-sm">
                        {runResult.stdout}
                      </pre>
                    </div>
                  )}

                  {runResult.error && (
                    <div className="w-full bg-red-900/20 border border-red-500/30 rounded p-3">
                      <pre className="text-red-300 font-mono whitespace-pre-wrap text-xs">
                        {runResult.error}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Run Button Footer */}
            <div className="flex-shrink-0 p-3 border-t border-border-color flex justify-end bg-card-bg/50">
              <button
                onClick={handleRunCode}
                disabled={isRunning || !code.trim()}
                className="px-5 py-2 bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg font-bold rounded hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-arena-pink/20"
              >
                {isRunning ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
                    Running...
                  </span>
                ) : (
                  'Run Code'
                )}
              </button>
            </div>
          </div>
        )}

        {/* === RESULT TAB (Submit Result) === */}
        {activeTab === 'Result' && (
          <div className="flex-grow overflow-y-auto p-6 bg-dark-bg">
            {submissionResult.verdict || submissionResult.error ? (
              <div className="animate-slideUp">
                {submissionResult.verdict === 'Accepted' ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-4 mt-8">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-3xl mb-2">
                      ✓
                    </div>
                    <h2 className="text-2xl font-bold text-white">Problem Solved!</h2>
                    <p className="text-gray-400 max-w-sm">
                      Congratulations! Your solution passed all test cases.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-red-500 mb-4">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-lg font-bold">
                        ✕
                      </div>
                      <h2 className="text-xl font-bold">
                        {submissionResult.verdict || 'Error'}
                      </h2>
                    </div>

                    {submissionResult.error && (
                      <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 font-mono text-sm text-red-200 whitespace-pre-wrap overflow-x-auto">
                        {submissionResult.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="H-full flex flex-col items-center justify-center text-gray-500 space-y-3">
                <div className="text-4xl opacity-20">⚖️</div>
                <p>Submit your code to see the official verdict.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}