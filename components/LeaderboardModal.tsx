'use client';
import { LEADERBOARD_ENTRIES } from '@/data/mockData';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div onClick={(e) => e.stopPropagation()} className="bg-card-bg rounded-xl p-6 w-full max-w-4xl border-2 border-arena-blue shadow-2xl shadow-arena-blue/20">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-border-color">
          <h3 className="text-arena-blue text-xl font-semibold">Leaderboard - Sum of Two Numbers</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-arena-pink text-2xl transition-colors">&times;</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-arena-blue/10">
                {['Rank', 'Name', 'Roll No', 'Year', 'Department', 'Time Taken', 'Execution Time'].map(header => (
                  <th key={header} className="p-3 text-left text-arena-blue font-semibold text-sm border-b border-border-color">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {LEADERBOARD_ENTRIES.map((entry) => (
                <tr key={entry.rank} className="hover:bg-arena-pink/5 transition-colors">
                  <td className="p-3 text-arena-pink font-bold text-sm border-b border-border-color">{entry.rank}</td>
                  <td className="p-3 text-sm border-b border-border-color">{entry.name}</td>
                  <td className="p-3 text-sm border-b border-border-color">{entry.rollNo}</td>
                  <td className="p-3 text-sm border-b border-border-color">{entry.year}</td>
                  <td className="p-3 text-sm border-b border-border-color">{entry.department}</td>
                  <td className="p-3 text-sm border-b border-border-color">{entry.timeTaken}</td>
                  <td className="p-3 text-sm border-b border-border-color">{entry.executionTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}