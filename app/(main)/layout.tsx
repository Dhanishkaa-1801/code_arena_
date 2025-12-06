import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/server";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Header user={user} />
      {/* 
         UPDATED: Removed "max-w-[1400px] mx-auto px-4 sm:px-8 py-6"
         We changed this to "w-full" so the Workspace can take up the full screen.
      */}
      <main className="w-full">
        {children}
      </main>
    </>
  );
}