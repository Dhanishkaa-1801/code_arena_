'use client';

export default function Header() {
  return (
    <header className="bg-card-bg/80 backdrop-blur-lg border-b border-border-color h-[70px] sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fas fa-code text-arena-pink text-3xl"></i>
          <span className="hidden sm:block text-xl font-bold text-arena-pink tracking-wider">CODE ARENA</span>
        </div>
        <div className="text-center hidden lg:block">
          <p className="text-gray-400">To make coding competitions easier</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 w-10 h-10 rounded-full bg-dark-bg/70 text-gray-100 hover:bg-arena-pink/20 hover:-translate-y-0.5 transition-all flex items-center justify-center">
            <i className="fas fa-search text-sm"></i>
          </button>
          <button className="p-3 w-10 h-10 rounded-full bg-dark-bg/70 text-gray-100 hover:bg-arena-pink/20 hover:-translate-y-0.5 transition-all relative flex items-center justify-center">
            <i className="fas fa-bell text-sm"></i>
            <span className="absolute -top-0.5 -right-0.5 bg-arena-pink text-dark-bg text-[10px] font-bold rounded-full px-1.5 py-0.5">3</span>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-dark-bg/70 rounded-full cursor-pointer hover:bg-arena-blue/20 transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-arena-pink to-arena-blue"></div>
            <span className="font-medium text-sm hidden sm:block">CodeMaster</span>
          </div>
        </div>
      </div>
    </header>
  );
}