// In: app/(main)/contests/[id]/problems/[problemId]/layout.tsx

// This layout's ONLY job is to override the parent's <main> tag to make it full-width.
// It should NOT render another Header.

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    // This main tag has no padding or width constraints, allowing the child page to fill the screen.
    <main>
      {children}
    </main>
  );
}