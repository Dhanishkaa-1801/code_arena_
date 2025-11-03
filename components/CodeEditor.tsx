'use client';
import { useState, useEffect, useRef } from 'react';
import { Language, TestCase } from '@/types';
import LeaderboardModal from './LeaderboardModal';

const sampleCodes: Record<Language, string> = {
  python: 'def solve():\n    # Your code here\n    pass',
  javascript: 'function solve() {\n    // Your code here\n}',
  c: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}',
  cpp: '#include <iostream>\n\nint main() {\n    // Your code here\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}',
};

export default function CodeEditor() {
  const [language, setLanguage] = useState<Language>('python');
  const [code, setCode] = useState(sampleCodes.python);
  const [typingTime, setTypingTime] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);
  const [testResults, setTestResults] = useState<TestCase[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setCode(sampleCodes[language]); }, [language]);

  useEffect(() => {
    if (isTyping) {
      const startTime = Date.now();
      typingTimerRef.current = setInterval(() => {
        setTypingTime((Date.now() - startTime) / 1000);
      }, 100);
    } else if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }
    return () => { if (typingTimerRef.current) clearInterval(typingTimerRef.current); };
  }, [isTyping]);

  const runTests = async () => {
    setIsTyping(false);
    setIsRunning(true);
    setTestResults(null);
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setExecutionTime((Date.now() - startTime) / 1000);

    const mockResults: TestCase[] = [
      { input: '2 3', expected: 'Sum = 5', output: 'Sum = 5', passed: true },
      { input: '10 20', expected: 'Sum = 30', output: 'Sum = 30', passed: true },
    ];
    setTestResults(mockResults);
    setIsRunning(false);
  };

  const submitSolution = async () => {
    alert('Solution Submitted Successfully! 🎉');
  };

  return (
    <>
      <div className="mt-6">
        <div className="flex justify-between items-center mb-3">
          <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-dark-bg text-gray-100 border border-border-color px-3 py-2 rounded-md cursor-pointer text-sm focus:outline-none focus:border-arena-blue">
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
          <div className="text-gray-400 text-sm font-mono">Typing: {typingTime.toFixed(2)}s</div>
        </div>

        <textarea value={code}
          onChange={(e) => setCode(e.target.value)}
          onFocus={() => setIsTyping(true)}
          className="w-full h-64 bg-dark-bg text-gray-100 border border-border-color rounded-md p-4 font-mono text-sm resize-y focus:outline-none focus:border-arena-blue mb-3"
          placeholder="Write your solution here..." />

        <div className="flex gap-3 mb-6">
          <button onClick={runTests} disabled={isRunning} className="px-6 py-2 bg-gradient-to-r from-arena-pink to-arena-purple text-dark-bg rounded-md font-semibold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-pink/30 transition-all disabled:opacity-50 text-sm flex items-center gap-2">
            <i className="fas fa-play"></i> Run Code
          </button>
          <button onClick={() => setCode(sampleCodes[language])} className="px-6 py-2 bg-card-bg text-gray-100 border border-border-color rounded-md font-semibold hover:bg-border-color transition-all text-sm flex items-center gap-2">
            <i className="fas fa-code"></i> Sample Code
          </button>
        </div>

        <div className="bg-dark-bg p-5 rounded-md border border-border-color mb-4">
          <h3 className="text-arena-blue text-lg font-semibold mb-3">Test Results</h3>
          {!testResults && !isRunning && <p className="text-gray-400 text-sm">No tests run yet. Click "Run Code" to test your solution.</p>}
          {isRunning && <p className="text-gray-400 text-sm">Running tests...</p>}
          {testResults && (
            <div className="space-y-2">
              {testResults.map((test, index) => (
                <div key={index} className={`p-3 rounded-md border-l-4 text-sm ${test.passed ? 'bg-arena-mint/10 border-arena-mint' : 'bg-arena-pink/10 border-arena-pink'}`}>
                  <strong>Test {index + 1}:</strong> {test.passed ? '✓ Passed' : '✗ Failed'}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 pt-3 border-t border-border-color text-gray-400 font-mono text-sm">Execution: {executionTime.toFixed(2)}s</div>
        </div>

        <div className="p-4 bg-arena-blue/10 rounded-md border-l-4 border-arena-blue text-center mb-4">
          <p className="mb-2 text-gray-200">Ready to submit your solution?</p>
          <button onClick={submitSolution} className="px-6 py-2 bg-gradient-to-r from-arena-pink to-arena-purple text-dark-bg rounded-md font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all text-sm flex items-center gap-2 mx-auto">
            <i className="fas fa-paper-plane"></i> Submit Solution
          </button>
        </div>

        <div className="text-right mt-4">
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-2 bg-gradient-to-r from-arena-blue to-arena-mint text-dark-bg rounded-md font-semibold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-blue/30 transition-all text-sm flex items-center gap-2 ml-auto">
            <i className="fas fa-trophy"></i> View Leaderboard
          </button>
        </div>
      </div>
      <LeaderboardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}