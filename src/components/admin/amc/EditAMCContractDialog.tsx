'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { updateAMCContract } from '@/actions/admin/serviceEvents'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface EditAMCContractDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amc: any
  onSuccess: () => void
}

export const EditAMCContractDialog = ({
  open,
  onOpenChange,
  amc,
  onSuccess
}: EditAMCContractDialogProps) => {
  const [isUpdating, setIsUpdating] = useState(false)

  // Form State
  const [editForm, setEditForm] = useState({
    price: '',
    paymentPaid: '',
    paymentDue: '',
    paymentMethod: 'CASH' as 'CASH' | 'ONLINE' | 'UPI' | 'CARD' | 'NET_BANKING',
    startDate: '',
    duration: '',
    endDate: '',
    remarks: '',
    status: ''
  })

  // Initialize form with AMC data
  useEffect(() => {
    if (amc && open) {
      const contract = amc.contracts && amc.contracts.length > 0 ? amc.contracts[0] : null

      if (contract) {
        setEditForm({
          price: contract.price?.toString() || '',
          paymentPaid: contract.paymentPaid?.toString() || '',
          paymentDue: contract.paymentDue?.toString() || '',
          paymentMethod: contract.paymentMethod || 'CASH',
          startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
          duration: contract.duration || '',
          endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
          remarks: contract.description || '',
          status: amc.status || 'ACTIVE'
        })
      }
    }
  }, [amc, open])

  // Calculate payment due automatically
  useEffect(() => {
    const price = parseFloat(editForm.price) || 0
    const paid = parseFloat(editForm.paymentPaid) || 0

    setEditForm(prev => ({
      ...prev,
      paymentDue: (price - paid).toFixed(2)
    }))
  }, [editForm.price, editForm.paymentPaid])

  // Calculate end date based on duration
  useEffect(() => {
    if (editForm.startDate && editForm.duration) {
      const startDate = new Date(editForm.startDate)
      const endDate = new Date(startDate)

      const durationMatch = editForm.duration.match(/(\d+)\s*(year|month|day)s?/i)
      if (durationMatch) {
        const amount = parseInt(durationMatch[1])
        const unit = durationMatch[2].toLowerCase()

        if (unit === 'year') {
          endDate.setFullYear(endDate.getFullYear() + amount)
        } else if (unit === 'month') {
          endDate.setMonth(endDate.getMonth() + amount)
        } else if (unit === 'day') {
          endDate.setDate(endDate.getDate() + amount)
        }
      }
      setEditForm(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0]
      }))
    }
  }, [editForm.startDate, editForm.duration])

  const handleUpdate = async () => {
    if (!amc) return

    const contract = amc.contracts && amc.contracts.length > 0 ? amc.contracts[0] : null
    if (!contract) {
      toast.error('No contract found to edit')
      return
    }

    setIsUpdating(true)

    const result = await updateAMCContract(contract.id, {
      price: parseFloat(editForm.price),
      paymentPaid: parseFloat(editForm.paymentPaid),
      paymentMethod: editForm.paymentMethod,
      startDate: new Date(editForm.startDate),
      endDate: new Date(editForm.endDate),
      duration: editForm.duration,
      remarks: editForm.remarks,
      status: editForm.status
    })

    setIsUpdating(false)

    if (result.success) {
      toast.success('AMC updated successfully')
      onOpenChange(false)
      onSuccess()
    } else {
      toast.error(result.error || 'Failed to update AMC')
    }
  }

  if (!amc) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit AMC Details</DialogTitle>
          <DialogDescription>
            Update financial and contract details for #{amc.amcUniqueId || amc.id}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Status Section */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Status & Duration</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>AMC Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val) => setEditForm({ ...editForm, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={editForm.duration}
                  onValueChange={(val) => setEditForm({ ...editForm, duration: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6 months">6 Months</SelectItem>
                    <SelectItem value="1 year">1 Year</SelectItem>
                    <SelectItem value="2 years">2 Years</SelectItem>
                    <SelectItem value="3 years">3 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>End Date (Auto-calculated)</Label>
                <Input
                  type="date"
                  value={editForm.endDate}
                  disabled
                  className="bg-muted"
                />
              </div>
            </CardContent>
          </Card>

          {/* Financials */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Financials</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Price (₹)</Label>
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Amount Paid (₹)</Label>
                <Input
                  type="number"
                  value={editForm.paymentPaid}
                  onChange={(e) => setEditForm({ ...editForm, paymentPaid: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Amount Due (₹)</Label>
                <Input
                  value={editForm.paymentDue}
                  disabled
                  className={parseFloat(editForm.paymentDue) > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}
                />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={editForm.paymentMethod}
                  onValueChange={(val: any) => setEditForm({ ...editForm, paymentMethod: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="NET_BANKING">Net Banking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Remarks */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Remarks</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={editForm.remarks}
                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                placeholder="Enter any notes or remarks..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
