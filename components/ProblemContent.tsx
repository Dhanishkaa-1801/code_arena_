'use client';
import { Problem, Difficulty } from '@/types';

interface ProblemContentProps {
  problem: Problem;
}

const difficultyStyles: Record<Difficulty, string> = {
  easy: 'bg-arena-mint/20 text-arena-mint',
  medium: 'bg-orange-400/20 text-orange-400',
  hard: 'bg-red-500/20 text-red-500',
};

export default function ProblemContent({ problem }: ProblemContentProps) {
  return (
    <div className="mb-8">
      <div className="mb-6 pb-3 border-b-2 border-border-color">
        <h2 className="text-2xl font-semibold mb-2">{problem.number}. {problem.title}</h2>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${difficultyStyles[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
          <span className="text-gray-400 text-sm">{problem.acceptance} Acceptance</span>
        </div>
      </div>
      <div className="space-y-6 text-sm leading-relaxed">
        <div>
          <h3 className="text-arena-blue text-lg font-semibold mb-2">Problem Description</h3>
          <p className="text-gray-300">{problem.description}</p>
        </div>
        <div>
          <h3 className="text-arena-blue text-lg font-semibold mb-2">Input Format</h3>
          <p className="text-gray-300">{problem.inputFormat}</p>
        </div>
        <div>
          <h3 className="text-arena-blue text-lg font-semibold mb-2">Output Format</h3>
          <p className="text-gray-300">{problem.outputFormat}</p>
        </div>
        <div>
          <h3 className="text-arena-blue text-lg font-semibold mb-2">Sample Input</h3>
          <pre className="bg-dark-bg p-3 rounded-md border-l-4 border-arena-pink text-gray-200">{problem.sampleInput}</pre>
        </div>
        <div>
          <h3 className="text-arena-blue text-lg font-semibold mb-2">Sample Output</h3>
          <pre className="bg-dark-bg p-3 rounded-md border-l-4 border-arena-pink text-gray-200">{problem.sampleOutput}</pre>
        </div>
      </div>
    </div>
  );
}