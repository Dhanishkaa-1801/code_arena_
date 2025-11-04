'use client';

import { useState, useTransition } from 'react';

// Define the shape of the data the server action expects
type ContestData = {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
};

// The component's `action` prop now expects a function with the new shape
export function HostContestForm({ action }: { action: (data: ContestData) => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const startTimeLocal = formData.get('startTime') as string;
    const endTimeLocal = formData.get('endTime') as string;

    // This is the most important part: convert to UTC before sending
    const startTimeUTC = new Date(startTimeLocal).toISOString();
    const endTimeUTC = new Date(endTimeLocal).toISOString();

    startTransition(async () => {
      // Call the action with a clean, prepared object
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Contest Name</label>
        <input type="text" name="name" id="name" required className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-3 text-white focus:ring-arena-pink focus:border-arena-pink" />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description (Optional)</label>
        <textarea name="description" id="description" rows={4} className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-3 text-white focus:ring-arena-pink focus:border-arena-pink"></textarea>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-300">Start Time</label>
            <input type="datetime-local" name="startTime" id="startTime" required className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-3 text-gray-300 appearance-none" />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-300">End Time</label>
            <input type="datetime-local" name="endTime" id="endTime" required className="mt-1 w-full bg-dark-bg border border-border-color rounded-md p-3 text-gray-300 appearance-none" />
          </div>
      </div>
      <button type="submit" disabled={isPending} className="w-full py-3 px-4 bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg font-bold rounded-md hover:opacity-90 transition-opacity disabled:opacity-50">
        {isPending ? 'Creating...' : 'Create Contest'}
      </button>
    </form>
  );
}