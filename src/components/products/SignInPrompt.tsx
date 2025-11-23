'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ShieldCheck, UserCircle } from 'lucide-react'

type SignInPromptProps = {
  isOpen: boolean
  onClose: () => void
  onContinueAsGuest: () => void
}

export default function SignInPrompt({ isOpen, onClose, onContinueAsGuest }: SignInPromptProps) {
  const router = useRouter()

  const handleSignIn = () => {
    onClose()
    router.push('/sign-in')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <UserCircle className="h-6 w-6 text-blue-600" />
            Sign In to Book
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <div className="space-y-3">
              <p className="text-base text-gray-700 dark:text-gray-300">
                To provide you with the best service, we recommend signing in to your account.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">Benefits of signing in:</p>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1 list-disc list-inside">
                      <li>Track your order status</li>
                      <li>Save multiple addresses</li>
                      <li>View order history</li>
                      <li>Faster checkout next time</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account? You can create one during sign-in or continue as a guest.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleSignIn}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Sign In / Create Account
          </Button>
          <Button
            onClick={() => {
              onClose()
              onContinueAsGuest()
            }}
            variant="outline"
            className="w-full"
          >
            Continue as Guest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
