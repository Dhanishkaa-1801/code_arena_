import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/server";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch role to see if we should show the "Admin Dashboard" button
  let userRole = 'student';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile) userRole = profile.role;
  }

  return (
    <>
      <Header user={user} userRole={userRole} />
      <main className="w-full">
        {children}
      </main>
    </>
  );
}