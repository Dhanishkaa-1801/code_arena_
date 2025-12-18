'use client';

import { useTransition } from 'react';

type ContestData = {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
};

export function HostContestForm({
  action,
}: {
  action: (data: ContestData) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const startTimeLocal = formData.get('startTime') as string;
    const endTimeLocal = formData.get('endTime') as string;

    // Basic presence check
    if (!name || !startTimeLocal || !endTimeLocal) {
      alert('Please fill in all required fields.');
      return;
    }

    // Parse as local Date/time (what <input type="datetime-local"> gives)
    const startMs = Date.parse(startTimeLocal);
    const endMs = Date.parse(endTimeLocal);

    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      alert('Please enter valid start and end times.');
      return;
    }

    // 1. End must be strictly after start
    if (endMs <= startMs) {
      alert('End time must be after the start time.');
      return;
    }

    // 2. End must be in the future (otherwise contest is immediately finished)
    if (endMs <= Date.now()) {
      alert('End time must be in the future.');
      return;
    }

    // Convert to UTC before sending to the server
    const startTimeUTC = new Date(startMs).toISOString();
    const endTimeUTC = new Date(endMs).toISOString();

    startTransition(async () => {
      await action({
        name,
        description,
        startTime: startTimeUTC,
        endTime: endTimeUTC,
      });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-300"
        >
          Contest Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-3 text-white focus:ring-arena-pink focus:border-arena-pink"
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-300"
        >
          Description (Optional)
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-3 text-white focus:ring-arena-pink focus:border-arena-pink"
        ></textarea>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-300"
          >
            Start Time
          </label>
          <input
            type="datetime-local"
            name="startTime"
            id="startTime"
            required
            className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-3 text-gray-300 appearance-none"
          />
        </div>
        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-300"
          >
            End Time
          </label>
          <input
            type="datetime-local"
            name="endTime"
            id="endTime"
            required
            className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-3 text-gray-300 appearance-none"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 px-4 bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg font-bold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? 'Creating...' : 'Create Contest'}
      </button>
    </form>
  );
}