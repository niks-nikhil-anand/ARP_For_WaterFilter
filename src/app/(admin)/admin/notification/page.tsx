import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getNotifications } from '@/actions/admin/notifications';
import NotificationClient from './NotificationClient';
import { redirect } from 'next/navigation';

export default async function NotificationPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    redirect('/auth/login');
  }

  const { success, data: notifications, error } = await getNotifications(decoded.id);

  if (!success) {
    console.error('Failed to fetch notifications:', error);
    // Handle error appropriately, maybe pass empty list or error state
  }

  return (
    <NotificationClient
      initialNotifications={notifications || []}
      userId={decoded.id}
    />
  );
}
