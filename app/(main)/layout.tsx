import Header from "@/components/Header";
import Navigation from "@/components/Navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Navigation />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-8 py-6">
        {children}
      </main>
    </>
  );
}