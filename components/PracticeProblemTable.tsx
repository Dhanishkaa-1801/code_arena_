'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CheckCircle, Edit3, Circle, Search, X } from 'lucide-react';

export type PracticeProblem = {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Solved' | 'Attempted' | 'Not Attempted';
  source: 'Contest' | 'Collection';
};

interface PracticeProblemTableProps {
  problems: PracticeProblem[];
}

export default function PracticeProblemTable({ problems }: PracticeProblemTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  // --- NEW STATE FOR THE 'FROM' FILTER ---
  const [sourceFilter, setSourceFilter] = useState<string>('All');

  const filteredProblems = useMemo(() => {
    return problems
      .filter(problem => {
        const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = difficultyFilter === 'All' || problem.difficulty === difficultyFilter;
        const matchesStatus = statusFilter === 'All' || problem.status === statusFilter;
        // --- NEW FILTERING CONDITION ---
        const matchesSource = sourceFilter === 'All' || problem.source === sourceFilter;
        
        return matchesSearch && matchesDifficulty && matchesStatus && matchesSource;
      })
      .map((problem, index) => ({
        ...problem,
        serial: index + 1,
      }));
  }, [problems, searchQuery, difficultyFilter, statusFilter, sourceFilter]); // Added sourceFilter to dependency array

  // Helper function for filter buttons
  const FilterButton = ({ label, value, current, setter }: any) => (
    <button
      onClick={() => setter(value)}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
        current === value ? 'bg-arena-blue text-white' : 'bg-card-bg text-gray-400 hover:bg-border-color'
      }`}
    >
      {label}
    </button>
  );

  const getStatusIcon = (status: PracticeProblem['status']) => {
    switch (status) {
      case 'Solved': return <CheckCircle className="text-arena-green" size={20} title="Solved" />;
      case 'Attempted': return <Edit3 className="text-yellow-400" size={20} title="Attempted" />;
      default: return <Circle className="text-gray-600/70" size={20} title="Not Attempted" />;
    }
  };
  
  const getDifficultyClass = (difficulty: PracticeProblem['difficulty']) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'Hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div>
      {/* --- Filter and Search Bar --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-card-bg border border-border-color rounded-lg">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input type="text" placeholder="Search problems..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-dark-bg border border-border-color rounded-md py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-arena-blue focus:outline-none" />
        </div>
        {/* Filter Groups */}
        <div className="flex items-center gap-x-6 gap-y-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-400">Difficulty:</span>
            <FilterButton label="All" value="All" current={difficultyFilter} setter={setDifficultyFilter} />
            <FilterButton label="Easy" value="Easy" current={difficultyFilter} setter={setDifficultyFilter} />
            <FilterButton label="Medium" value="Medium" current={difficultyFilter} setter={setDifficultyFilter} />
            <FilterButton label="Hard" value="Hard" current={difficultyFilter} setter={setDifficultyFilter} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-400">Status:</span>
            <FilterButton label="All" value="All" current={statusFilter} setter={setStatusFilter} />
            <FilterButton label="Solved" value="Solved" current={statusFilter} setter={setStatusFilter} />
            <FilterButton label="Attempted" value="Attempted" current={statusFilter} setter={setStatusFilter} />
          </div>
          {/* --- NEW FILTER GROUP FOR 'FROM' --- */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-400">From:</span>
            <FilterButton label="All" value="All" current={sourceFilter} setter={setSourceFilter} />
            <FilterButton label="Contest" value="Contest" current={sourceFilter} setter={setSourceFilter} />
            <FilterButton label="Collection" value="Collection" current={sourceFilter} setter={setSourceFilter} />
          </div>
        </div>
      </div>

      {/* --- Problems Table (no changes needed here) --- */}
      <div className="bg-card-bg rounded-lg shadow-lg border border-border-color">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-dark-bg">
              <tr>
                <th scope="col" className="px-6 py-4 w-16 text-center">No.</th>
                <th scope="col" className="px-6 py-4 w-20 text-center">Status</th>
                <th scope="col" className="px-6 py-4">Title</th>
                <th scope="col" className="px-6 py-4 w-32">From</th>
                <th scope="col" className="px-6 py-4 w-32 text-right">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.length > 0 ? filteredProblems.map((problem) => (
                <tr key={problem.id} className="border-b border-border-color hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-center text-gray-400 font-medium">{problem.serial}</td>
                  <td className="px-6 py-4 flex justify-center items-center">{getStatusIcon(problem)}</td>
                  <td className="px-6 py-4 font-semibold text-white">
                    <Link href={`/problems/${problem.id}`} className="hover:text-arena-blue hover:underline">{problem.title}</Link>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{problem.source}</td>
                  <td className={`px-6 py-4 font-semibold text-right ${getDifficultyClass(problem.difficulty)}`}>{problem.difficulty}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center p-12 text-gray-500">
                    <div className='flex flex-col items-center gap-2'>
                        <X size={32} />
                        <span>No problems match your current filters.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}