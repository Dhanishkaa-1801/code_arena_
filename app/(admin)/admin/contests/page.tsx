import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { DeleteContestButton } from '@/components/DeleteContestButton';

type ContestRow = {
  id: number;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  stream: string | null;
};

const getContestStatus = (
  startTime: string,
  endTime: string
): 'Scheduled' | 'Live' | 'Archived' => {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (now < start) return 'Scheduled';
  if (now >= start && now <= end) return 'Live';
  return 'Archived';
};

const formatIST = (dateStr: string) =>
  new Date(dateStr).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

export default async function ViewContestsPage() {
  const supabase = createClient();
  const { data: contests, error } = await supabase
    .from('contests')
    .select('id, name, description, start_time, end_time, stream')
    .order('start_time', { ascending: false });

  if (error) {
    console.error('Error fetching contests:', error);
    return <p className="text-red-500">Could not fetch contests.</p>;
  }

  const safeContests: ContestRow[] = (contests || []) as ContestRow[];

  const contestsWithStatus = safeContests.map((c) => ({
    ...c,
    status: getContestStatus(c.start_time, c.end_time),
  }));

  const scheduled = contestsWithStatus.filter((c) => c.status === 'Scheduled');
  const live = contestsWithStatus.filter((c) => c.status === 'Live');
  const archived = contestsWithStatus.filter((c) => c.status === 'Archived');

  const deleteContest = async (formData: FormData) => {
    'use server';

    const id = Number(formData.get('contestId'));
    if (!id) return;

    const supabase = createClient();

    const { data: contestToDelete } = await supabase
      .from('contests')
      .select('name')
      .eq('id', id)
      .maybeSingle();

    if (contestToDelete?.name === 'Practice Problem Collection') {
      console.warn('Skipping delete of Practice Problem Collection.');
      return;
    }

    const { error } = await supabase
      .from('contests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting contest:', error);
      return;
    }

    revalidatePath('/admin/contests');
  };

  const renderContestCard = (contest: ContestRow) => (
    <div
      key={contest.id}
      className="bg-dark-bg border border-border-color rounded-lg p-4 flex flex-col gap-2 hover:border-arena-pink/60 hover:bg-slate-900/60 transition-colors transition-transform duration-200 hover:-translate-y-[1px]"
    >
      <div>
        <p className="font-semibold text-sm text-gray-100">
          {contest.name}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          Starts: {formatIST(contest.start_time)} &nbsp; Ends:{' '}
          {formatIST(contest.end_time)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs mt-1">
        <Link
          href={`/contests/${contest.id}/leaderboard`}
          className="text-arena-mint font-semibold hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          View Results
        </Link>
        <Link
          href={`/admin/contests/${contest.id}`}
          className="text-arena-pink font-semibold hover:underline"
        >
          Manage Problems
        </Link>

        {contest.name !== 'Practice Problem Collection' && (
          <DeleteContestButton
            contestId={contest.id}
            action={deleteContest}
          />
        )}
      </div>
    </div>
  );

  const renderStreamColumn = (
    title: string,
    subtitle: string,
    contests: ContestRow[]
  ) => (
    <div className="bg-card-bg border border-border-color rounded-xl p-4 space-y-3">
      <h4 className="text-sm font-semibold text-gray-100">
        {title}
      </h4>
      <p className="text-[11px] text-gray-500 mb-1">{subtitle}</p>
      {contests.length > 0 ? (
        <div className="space-y-3">
          {contests.map(renderContestCard)}
        </div>
      ) : (
        <p className="text-xs text-gray-500">No contests.</p>
      )}
    </div>
  );

  const renderSection = (
    heading: 'Scheduled Contests' | 'Live Contests' | 'Archived Contests',
    contests: (ContestRow & { status: string })[]
  ) => {
    let headingNode: JSX.Element;
    if (heading === 'Scheduled Contests') {
      headingNode = (
        <h3 className="text-2xl font-extrabold text-white">
          <span className="text-arena-blue">Scheduled</span> Contests
        </h3>
      );
    } else if (heading === 'Live Contests') {
      headingNode = (
        <h3 className="text-2xl font-extrabold text-white">
          <span className="text-arena-mint">Live</span> Contests
        </h3>
      );
    } else {
      headingNode = (
        <h3 className="text-2xl font-extrabold text-white">
          <span className="text-gray-400">Archived</span> Contests
        </h3>
      );
    }

    if (contests.length === 0) {
      return (
        <section className="space-y-3">
          {headingNode}
          <div className="bg-card-bg border border-border-color rounded-xl p-6 text-sm text-gray-500">
            No contests in this category.
          </div>
        </section>
      );
    }

    const allStream = contests.filter(
      (c) => (c.stream ?? 'all') === 'all'
    );
    const stream1 = contests.filter((c) => c.stream === '1');
    const stream2 = contests.filter((c) => c.stream === '2');
    const stream3 = contests.filter((c) => c.stream === '3');

    return (
      <section className="space-y-4">
        {headingNode}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {renderStreamColumn('Stream All', 'All departments', allStream)}
          {renderStreamColumn(
            'Stream 1',
            'AERO, BME, CIVIL, MECH, R&A',
            stream1
          )}
          {renderStreamColumn(
            'Stream 2',
            'ECE, EEE, EIE',
            stream2
          )}
          {renderStreamColumn(
            'Stream 3',
            'CSE, IT, AI&DS, M.Tech',
            stream3
          )}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-gray-100">All Contests</h2>
        {/* Host button removed; dedicated host page exists elsewhere */}
      </div>

      {safeContests.length === 0 ? (
        <div className="p-8 text-center text-gray-400 bg-card-bg border border-border-color rounded-lg">
          <p>No contests have been created yet.</p>
        </div>
      ) : (
        <>
          {renderSection('Scheduled Contests', scheduled)}
          {renderSection('Live Contests', live)}
          {renderSection('Archived Contests', archived)}
        </>
      )}
    </div>
  );
}