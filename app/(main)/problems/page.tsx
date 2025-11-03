'use client';
import { useState } from 'react';
import ProblemSidebar from '@/components/ProblemSidebar';
import ProblemContent from '@/components/ProblemContent';
import CodeEditor from '@/components/CodeEditor';
import { PROBLEMS } from '@/data/mockData';

export default function ProblemsPage() {
  const [selectedProblemId, setSelectedProblemId] = useState(PROBLEMS[0].id);
  const selectedProblem = PROBLEMS.find((p) => p.id === selectedProblemId) || PROBLEMS[0];

  return (
    <div className="animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
        <ProblemSidebar problems={PROBLEMS} selectedProblemId={selectedProblemId} onSelectProblem={setSelectedProblemId} />
        <div className="bg-card-bg rounded-xl p-6 border border-border-color min-h-[calc(100vh-200px)]">
          <ProblemContent problem={selectedProblem} />
          <CodeEditor />
        </div>
      </div>
    </div>
  );
}