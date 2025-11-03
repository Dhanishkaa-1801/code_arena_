'use client';
import { Problem, Difficulty } from '@/types';

interface ProblemSidebarProps {
  problems: Problem[];
  selectedProblemId: string;
  onSelectProblem: (id: string) => void;
}

const difficultyStyles: Record<Difficulty, string> = {
  easy: 'bg-arena-mint/20 text-arena-mint',
  medium: 'bg-orange-400/20 text-orange-400',
  hard: 'bg-red-500/20 text-red-500',
};

export default function ProblemSidebar({ problems, selectedProblemId, onSelectProblem }: ProblemSidebarProps) {
  return (
    <aside className="bg-card-bg rounded-xl p-5 border border-border-color h-fit lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto">
      <h2 className="mb-5 pb-2 border-b-2 border-arena-pink text-xl font-semibold">Problems</h2>
      <div className="space-y-2">
        {problems.map((problem) => (
          <div key={problem.id} onClick={() => onSelectProblem(problem.id)}
            className={`p-3 rounded-lg cursor-pointer transition-all border ${
              selectedProblemId === problem.id
                ? 'bg-gradient-to-r from-arena-pink/15 to-arena-blue/15 border-arena-blue'
                : 'border-transparent hover:bg-white/5 hover:border-arena-pink'
            }`}
          >
            <div className="flex items-center gap-3 mb-1.5">
              <span className="bg-arena-blue text-dark-bg px-2 py-0.5 rounded-full text-xs font-bold">{problem.number}</span>
              <h3 className="text-sm font-medium text-gray-100">{problem.title}</h3>
            </div>
            <div className="flex items-center gap-3 pl-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyStyles[problem.difficulty]}`}>
                {problem.difficulty}
              </span>
              <span className="text-gray-400 text-xs">{problem.acceptance} Acceptance</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}