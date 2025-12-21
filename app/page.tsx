import Link from 'next/link';
import Image from 'next/image'; // --- Switch to Next.js Optimized Images ---
import { createClient } from '@/utils/supabase/server';
import { Trophy, Code2, Zap, BarChart, Search, Layout, Sparkle } from 'lucide-react';
import { InteractiveCodeBackground } from '../components/InteractiveCodeBackground';

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-arena-pink/30 overflow-x-hidden font-sans relative">
      <InteractiveCodeBackground />

      {/* Ambient Lighting */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-5%] left-[-5%] w-[60%] h-[60%] bg-arena-pink/5 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[60%] h-[60%] bg-arena-blue/5 rounded-full blur-[140px] animate-pulse" />
      </div>

      <div className="relative z-10">
        <nav className="border-b border-white/10 bg-[#020617]/60 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:border-arena-pink/50 transition-all">
                <Code2 className="text-arena-pink" size={24} strokeWidth={2} />
              </div>
              <span className="text-arena-pink text-2xl font-bold tracking-tight">Code Arena</span>
            </Link>
            {!session ? (
              <Link href="/login" className="px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-arena-mint transition-colors text-sm shadow-lg">Sign In</Link>
            ) : (
              <Link href="/contests" className="px-6 py-2 bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition-all text-sm text-arena-blue">Go to Arena</Link>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative pt-32 pb-40 px-6 text-center">
          <div className="max-w-5xl mx-auto animate-fadeIn relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-arena-mint text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              <Sparkle size={12} /> Code Catalyst Club Presents
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tight text-white">
              Code. Compete. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-arena-pink via-arena-blue to-arena-mint uppercase">Conquer.</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-normal leading-relaxed">
              The programming starter for every student. Specially curated problems and contests to level-up your coding journey!
            </p>
            <Link href={session ? "/contests" : "/login"} className="px-10 py-4 bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg font-bold rounded-xl text-lg hover:scale-105 transition-all shadow-xl shadow-arena-pink/20 inline-flex items-center gap-3">
              {session ? "Enter the Arena" : "Get Started Now"} <Zap size={20} fill="currentColor" />
            </Link>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 space-y-64 pb-64 relative z-10">
          {/* 1. CONTESTS */}
          <div className="grid lg:grid-cols-2 gap-20 items-center relative">
            <div className="space-y-6 order-2 lg:order-1 relative z-10">
              <Badge icon={<Trophy size={16}/>} color="text-arena-mint" label="Competitions" />
              <h2 className="text-5xl font-bold tracking-tight text-white uppercase">Stream-Isolated Contests</h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md font-medium">Timed challenges curated specifically for your technical stream.</p>
              <ul className="space-y-4">
                <FeatureItem label="Automatic Stream Assignment" />
                <FeatureItem label="Live IST Countdowns" />
              </ul>
            </div>
            <div className="relative order-1 lg:order-2 group flex justify-center items-center min-h-[400px]">
              <div className="absolute inset-0 flex justify-between items-center text-white/[0.18] text-[400px] font-mono select-none pointer-events-none z-0">
                <div className="-rotate-12 translate-x-[-15%]">{"{"}</div>
                <div className="rotate-12 translate-x-[15%]">{"}"}</div>
              </div>

              <div className="relative w-full max-w-sm h-full flex items-center justify-center">
                {/* Optimized Image usage for Vercel */}
                <Image src="/contest-past.png" width={200} height={150} className="absolute rounded-xl border border-white/10 shadow-xl -rotate-12 -translate-x-32 opacity-40 group-hover:opacity-100 group-hover:z-30 transition-all duration-500" alt="Past" />
                <Image src="/contest-upcoming.png" width={200} height={150} className="absolute rounded-xl border border-white/10 shadow-xl rotate-12 translate-x-32 opacity-40 group-hover:opacity-100 group-hover:z-30 transition-all duration-500" alt="Upcoming" />
                <div className="relative z-20 rounded-2xl border border-arena-mint/30 overflow-hidden shadow-2xl scale-110 group-hover:scale-115 transition-transform duration-500">
                  <Image src="/contest-active.png" width={300} height={200} className="hero-img" alt="Active" />
                </div>
                <CurvedArrow className="absolute -top-16 -right-10 text-arena-pink" rotation="rotate-[20deg]" label="Filtered by Stream" />
              </div>
            </div>
          </div>

          <Separator />

          {/* 2. EDITOR */}
          <div className="grid lg:grid-cols-2 gap-20 items-center relative">
            <div className="relative group flex justify-center">
              <div className="absolute inset-0 flex justify-between items-center text-white/[0.18] text-[400px] font-mono select-none pointer-events-none z-0">
                <div className="rotate-6 translate-x-[-15%]">{"["}</div>
                <div className="-rotate-6 translate-x-[15%]">{"]"}</div>
              </div>
              <CurvedArrow className="absolute -bottom-24 left-10 text-arena-blue" rotation="rotate-[-160deg]" label="Real-time Judging" />
              <div className="relative z-10 rounded-3xl border border-white/10 overflow-hidden shadow-2xl group-hover:border-arena-blue/30 transition-all max-w-md">
                <Image src="/hero-editor.png" width={500} height={300} className="hero-img transition-transform duration-700 group-hover:scale-105" alt="Editor" />
              </div>
            </div>
            <div className="space-y-6 relative z-10">
              <Badge icon={<Code2 size={16}/>} color="text-arena-blue" label="Pro IDE" />
              <h2 className="text-5xl font-bold tracking-tight text-white uppercase">Industrial Execution</h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md font-medium">Fast code execution via Judge0 CE with human-readable tracebacks.</p>
            </div>
          </div>

          <Separator />

          {/* 3. LEADERBOARD */}
          <div className="grid lg:grid-cols-2 gap-20 items-center relative">
            <div className="space-y-6 order-2 lg:order-1 relative z-10">
              <Badge icon={<BarChart size={16}/>} color="text-arena-mint" label="Rankings" />
              <h2 className="text-5xl font-bold tracking-tight text-white uppercase">Realtime Leaderboards</h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md font-medium"> Leaderboards restricted to contest windows and stream based for fair play.</p>
              <FeatureItem label="Viewable for everyone with profile linking" />
            </div>
            <div className="relative order-1 lg:order-2 group flex justify-center">
              <div className="absolute inset-0 flex justify-between items-center text-white/[0.18] text-[400px] font-mono select-none pointer-events-none z-0">
                <div className="-rotate-[15deg] translate-x-[-15%]">{"("}</div>
                <div className="rotate-[15deg] translate-x-[15%]">{")"}</div>
              </div>
              <CurvedArrow className="absolute -top-20 -left-12 text-arena-pink" rotation="rotate-[210deg]" label="In-contest Only" />
              <div className="relative z-10 rounded-3xl border border-white/10 overflow-hidden shadow-2xl group-hover:border-arena-pink/30 transition-all max-w-md">
                <Image src="/hero-leaderboard.png" width={500} height={300} className="hero-img transition-transform duration-700 group-hover:scale-105" alt="Leaderboard" />
              </div>
            </div>
          </div>

          <Separator />

          {/* 4. BANK */}
          <div className="grid lg:grid-cols-2 gap-20 items-center relative">
            <div className="relative group flex justify-center">
              <div className="absolute inset-0 flex justify-between items-center text-white/[0.18] text-[400px] font-mono select-none pointer-events-none z-0">
                <div className="rotate-[20deg] translate-x-[-20%]">{"<"}</div>
                <div className="-rotate-[20deg] translate-x-[20%]">{">"}</div>
              </div>
              <CurvedArrow className="absolute -top-16 left-20 text-arena-blue" rotation="rotate-[-45deg]" label="Smart Filtering" />
              <div className="relative z-10 rounded-3xl border border-white/10 overflow-hidden shadow-2xl group-hover:border-arena-blue/30 transition-all max-w-md">
                <Image src="/hero-bank.png" width={500} height={300} className="hero-img transition-transform duration-700 group-hover:scale-105" alt="Problem Bank" />
              </div>
            </div>
            <div className="space-y-6 relative z-10">
              <Badge icon={<Search size={16}/>} color="text-arena-blue" label="Library" />
              <h2 className="text-5xl font-bold tracking-tight text-white uppercase">Infinite Practice</h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md font-medium">Explore 100+ problems with unattempted filtering.</p>
            </div>
          </div>

          <Separator />

          {/* 5. DASHBOARD */}
          <div className="grid lg:grid-cols-2 gap-20 items-center relative">
            <div className="space-y-6 order-2 lg:order-1 relative z-10">
              <Badge icon={<Layout size={16}/>} color="text-arena-pink" label="User Center" />
              <h2 className="text-5xl font-bold tracking-tight text-white uppercase">Track Progress</h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md font-medium">Personalized statistics and stream badges.</p>
            </div>
            <div className="relative order-1 lg:order-2 group flex justify-center">
              <div className="absolute inset-0 flex justify-between items-center text-white/[0.18] text-[400px] font-mono select-none pointer-events-none z-0">
                <div className="-rotate-12 translate-x-[-10%]">{"|"}</div>
                <div className="rotate-12 translate-x-[10%]">{"|"}</div>
              </div>
              <CurvedArrow className="absolute -bottom-24 right-10 text-arena-mint" rotation="rotate-[-160deg]" label="Analytics" />
              <div className="relative z-10 rounded-3xl border border-white/10 overflow-hidden shadow-2xl group-hover:border-arena-mint/30 transition-all max-w-md">
                <Image src="/hero-dashboard.png" width={500} height={300} className="hero-img transition-transform duration-700 group-hover:scale-105" alt="Dashboard" />
              </div>
            </div>
          </div>
        </main>

        <section className="py-40 bg-gradient-to-b from-transparent to-arena-pink/5 border-t border-white/10">
          <div className="max-w-4xl mx-auto px-6 text-center animate-fadeIn">
            <h2 className="text-5xl md:text-7xl font-extrabold mb-12 tracking-tight text-white uppercase">Ready to join <br/> the Arena?</h2>
            <Link href="/login" className="px-16 py-6 bg-white text-black font-bold rounded-2xl text-2xl hover:bg-arena-mint transition-all shadow-2xl inline-block uppercase">Get Started Now</Link>
          </div>
        </section>

        <footer className="py-12 border-t border-white/5 text-center text-gray-600 text-sm font-bold uppercase tracking-widest">
          &copy; 2025 Code Arena.
        </footer>
      </div>
    </div>
  );
}

/* --- SUBCOMPONENTS --- */

function Separator() { return <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto max-w-4xl opacity-50" /> }
function Badge({ icon, label, color }: { icon: any, label: string, color: string }) { return <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 ${color} font-bold text-[10px] uppercase tracking-widest backdrop-blur-sm`}>{icon} {label}</div> }
function FeatureItem({ label }: { label: string }) { return <div className="flex items-center gap-3 text-gray-400"><div className="w-2 h-2 rounded-full bg-arena-mint shadow-md" /><span className="font-bold text-sm uppercase tracking-wider">{label}</span></div> }
function CurvedArrow({ className, label, rotation }: { className: string, label: string, rotation: string }) {
  return (
    <div className={`flex flex-col items-center pointer-events-none select-none z-30 ${className}`}>
      <span className="font-handwriting text-3xl whitespace-nowrap mb-4 tracking-wide text-white drop-shadow-[0_2px_15px_rgba(0,0,0,1)]">{label}</span>
      <div className={rotation}><svg width="100" height="100" viewBox="0 0 80 80" fill="none"><path d="M10 10C35 10 70 30 70 70M70 70L55 65M70 70L65 55" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
    </div>
  )
}