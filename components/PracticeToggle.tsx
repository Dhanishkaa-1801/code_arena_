'use client';

import { useTransition } from 'react';
import { togglePracticeStatus } from '@/app/(admin)/admin/actions';

interface PracticeToggleProps {
  problemId: number;
  contestId: string;
  isAvailable: boolean;
}

export function PracticeToggle({ problemId, contestId, isAvailable }: PracticeToggleProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await togglePracticeStatus(problemId, !isAvailable, contestId);
    });
  };

  const baseClasses = "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-arena-blue focus:ring-offset-2 focus:ring-offset-dark-bg disabled:cursor-not-allowed disabled:opacity-50";
  const enabledClasses = "bg-arena-mint";
  const disabledClasses = "bg-gray-600";

  const knobBaseClasses = "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out";
  const knobEnabledClasses = "translate-x-5";
  const knobDisabledClasses = "translate-x-0";

  return (
    <div className="flex items-center space-x-3">
      <span className={`text-sm font-medium transition-colors ${isAvailable ? 'text-arena-mint' : 'text-gray-400'}`}>
        Publish to Practice Zone
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isAvailable}
        disabled={isPending}
        onClick={handleToggle}
        className={`${baseClasses} ${isAvailable ? enabledClasses : disabledClasses}`}
      >
        <span
          aria-hidden="true"
          className={`${knobBaseClasses} ${isAvailable ? knobEnabledClasses : knobDisabledClasses}`}
        />
      </button>
    </div>
  );
}