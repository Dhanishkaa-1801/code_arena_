import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { HostContestForm } from './HostContestForm';

export default function HostContestPage() {
  
  // UPDATED: The server action now accepts the data directly as an object.
  const createContest = async (contestData: {
    name: string;
    description: string;
    startTime: string; // This will be the correct UTC string
    endTime: string;   // This will be the correct UTC string
  }) => {
    'use server';

    const { name, description, startTime, endTime } = contestData;
    
    // You can add a log here to see the correct UTC time arriving
    // console.log("SERVER RECEIVED UTC:", { startTime, endTime });

    if (!name || !startTime || !endTime) {
      // This check is still good to have.
      return redirect('/admin/host?error=Missing required fields');
    }

    const supabase = createClient();
    const { error } = await supabase.from('contests').insert({
      name,
      description,
      start_time: startTime,
      end_time: endTime,
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
          <h3 className="text-xl font-semibold mb-6 text-arena-mint">Contest Details</h3>
          {/* The form now passes the updated server action */}
          <HostContestForm action={createContest} />
        </div>
      </div>
    </div>
  );
}