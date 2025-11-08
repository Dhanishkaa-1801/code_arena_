// In: app/(main)/layout.tsx

import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/server";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Header user={user} />
      {/* Note: No <Navigation /> component. This is correct. */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6">
        {children}
      </main>
    </>
  );
}