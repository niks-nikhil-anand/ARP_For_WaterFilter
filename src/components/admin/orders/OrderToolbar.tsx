'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'

export function OrderToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentSearch = searchParams.get('search') || ''
  const currentStatus = searchParams.get('status') || 'ALL'
  const currentPayment = searchParams.get('payment') || 'ALL'

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    router.replace(`?${params.toString()}`)
  }, 300)

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'ALL') {
      params.set('status', value)
    } else {
      params.delete('status')
    }
    router.replace(`?${params.toString()}`)
  }

  const handlePaymentChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value && value !== 'ALL') {
      params.set('payment', value)
    } else {
      params.delete('payment')
    }
    router.replace(`?${params.toString()}`)
  }

  const clearFilters = () => {
    router.replace('/admin/order_details')
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search orders..."
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Payment Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
          <SelectItem value="FAILED">Failed</SelectItem>
          <SelectItem value="REFUNDED">Refunded</SelectItem>
        </SelectContent>
      </Select>
      <Select value={currentPayment} onValueChange={handlePaymentChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Payment Method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Methods</SelectItem>
          <SelectItem value="CASH">Cash</SelectItem>
          <SelectItem value="ONLINE">Online</SelectItem>
          <SelectItem value="UPI">UPI</SelectItem>
          <SelectItem value="CARD">Card</SelectItem>
        </SelectContent>
      </Select>
      {(currentSearch || currentStatus !== 'ALL' || currentPayment !== 'ALL') && (
        <Button variant="ghost" onClick={clearFilters} className="px-3">
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  )
}
