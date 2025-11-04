import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function ViewContestsPage() {
  const supabase = createClient();
  const { data: contests, error } = await supabase
    .from('contests')
    .select('*')
    .order('start_time', { ascending: false });

  if (error) {
    console.error("Error fetching contests:", error);
    return <p className="text-red-500">Could not fetch contests.</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">All Contests</h2>
        <Link href="/admin/host" className="py-2 px-4 bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg font-bold rounded-md">
          + Host New Contest
        </Link>
      </div>

      <div className="bg-card-bg border border-border-color rounded-lg">
        <ul className="divide-y divide-border-color">
          {contests.length > 0 ? contests.map(contest => (
            <li key={contest.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center hover:bg-slate-800 transition-colors">
              <div className="mb-2 sm:mb-0">
                <p className="font-bold text-lg text-gray-100">{contest.name}</p>
                <div className="flex space-x-4 text-sm text-gray-400 mt-1">
                  
                  {/* We are reverting back to the simple toLocaleString() method.
                      This will now work correctly because the data being saved to the
                      database is the true UTC timestamp. */}
                  <span>Starts: {new Date(contest.start_time).toLocaleString()}</span>
                  <span>Ends: {new Date(contest.end_time).toLocaleString()}</span>
                  
                </div>
              </div>
              <div className="flex items-center space-x-3">
                 <Link href={`/admin/contests/${contest.id}`} className="text-arena-pink font-semibold hover:underline">
                    Manage Problems
                 </Link>
              </div>
            </li>
          )) : (
            <div className="p-8 text-center text-gray-400">
              <p>No contests have been created yet.</p>
              <Link href="/admin/host" className="mt-4 inline-block text-arena-blue hover:underline">
                Host your first contest!
              </Link>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
}