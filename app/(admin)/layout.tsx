import AdminNavigation from '@/components/AdminNavigation'; // <-- Import the component

// This layout will wrap all pages inside the /admin route
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-dark-bg min-h-screen text-white">
      <header className="bg-card-bg border-b border-border-color p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-arena-pink">Admin Dashboard</h1>
          <AdminNavigation /> {/* <-- Add the navigation here */}
        </div>
      </header>
      <main className="p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}