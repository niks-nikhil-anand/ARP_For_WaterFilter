'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, X, Calendar as CalendarIcon, ArrowUpDown } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function OrderToolbar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSearch = searchParams.get('search') || ''
  const currentStatus = searchParams.get('status') || 'ALL'
  const currentPayment = searchParams.get('payment') || 'ALL'
  const currentSortBy = searchParams.get('sortBy') || 'createdAt'
  const currentSortOrder = searchParams.get('sortOrder') || 'desc'

  const startDateParam = searchParams.get('startDate')
  const endDateParam = searchParams.get('endDate')

  const [date, setDate] = useState<DateRange | undefined>(
    startDateParam && endDateParam
      ? { from: new Date(startDateParam), to: new Date(endDateParam) }
      : undefined
  )
  const [activeTab, setActiveTab] = useState<string>('all')

  // Sync state with URL params
  useEffect(() => {
    if (startDateParam && endDateParam) {
      setDate({ from: new Date(startDateParam), to: new Date(endDateParam) })
      // Try to determine active tab based on dates
      const start = new Date(startDateParam)
      const end = new Date(endDateParam)
      const today = new Date()

      if (start.toDateString() === today.toDateString() && end.toDateString() === today.toDateString()) {
        setActiveTab('today')
      } else if (start.toDateString() === subDays(today, 1).toDateString() && end.toDateString() === subDays(today, 1).toDateString()) {
        setActiveTab('yesterday')
      } else {
        setActiveTab('custom')
      }
    } else {
      setDate(undefined)
      setActiveTab('all')
    }
  }, [startDateParam, endDateParam])

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    params.set('page', '1') // Reset to page 1 on search
    router.replace(`?${params.toString()}`)
  }, 300)

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    params.set('page', '1') // Reset to page 1 on filter change
    router.replace(`?${params.toString()}`)
  }

  const handleStatusChange = (value: string) => {
    updateParams({ status: value === 'ALL' ? null : value })
  }

  const handlePaymentChange = (value: string) => {
    updateParams({ payment: value === 'ALL' ? null : value })
  }

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-')
    updateParams({ sortBy, sortOrder })
  }

  const handleDateSelect = (range: DateRange | undefined) => {
    setDate(range)
    if (range?.from) {
      const updates: Record<string, string | null> = {
        startDate: range.from.toISOString(),
        endDate: range.to ? range.to.toISOString() : range.from.toISOString()
      }
      updateParams(updates)
    } else {
      updateParams({ startDate: null, endDate: null })
    }
  }

  const handlePresetDate = (preset: string) => {
    setActiveTab(preset)
    const today = new Date()
    let range: DateRange | undefined

    switch (preset) {
      case 'today':
        range = { from: startOfDay(today), to: endOfDay(today) }
        break
      case 'yesterday':
        const yesterday = subDays(today, 1)
        range = { from: startOfDay(yesterday), to: endOfDay(yesterday) }
        break
      case 'last7':
        range = { from: subDays(today, 7), to: endOfDay(today) }
        break
      case 'last30':
        range = { from: subDays(today, 30), to: endOfDay(today) }
        break
      case 'all':
        range = undefined
        break
      default:
        return // Custom, do nothing
    }

    setDate(range)
    if (range) {
      updateParams({
        startDate: range.from!.toISOString(),
        endDate: range.to!.toISOString()
      })
    } else {
      updateParams({ startDate: null, endDate: null })
    }
  }

  const clearFilters = () => {
    router.replace('/admin/order_details')
    setDate(undefined)
    setActiveTab('all')
  }

  const hasActiveFilters = currentSearch || currentStatus !== 'ALL' || currentPayment !== 'ALL' || startDateParam

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search orders..."
            defaultValue={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handlePresetDate} className="w-full">
              <div className="p-3 border-b">
                <TabsList className="grid w-full grid-cols-3 gap-2 h-auto">
                  <TabsTrigger value="all">All Time</TabsTrigger>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="yesterday">Yesterday</TabsTrigger>
                  <TabsTrigger value="last7">Last 7 Days</TabsTrigger>
                  <TabsTrigger value="last30">Last 30 Days</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="custom" className="p-0 m-0 border-0">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={(range) => {
                    setDate(range)
                    if (range?.from && range?.to) {
                      handleDateSelect(range)
                    }
                  }}
                  numberOfMonths={2}
                />
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        <Select value={`${currentSortBy}-${currentSortOrder}`} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="amountPaid-desc">Amount: High to Low</SelectItem>
            <SelectItem value="amountPaid-asc">Amount: Low to High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-4">
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

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="px-3">
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}
