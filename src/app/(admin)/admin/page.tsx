import React from 'react';
import { getDashboardStats } from '@/actions/admin/dashboard';
import DashboardView from '@/components/admin/DashboardView';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardStats();

  return <DashboardView {...data} />;
}
