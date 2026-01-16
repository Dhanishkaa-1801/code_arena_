import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import RealtimeLeaderboard from '@/components/RealtimeLeaderboard';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const contestId = Number(params.id);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from('profiles').select('role').eq('id', user.id).single()
    : { data: null as any };

  const isAdmin = profile?.role === 'admin';

  const { data: contest, error: contestError } = await supabase
    .from('contests')
    .select('id, start_time, end_time, name')
    .eq('id', contestId)
    .single();

  if (contestError || !contest) notFound();

  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select(`
      submitted_at, problem_id, execution_time, memory, user_id, verdict,
      profiles ( id, full_name, roll_no, department, year )
    `)
    .eq('contest_id', contestId)
    .eq('verdict', 'Accepted')
    .gte('submitted_at', contest.start_time)
    .lte('submitted_at', contest.end_time)
    .order('submitted_at', { ascending: true });

  // 🆕 monitoring data used for penalties, switches, runs
  const { data: monitoringData } = await supabase
    .from('contest_monitoring')
    .select('user_id, tab_switches, run_count, first_opened_at')
    .eq('contest_id', contestId);

  if (submissionsError) {
    return (
      <p className="text-center p-20 text-red-500">
        Could not load leaderboard data.
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <RealtimeLeaderboard
        initialSubmissions={submissions || []}
        monitoringData={monitoringData || []}
        contest={contest}
        isAdmin={isAdmin}
      />
    </div>
  );
}