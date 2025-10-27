// app/dashboard/layout.tsx
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  if (!user) {
    redirect('/login');
  }

  return <>{children}</>;
}