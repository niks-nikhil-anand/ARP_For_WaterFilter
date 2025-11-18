import { NextRequest } from 'next/server';
import { removeAuthCookie } from '@/lib/auth';
import { successResponse } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  await removeAuthCookie();
  return successResponse(null, 'Logged out successfully');
}
