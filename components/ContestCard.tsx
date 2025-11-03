'use client';
import { Contest } from '@/types';

const statusStyles = {
  active: 'bg-arena-mint/20 text-arena-mint',
  upcoming: 'bg-arena-blue/20 text-arena-blue',
  finished: 'bg-arena-pink/20 text-arena-pink',
};

export default function ContestCard({ contest }: { contest: Contest }) {
  return (
    <div className="bg-card-bg rounded-xl p-6 border border-border-color hover:border-arena-pink hover:-translate-y-1.5 transition-all duration-300 shadow-lg shadow-black/20">
      <h3 className="text-arena-blue text-xl font-semibold mb-3">{contest.title}</h3>
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ${statusStyles[contest.status]}`}>
        {contest.status}
      </span>
      <p className="text-gray-400 mb-4 text-sm min-h-[60px]">{contest.description}</p>
      <div className="text-gray-300 text-sm space-y-1 mb-4">
        {contest.duration && <p><strong>Duration:</strong> {contest.duration}</p>}
        {contest.participants && <p><strong>Participants:</strong> {contest.participants.toLocaleString()}</p>}
        {contest.startsIn && <p><strong>Starts in:</strong> {contest.startsIn}</p>}
        {contest.difficulty && <p><strong>Difficulty:</strong> {contest.difficulty}</p>}
        {contest.winner && <p><strong>Winner:</strong> {contest.winner}</p>}
      </div>
      <button className={`mt-4 w-full px-6 py-2.5 rounded-md font-semibold transition-all text-sm ${
          contest.status === 'active'
            ? 'bg-gradient-to-r from-arena-pink to-arena-purple text-dark-bg hover:shadow-lg hover:shadow-arena-pink/40'
            : 'bg-border-color text-gray-200 hover:bg-gray-600'
        }`}
      >
        {contest.status === 'active' ? 'Join Contest' : contest.status === 'upcoming' ? 'Remind Me' : 'View Results'}
      </button>
    </div>
  );
}