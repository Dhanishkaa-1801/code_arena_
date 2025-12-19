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

// --- 1. LOGIC HELPERS ---
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
    const diffDays = Math.ceil(Math.abs(new Date(uniqueDates[i]).getTime() - new Date(uniqueDates[i + 1]).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

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

// --- 2. MAIN COMPONENT ---
export default async function UserProfilePage({ params }: { params: { userId: string } }) {
  const supabase = createClient();
  const userId = params.userId;

  const { data: { user: loggedInUser } } = await supabase.auth.getUser();
  const isOwner = loggedInUser?.id === userId;

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, roll_no, department, year, section, role')
    .eq('id', userId)
    .single();

  if (!profile) notFound();

  const isAdmin = profile.role === 'admin';
  const displayName = profile.full_name || 'Coder';
  const userStream = getStreamFromDepartment(profile.department);
  const userStreamLabel = getStreamLabel(userStream);

  // --- ADMIN BRANCH: ONLY SHOW HEADER ---
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-[#020617] text-gray-100 pb-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-fadeIn">
          <ProfileHeaderCard 
            profile={profile} 
            email={isOwner ? loggedInUser?.email : null} 
            displayName={displayName} 
            isOwner={isOwner} 
            isAdmin={true}
          />
        </div>
      </div>
    );
  }

  // --- STUDENT BRANCH: FETCH AND COMPUTE STATS ---
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`id, verdict, submitted_at, contest_id, problem_id, contest: contests ( id, name, start_time, end_time, stream ), problem: contest_problems ( id, difficulty )`)
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  const acceptedSubs = submissions?.filter((s) => s.verdict === 'Accepted') || [];
  const totalSolved = new Set(acceptedSubs.map((s) => s.problem_id)).size;

  let easy = 0, medium = 0, hard = 0;
  let s1 = 0, s2 = 0, s3 = 0, sAll = 0;
  const uniqueSolvedSet = new Set();

  acceptedSubs.forEach((sub: any) => {
    if (!uniqueSolvedSet.has(sub.problem_id)) {
      uniqueSolvedSet.add(sub.problem_id);
      if (sub.problem?.difficulty === 'Easy') easy++;
      else if (sub.problem?.difficulty === 'Medium') medium++;
      else if (sub.problem?.difficulty === 'Hard') hard++;
      const st = sub.contest?.stream || 'all';
      if (st === '1') s1++;
      else if (st === '2') s2++;
      else if (st === '3') s3++;
      else sAll++;
    }
  });

  const participatedContestMap = new Map<number, { name: string }>();
  (submissions || []).forEach((sub: any) => {
    if (!sub.contest_id || !sub.contest) return;
    const submittedTime = new Date(sub.submitted_at).getTime();
    if (submittedTime >= new Date(sub.contest.start_time).getTime() && submittedTime <= new Date(sub.contest.end_time).getTime()) {
      if (!participatedContestMap.has(sub.contest_id)) participatedContestMap.set(sub.contest_id, { name: sub.contest.name });
    }
  });

  const recentContests = Array.from(participatedContestMap.values()).slice(0, 5);
  const streak = calculateStreak(acceptedSubs.map((s: any) => s.submitted_at));

  return (
    <div className="min-h-screen bg-[#020617] text-gray-100 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6 animate-fadeIn">
        <ProfileHeaderCard profile={profile} email={isOwner ? loggedInUser?.email : null} displayName={displayName} isOwner={isOwner} streamLabel={userStreamLabel} />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={<CheckCircle2 className="text-arena-mint" size={20} />} label="Solved" value={totalSolved} />
              <StatCard icon={<Trophy className="text-arena-pink" size={20} />} label="Contests" value={participatedContestMap.size} />
              <StatCard icon={<Flame className="text-orange-500" size={20} />} label="Streak" value={streak} />
            </div>
            <div className="flex-grow bg-card-bg border border-white/5 rounded-2xl p-8 flex flex-col justify-center shadow-xl">
               <h4 className="text-xs font-bold text-gray-500 mb-8 uppercase tracking-wider">Difficulty Distribution</h4>
               <div className="space-y-8">
                  <ProgressBar label="Easy" count={easy} total={totalSolved} color="bg-arena-mint" />
                  <ProgressBar label="Medium" count={medium} total={totalSolved} color="bg-arena-blue" />
                  <ProgressBar label="Hard" count={hard} total={totalSolved} color="bg-arena-pink" />
               </div>
            </div>
          </div>
          <div className="md:col-span-4 bg-card-bg border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-between shadow-xl">
            <h4 className="text-xs font-bold text-gray-400 mb-8 self-start uppercase tracking-wider">Analytical Overview</h4>
            <StreamPieChart s1={s1} s2={s2} s3={s3} sAll={sAll} total={totalSolved} />
            <div className="grid grid-cols-2 gap-3 w-full mt-10">
              <ChartLegend label="Stream 1" count={s1} color="bg-sky-400" />
              <ChartLegend label="Stream 2" count={s2} color="bg-emerald-400" />
              <ChartLegend label="Stream 3" count={s3} color="bg-orange-400" />
              <ChartLegend label="Stream All" count={sAll} color="bg-gray-500" />
            </div>
          </div>
        </div>

        <div className="bg-card-bg border border-white/5 rounded-2xl p-8 shadow-lg">
          <h3 className="font-bold text-lg mb-6 text-white border-l-4 border-arena-pink pl-4 italic uppercase">Recent Contests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs text-gray-500 uppercase border-b border-white/5">
                <tr><th className="px-4 py-4 font-semibold">Contest Name</th><th className="px-4 py-4 text-right font-semibold">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentContests.map((c: any, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-5 font-semibold text-white">{c.name}</td>
                    <td className="px-4 py-5 text-right"><span className="px-3 py-1 bg-arena-mint/10 text-arena-mint text-[10px] font-bold rounded-full border border-arena-mint/20 uppercase">Participated</span></td>
                  </tr>
                ))}
                {recentContests.length === 0 && (
                  <tr><td colSpan={2} className="text-center py-20 text-gray-500 text-sm">No contest participation recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 3. SUBCOMPONENTS ---

function StreamPieChart({ s1, s2, s3, sAll, total }: any) {
  if (total === 0) return <div className="w-44 h-44 rounded-full border border-white/10 flex items-center justify-center text-gray-600 text-xs font-medium">No Data</div>;
  const p1 = (s1 / total) * 100;
  const p2 = (s2 / total) * 100;
  const p3 = (s3 / total) * 100;
  return (
    <div className="w-44 h-44 rounded-full relative flex items-center justify-center border-8 border-white/5"
      style={{ background: `conic-gradient(#38bdf8 0% ${p1}%, #34d399 ${p1}% ${p1 + p2}%, #fb923c ${p1 + p2}% ${p1 + p2 + p3}%, #6b7280 ${p1 + p2 + p3}% 100%)` }}>
      <div className="w-28 h-28 bg-[#0f172a] rounded-full flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{total}</span>
        <span className="text-[10px] uppercase text-gray-500 font-medium">Solved</span>
      </div>
    </div>
  );
}

function ProgressBar({ label, count, total, color }: any) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium text-gray-400 uppercase"><span>{label}</span><span className="text-white">{count}</span></div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden"><div style={{ width: `${percent}%` }} className={`h-full ${color}`} /></div>
    </div>
  );
}

function ChartLegend({ label, count, color }: any) {
  return (
    <div className="flex items-center justify-between bg-white/5 p-2 px-3 rounded-lg border border-white/5">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${color}`} />
        <span className="text-[10px] font-medium text-gray-400 uppercase">{label}</span>
      </div>
      <span className="text-xs font-bold text-white">{count}</span>
    </div>
  );
}

function ProfileHeaderCard({ profile, email, displayName, isOwner, streamLabel, isAdmin }: any) {
  return (
    <div className="bg-card-bg border border-border-color rounded-2xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-lg">
      <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-[#020617] border border-white/10 flex items-center justify-center shrink-0">
        <span className="text-4xl font-bold text-arena-pink">{displayName.charAt(0).toUpperCase()}</span>
      </div>
      <div className="flex-1 w-full text-center md:text-left">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{displayName}</h1>
            {email && <p className="text-gray-400 text-sm mt-1">@{email.split('@')[0]}</p>}
          </div>
          {isOwner && <EditProfileModal profile={profile} />}
        </div>
        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
          {isAdmin ? (
            <Badge label="ADMIN" color="pink" />
          ) : (
            <>
              <Badge label={profile.department} color="blue" />
              <Badge label={`Year ${profile.year}`} color="mint" />
              <Badge label={streamLabel} color="pink" />
              <Badge label={profile.roll_no} color="gray" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ label, color }: any) {
  const styles: any = { pink: 'bg-arena-pink/10 text-arena-pink border-arena-pink/20', blue: 'bg-arena-blue/10 text-arena-blue border-arena-blue/20', mint: 'bg-arena-mint/10 text-arena-mint border-arena-mint/20', gray: 'bg-white/5 text-gray-400 border-white/5' };
  return <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase border ${styles[color]}`}>{label}</span>
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-card-bg border border-white/5 rounded-2xl p-6 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
      <div className="p-3 bg-[#020617] rounded-xl border border-white/5">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-white leading-none">{value}</div>
        <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mt-1.5">{label}</div>
      </div>
    </div>
  );
}