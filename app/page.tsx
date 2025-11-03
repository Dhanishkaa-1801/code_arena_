// app/page.tsx
import Link from 'next/link';

function PublicHeader() {
  return (
    <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
      <div className="flex items-center gap-3">
        <i className="fas fa-code text-arena-pink text-3xl"></i>
        <span className="text-2xl font-bold text-gray-100 tracking-wider">CODE ARENA</span>
      </div>
      <Link href="/login" className="px-6 py-2.5 bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg rounded-md font-semibold hover:-translate-y-0.5 hover:shadow-lg hover:shadow-arena-pink/30 transition-all text-sm">
        Login / Sign Up
      </Link>
    </header>
  );
}

export default function HomePage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-dark-bg text-white overflow-hidden">
      <div className="absolute inset-0 bg-arena-gradient opacity-60"></div>
      <PublicHeader />
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
          Welcome to <span className="text-arena-pink">Code Arena</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-300">
          The ultimate platform to hone your coding skills, compete in challenges, and climb the leaderboard.
        </p>
        <Link href="/login" className="mt-8 inline-block px-10 py-4 bg-gradient-to-r from-arena-pink to-arena-blue text-dark-bg rounded-lg font-bold text-lg hover:scale-105 hover:shadow-2xl hover:shadow-arena-pink/40 transition-all duration-300">
          Get Started
        </Link>
      </main>
    </div>
  );
}