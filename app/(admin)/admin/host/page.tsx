import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { HostContestForm } from './HostContestForm';

// Keep stream type local to this file
type Stream = '1' | '2' | '3' | 'all';

export default function HostContestPage() {
  // The server action now accepts the data directly as an object, with stream
  const createContest = async (contestData: {
    name: string;
    description: string;
    startTime: string; // UTC string
    endTime: string;   // UTC string
    stream: Stream;
  }) => {
    'use server';

    const { name, description, startTime, endTime, stream } = contestData;

    if (!name || !startTime || !endTime || !stream) {
      return redirect('/admin/host?error=Missing required fields');
    }

    const supabase = createClient();
    const { error } = await supabase.from('contests').insert({
      name,
      description,
      start_time: startTime,
      end_time: endTime,
      stream, // 🔁 NEW FIELD
    });

    if (error) {
      console.error(error);
      return redirect('/admin/host?error=Failed to create contest');
    }

    revalidatePath('/admin/contests');
    redirect('/admin/contests');
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Host a New Contest</h2>

      <div className="max-w-2xl mx-auto">
        <div className="bg-card-bg p-8 rounded-lg border border-border-color">
          <h3 className="text-xl font-semibold mb-6 text-arena-mint">
            Contest Details
          </h3>
          {/* The form now passes the updated server action */}
          <HostContestForm action={createContest} />
        </div>
      </div>
    </div>
  );
}