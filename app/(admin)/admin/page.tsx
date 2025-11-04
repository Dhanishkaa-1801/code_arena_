import { redirect } from 'next/navigation';

// This component's sole purpose is to act as a redirect.
// When a user navigates to /admin, this page will immediately
// redirect them to the /admin/contests page.
export default function AdminRootPage() {
  redirect('/admin/contests');
}