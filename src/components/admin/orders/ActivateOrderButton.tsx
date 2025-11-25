'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Zap } from 'lucide-react'
import { activateOrder } from '@/actions/common/orders'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ActivateOrderButton({ orderId }: { orderId: number }) {
  const [isActivating, setIsActivating] = useState(false)
  const router = useRouter()

  const handleActivate = async () => {
    if (!confirm('Are you sure you want to activate this order? This will mark payment as completed and create warranties/AMCs.')) {
      return
    }

    setIsActivating(true)
    try {
      const result = await activateOrder(orderId)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to activate order')
      }
    } catch (error) {
      console.error('Error activating order:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsActivating(false)
    }
  }

  return (
    <Button 
      onClick={handleActivate} 
      disabled={isActivating}
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {isActivating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Activating...
        </>
      ) : (
        <>
          <Zap className="mr-2 h-4 w-4" />
          Activate Order
        </>
      )}
    </Button>
  )
}
