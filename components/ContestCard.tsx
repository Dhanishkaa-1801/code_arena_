'use client';

import Link from 'next/link';
import Countdown from './Countdown';
import { Database } from '@/types_db';

type Contest = Database['public']['Tables']['contests']['Row'] & {
  status: 'Upcoming' | 'Active' | 'Finished';
};

const StatusBadge = ({ status }: { status: Contest['status'] }) => {
  const statusStyles = {
    Upcoming: 'bg-blue-500/20 text-blue-300',
    Active: 'bg-green-500/20 text-green-300 animate-pulse',
    Finished: 'bg-gray-500/20 text-gray-400',
  };
  return (
    <span
      className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
};

// Map DB stream value -> nice label + pill styles
function getStreamStyles(
  rawStream: string | null
): { label: string; className: string } {
  const base =
    'inline-flex items-center px-2.5 py-0.5 rounded-full border text-[11px] font-semibold';

  const stream =
    rawStream === '1' || rawStream === '2' || rawStream === '3' || rawStream === 'all'
      ? rawStream
      : 'all';

  if (stream === '1') {
    return {
      label: 'Stream 1',
      className:
        base +
        ' border-sky-500/60 bg-sky-500/10 text-sky-200',
    };
  }
  if (stream === '2') {
    return {
      label: 'Stream 2',
      className:
        base +
        ' border-emerald-500/60 bg-emerald-500/10 text-emerald-200',
    };
  }
  if (stream === '3') {
    return {
      label: 'Stream 3',
      className:
        base +
        ' border-orange-500/60 bg-orange-500/10 text-orange-200',
    };
  }

  // 'all' or anything unexpected
  return {
    label: 'Stream All',
    className:
      base +
      ' border-gray-500/60 bg-gray-800/40 text-gray-200',
  };
}

export default function ContestCard({ contest }: { contest: Contest }) {
  const renderAction = () => {
    switch (contest.status) {
      case 'Upcoming':
        return <Countdown endTime={contest.start_time} />;

      case 'Active':
        return (
          <Link
            href={`/contests/${contest.id}`}
            className="w-full text-center py-3 px-4 bg-gradient-to-r from-arena-green to-arena-mint text-dark-bg font-bold rounded-md hover:opacity-90 transition-opacity"
          >
            Active Now
          </Link>
        );

      case 'Finished':
        return (
          <Link
            href={`/contests/${contest.id}`}
            className="w-full text-center py-3 px-4 bg-card-bg border border-border-color font-semibold rounded-md hover:bg-slate-700 transition-colors"
          >
            View Results
          </Link>
        );

      default:
        return null;
    }
  };

  const { label: streamLabel, className: streamClass } = getStreamStyles(
    (contest as any).stream ?? null
  );

  return (
    <div className="bg-card-bg border border-border-color rounded-xl p-6 flex flex-col relative hover:border-arena-pink/60 hover:bg-slate-900/60 transition-transform transition-colors duration-300 shadow-lg shadow-black/20 hover:-translate-y-1">
      <StatusBadge status={contest.status} />

      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-100 mt-4 mb-2">
          {contest.name}
        </h3>

        {/* Stream row */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span className="uppercase tracking-wide text-[10px] text-gray-500">
            Stream
          </span>
          <span className={streamClass}>{streamLabel}</span>
        </div>

        <p className="text-sm text-gray-400 line-clamp-3 min-h-[60px]">
          {contest.description || 'No description provided for this contest.'}
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-border-color flex items-center justify-center">
        {renderAction()}
      </div>
    </div>
  );
}