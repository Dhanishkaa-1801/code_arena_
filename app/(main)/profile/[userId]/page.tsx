import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import {
  Trophy,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import EditProfileModal from '../EditProfileModal';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function calculateStreak(dates: string[]) {
  if (!dates.length) return 0;
  const sortedDates = dates
    .map((d) => new Date(d).toISOString().split('T')[0])
    .sort((a, b) => b.localeCompare(a));
  const uniqueDates = Array.from(new Set(sortedDates));
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const diffDays = Math.ceil(
      Math.abs(
        new Date(uniqueDates[i]).getTime() -
          new Date(uniqueDates[i + 1]).getTime()
      ) /
        (1000 * 60 * 60 * 24)
    );
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

// NEW: derive stream from department and get label
function getStreamFromDepartment(dept: string | null): '1' | '2' | '3' {
  if (!dept) return '3';
  const d = dept.toUpperCase();

  if (['CSE', 'MTECH', 'IT', 'AI&DS'].includes(d)) return '1';
  if (['EEE', 'ECE', 'EIE', 'R&A'].includes(d)) return '2';
  if (['MECH', 'BME', 'CIVIL', 'AERO'].includes(d)) return '3';

  return '3';
}

function getStreamLabel(stream: '1' | '2' | '3'): string {
  return `Stream ${stream}`;
}

export default async function UserProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const supabase = createClient();
  const userId = params.userId;

  // who is viewing?
  const {
    data: { user: loggedInUser },
  } = await supabase.auth.getUser();
  const isOwner = loggedInUser?.id === userId;

  // profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, roll_no, department, year, section, role')
    .eq('id', userId)
    .single();

  if (!profile) {
    notFound();
  }

  const isAdmin = profile.role === 'admin';
  const displayName = profile.full_name || 'Coder';

  // derive stream from department
  const userStream = getStreamFromDepartment(profile.department);
  const userStreamLabel = getStreamLabel(userStream);

  // If admin, show only profile card
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-dark-bg text-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
          <ProfileHeaderCard
            profile={profile}
            email={isOwner ? loggedInUser?.email : null}
            displayName={displayName}
            isOwner={isOwner}
            streamLabel={userStreamLabel} // NEW
          />
        </div>
      </div>
    );
  }

  // submissions for this user (both contest + practice)
  const { data: submissions } = await supabase
    .from('submissions')
    .select(
      `
      id,
      verdict,
      submitted_at,
      contest_id,
      problem_id,
      contest: contests ( id, name, start_time, end_time ),
      problem: contest_problems ( id, difficulty )
    `
    )
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  const acceptedSubs = submissions?.filter((s) => s.verdict === 'Accepted') || [];

  // Problems solved = unique problem_id across all Accepted submissions
  const solvedProblemIds = new Set(acceptedSubs.map((s) => s.problem_id));
  const totalSolved = solvedProblemIds.size;

  // Difficulty breakdown (only from Accepted problems where we know difficulty)
  const uniqueSolvedMap = new Map<number, string | null>();
  acceptedSubs.forEach((s: any) => {
    if (s.problem) {
      uniqueSolvedMap.set(s.problem_id, s.problem.difficulty);
    }
  });

  let easy = 0,
    medium = 0,
    hard = 0;
  uniqueSolvedMap.forEach((diff) => {
    if (diff === 'Easy') easy++;
    else if (diff === 'Medium') medium++;
    else if (diff === 'Hard') hard++;
  });

  // --- Contests joined ONLY if user submitted within contest window ---
  const participatedContestMap = new Map<
    number,
    { name: string; date: string }
  >();

  (submissions || []).forEach((sub: any) => {
    if (!sub.contest_id || !sub.contest) return;

    const contest = sub.contest;
    const submittedTime = new Date(sub.submitted_at).getTime();
    const startTime = contest.start_time
      ? new Date(contest.start_time).getTime()
      : NaN;
    const endTime = contest.end_time
      ? new Date(contest.end_time).getTime()
      : NaN;

    if (Number.isNaN(startTime) || Number.isNaN(endTime)) return;

    // Count only submissions that happened DURING the contest
    if (submittedTime >= startTime && submittedTime <= endTime) {
      if (!participatedContestMap.has(sub.contest_id)) {
        participatedContestMap.set(sub.contest_id, {
          // @ts-ignore
          name: contest.name,
          date: sub.submitted_at,
        });
      }
    }
  });

  const contestsJoinedCount = participatedContestMap.size;
  const recentContests = Array.from(participatedContestMap.values()).slice(0, 5);

  // streak = based on Accepted submissions (practice + contest)
  const streak = calculateStreak(acceptedSubs.map((s: any) => s.submitted_at));

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-fadeIn">
        <ProfileHeaderCard
          profile={profile}
          email={isOwner ? loggedInUser?.email : null}
          displayName={displayName}
          isOwner={isOwner}
          streamLabel={userStreamLabel} // NEW
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<CheckCircle2 className="text-arena-mint" size={24} />}
            label="Problems Solved"
            value={totalSolved}
            subtext="Keep grinding!"
          />
          <StatCard
            icon={<Trophy className="text-arena-pink" size={24} />}
            label="Contests Joined"
            value={contestsJoinedCount}
            subtext="Active participation"
          />
          <StatCard
            icon={<Flame className="text-orange-500" size={24} />}
            label="Day Streak"
            value={streak}
            subtext="Consecutive Days"
          />

          <div className="bg-card-bg border border-border-color rounded-xl p-5 flex flex-col justify-center gap-2">
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>Easy</span>
              <span>{easy}</span>
            </div>
            <div className="w-full h-1 bg-dark-bg rounded-full overflow-hidden">
              <div
                style={{ width: `${(easy / (totalSolved || 1)) * 100}%` }}
                className="h-full bg-arena-mint"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
              <span>Medium</span>
              <span>{medium}</span>
            </div>
            <div className="w-full h-1 bg-dark-bg rounded-full overflow-hidden">
              <div
                style={{ width: `${(medium / (totalSolved || 1)) * 100}%` }}
                className="h-full bg-arena-blue"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
              <span>Hard</span>
              <span>{hard}</span>
            </div>
            <div className="w-full h-1 bg-dark-bg rounded-full overflow-hidden">
              <div
                style={{ width: `${(hard / (totalSolved || 1)) * 100}%` }}
                className="h-full bg-arena-pink"
              />
            </div>
          </div>
        </div>

        {/* Recent Contests (ONLY contests with in-window submissions) */}
        <div className="bg-card-bg border border-border-color rounded-xl p-6">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-white border-l-4 border-arena-pink pl-3">
            Recent Contests
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase border-b border-border-color">
                <tr>
                  <th className="px-4 py-3">Contest Name</th>
                  <th className="px-4 py-3 text-right">Date Participated</th>
                </tr>
              </thead>
              <tbody>
                {recentContests.map((c: any, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border-color/30 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-4 font-medium text-white">
                      {c.name}
                    </td>
                    <td className="px-4 py-4 text-right text-gray-400">
                      {new Date(c.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
                {recentContests.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="text-center py-10 text-gray-500"
                    >
                      No contest participation yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileHeaderCard({
  profile,
  email,
  displayName,
  isOwner,
  streamLabel,
}: any) {
  return (
    <div className="bg-card-bg border border-border-color rounded-xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden shadow-lg">
      <div className="absolute top-0 right-0 w-64 h-64 bg-arena-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-dark-bg border-2 border-border-color flex items-center justify-center shrink-0">
        <span className="text-4xl font-bold text-white">
          {displayName.charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 w-full text-center md:text-left z-10">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {displayName}
            </h1>
            {email && (
              <p className="text-gray-400 text-sm mb-4">
                @{email.split('@')[0]}
              </p>
            )}
          </div>
          {isOwner && <EditProfileModal profile={profile} />}
        </div>

        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
          {profile?.role === 'admin' ? (
            <Badge label="ADMIN" color="pink" />
          ) : (
            <>
              {profile?.department && (
                <Badge label={profile.department} color="blue" />
              )}
              {profile?.year && (
                <Badge label={`Year ${profile.year}`} color="mint" />
              )}
              {/* NEW: stream badge */}
              {streamLabel && <Badge label={streamLabel} color="mint" />}
              {profile?.section && (
                <Badge label={`Sec ${profile.section}`} color="gray" />
              )}
              {profile?.roll_no && (
                <Badge label={profile.roll_no} color="gray" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string | number; color: string }) {
  const styles: any = {
    pink: 'bg-arena-pink/10 text-arena-pink border-arena-pink/20',
    blue: 'bg-arena-blue/10 text-arena-blue border-arena-blue/20',
    mint: 'bg-arena-mint/10 text-arena-mint border-arena-mint/20',
    gray: 'bg-gray-800 text-gray-300 border-gray-700',
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
        styles[color] || styles.gray
      }`}
    >
      {label}
    </span>
  );
}

function StatCard({ icon, label, value, subtext }: any) {
  return (
    <div className="bg-card-bg border border-border-color rounded-xl p-6 flex items-center gap-4 hover:border-arena-blue/50 transition duration-300">
      <div className="p-3 bg-dark-bg rounded-lg border border-border-color">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm font-medium text-gray-400">{label}</div>
        <div className="text-xs text-gray-600 mt-0.5">{subtext}</div>
      </div>
    </div>
  );
}