'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export type PracticeProblem = {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Solved' | 'Attempted' | 'Not Attempted';
  source: 'Contest' | 'Collection';
  stream: '1' | '2' | '3' | 'all';
};

export default function PracticeProblemTable({ problems }: { problems: PracticeProblem[] }) {
  const router = useRouter();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] =
    useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [statusFilter, setStatusFilter] =
    useState<'All' | 'Solved' | 'Unattempted'>('All');
  const [sourceFilter, setSourceFilter] =
    useState<'All' | 'Contest' | 'Collection'>('All');
  const [streamFilter, setStreamFilter] =
    useState<'all' | '1' | '2' | '3'>('all');

  // ⚡ Filter Logic
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch = p.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesDifficulty =
        difficultyFilter === 'All' || p.difficulty === difficultyFilter;

      const matchesSource =
        sourceFilter === 'All' || p.source === sourceFilter;

      // Status Filter
      let matchesStatus = true;
      if (statusFilter === 'Solved') matchesStatus = p.status === 'Solved';
      if (statusFilter === 'Unattempted')
        matchesStatus = p.status === 'Not Attempted';

      // Stream Filter – strict: only exact stream, or all when 'all' selected
      const matchesStream =
        streamFilter === 'all' ? true : p.stream === streamFilter;

      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesStatus &&
        matchesSource &&
        matchesStream
      );
    });
  }, [problems, searchQuery, difficultyFilter, statusFilter, sourceFilter, streamFilter]);

  // Helper for Status Icons
  const renderStatusIcon = (status: string) => {
    if (status === 'Solved')
      return <CheckCircle2 className="w-5 h-5 text-arena-green" />;
    if (status === 'Attempted')
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    return <Circle className="w-5 h-5 text-gray-600" />;
  };

  // Helper for Difficulty Colors
  const renderDifficultyBadge = (diff: string) => {
    const colors = {
      Easy: 'text-arena-green bg-arena-green/10 border-arena-green/20',
      Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      Hard: 'text-red-400 bg-red-400/10 border-red-400/20',
    };
    // @ts-ignore
    const style = colors[diff] || 'text-gray-400';
    return (
      <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${style}`}>
        {diff}
      </span>
    );
  };

  // Helper for Stream Colors + Labels
  const renderStreamBadge = (stream: PracticeProblem['stream']) => {
    const labels: Record<PracticeProblem['stream'], string> = {
      all: 'All',
      '1': 'Stream 1',
      '2': 'Stream 2',
      '3': 'Stream 3',
    };

    const colors: Record<PracticeProblem['stream'], string> = {
      '1': 'bg-sky-900/30 text-sky-300',
      '2': 'bg-emerald-900/30 text-emerald-300',
      '3': 'bg-orange-900/30 text-orange-300',
      all: 'bg-gray-800/40 text-gray-300',
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors[stream]}`}
      >
        {labels[stream]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 🔍 Filter Bar */}
      <div className="bg-card-bg border border-border-color p-4 rounded-lg flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search problems..."
            className="w-full bg-dark-bg border border-border-color rounded-md pl-9 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-arena-blue transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Buttons Group */}
        <div className="flex flex-wrap items-center gap-6 text-sm">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 hidden sm:inline">
              Difficulty:
            </span>
            {['All', 'Easy', 'Medium', 'Hard'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setDifficultyFilter(lvl as any)}
                className={`px-3 py-1 rounded-full transition-all ${
                  difficultyFilter === lvl
                    ? 'bg-arena-blue text-dark-bg font-semibold'
                    : 'bg-dark-bg text-gray-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 hidden sm:inline">Status:</span>
            {['All', 'Solved', 'Unattempted'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st as any)}
                className={`px-3 py-1 rounded-full transition-all ${
                  statusFilter === st
                    ? 'bg-arena-mint text-dark-bg font-semibold'
                    : 'bg-dark-bg text-gray-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* From (Source) Filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 hidden sm:inline">From:</span>
            {['All', 'Contest', 'Collection'].map((src) => (
              <button
                key={src}
                onClick={() => setSourceFilter(src as any)}
                className={`px-3 py-1 rounded-full transition-all ${
                  sourceFilter === src
                    ? 'bg-purple-400 text-dark-bg font-semibold'
                    : 'bg-dark-bg text-gray-400 hover:text-white'
                }`}
              >
                {src}
              </button>
            ))}
          </div>

          {/* Stream Filter */}
          <div className="flex items-center gap-2">
            <span className="text-gray-400 hidden sm:inline">Stream:</span>
            {[
              { label: 'Stream All', value: 'all' },
              { label: 'Stream 1 – AERO / BME / CIVIL / MECH / R&A', value: '1' },
              { label: 'Stream 2 – ECE / EEE / EIE', value: '2' },
              { label: 'Stream 3 – CSE / IT / AI&DS / M.Tech', value: '3' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStreamFilter(opt.value as any)}
                className={`px-3 py-1 rounded-full transition-all ${
                  streamFilter === opt.value
                    ? 'bg-sky-500 text-dark-bg font-semibold'
                    : 'bg-dark-bg text-gray-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📋 Results Table */}
      <div className="bg-card-bg border border-border-color rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-dark-bg border-b border-border-color text-xs uppercase text-gray-400 font-semibold tracking-wider">
              <th className="px-6 py-4 w-16 text-center">No.</th>
              <th className="px-6 py-4 w-16 text-center">Status</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4 text-right">Difficulty</th>
              <th className="px-6 py-4 text-center">From</th>
              <th className="px-6 py-4 text-center">Stream</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem, idx) => (
                <tr
                  key={problem.id}
                  onClick={() => router.push(`/problems/${problem.id}`)}
                  className="hover:bg-dark-bg/50 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4 text-center text-gray-500 font-mono text-sm">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4 flex justify-center">
                    {renderStatusIcon(problem.status)}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-200 group-hover:text-arena-blue transition-colors">
                    {problem.title}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {renderDifficultyBadge(problem.difficulty)}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        problem.source === 'Contest'
                          ? 'bg-blue-900/30 text-blue-300'
                          : 'bg-purple-900/30 text-purple-300'
                      }`}
                    >
                      {problem.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-400">
                    {renderStreamBadge(problem.stream)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No problems match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}