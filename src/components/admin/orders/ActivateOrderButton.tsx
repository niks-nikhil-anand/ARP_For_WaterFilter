'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Zap, CheckCircle2, AlertCircle } from 'lucide-react'
import { activateOrder } from '@/actions/common/orders'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from '@/components/ui/badge'

export function ActivateOrderButton({ order }: { order: any }) {
  const [isActivating, setIsActivating] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  if (!order) {
    console.error('ActivateOrderButton: order prop is missing')
    return null
  }

  const handleActivate = async () => {
    setIsActivating(true)
    try {
      const result = await activateOrder(order.id)
      if (result.success) {
        toast.success(result.message)
        setIsOpen(false)
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

  // Calculate warranty details for display
  const getWarrantyDetails = () => {
    const details = []
    
    // Free Warranty
    if (order.product?.warrantyPeriod) {
      details.push({
        label: 'Free Warranty',
        value: order.product.warrantyPeriod,
        type: 'default'
      })
    }

    // Additional Warranty
    if (order.selectedAdditionalWarranty && order.selectedAdditionalWarranty !== 'none') {
      details.push({
        label: 'Additional Warranty',
        value: order.selectedAdditionalWarranty,
        type: 'success'
      })
    }

    // AMC
    if (order.selectedAMC && order.selectedAMC !== 'none') {
      details.push({
        label: 'AMC Plan',
        value: order.selectedAMC,
        type: 'purple'
      })
    }

    return details
  }

  const warrantyDetails = getWarrantyDetails()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
          <Zap className="mr-2 h-4 w-4" />
          Activate Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-5 w-5 text-green-600" />
            Activate Order
          </DialogTitle>
          <DialogDescription>
            This action will mark the order as active and generate the necessary warranty and service records.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Actions to be performed:
            </h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                Update Payment Status to COMPLETED
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                Mark Installation as Completed
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                Generate Warranty & AMC Records
              </li>
            </ul>
          </div>

          {warrantyDetails.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Records to be created
              </h4>
              <div className="grid gap-3">
                {warrantyDetails.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md border"
                  >
                    <span className="font-medium">{item.label}</span>
                    <Badge variant="secondary" className="text-sm">
                      {item.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200 text-sm rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Please ensure all physical installation work is completed before activating the order.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isActivating}>
            Cancel
          </Button>
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
                Confirm Activation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
