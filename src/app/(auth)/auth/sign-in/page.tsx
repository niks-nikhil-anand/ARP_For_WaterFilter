import SignIn from '@/components/auth/sign-in'
import React, { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const page = () => {
  return (
    <div>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }>
        <SignIn />
      </Suspense>
    </div>
  )
}

export default page