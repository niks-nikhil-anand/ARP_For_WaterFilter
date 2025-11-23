'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logoutAgent() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
  redirect('/auth/agent')
}
