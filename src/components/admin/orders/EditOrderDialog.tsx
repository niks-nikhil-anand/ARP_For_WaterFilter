'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Pencil } from 'lucide-react'
import { updateOrderDetails } from '@/actions/common/orders'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface EditOrderDialogProps {
  order: {
    id: number
    customerName: string
    customerEmail: string | null
    customerPhone: string | null
    customerAltPhone: string | null
    addressType: string | null
    apartmentNo: string | null
    locality: string | null
    landmark: string | null
    pincode: string | null
    state: string | null
    country: string | null
    paymentStatus: string
    transactionId: string | null
    freeInstallation: boolean
    installationCompleted: boolean
    freeWarranty: boolean
    additionalWarranty: boolean
    amcPurchased: boolean
    selectedAdditionalWarranty: string | null
    selectedAMC: string | null
  }
}

export function EditOrderDialog({ order }: EditOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: order.customerName || '',
    customerEmail: order.customerEmail || '',
    customerPhone: order.customerPhone || '',
    customerAltPhone: order.customerAltPhone || '',
    addressType: order.addressType || 'home',
    apartmentNo: order.apartmentNo || '',
    locality: order.locality || '',
    landmark: order.landmark || '',
    pincode: order.pincode || '',
    state: order.state || '',
    country: order.country || '',
    paymentStatus: order.paymentStatus,
    transactionId: order.transactionId || '',
    freeInstallation: order.freeInstallation,
    installationCompleted: order.installationCompleted,
    freeWarranty: order.freeWarranty,
    additionalWarranty: order.additionalWarranty,
    amcPurchased: order.amcPurchased,
    selectedAdditionalWarranty: order.selectedAdditionalWarranty || 'none',
    selectedAMC: order.selectedAMC || 'none',
  })
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateOrderDetails(order.id, formData)

      if (result.success) {
        toast.success('Order updated successfully')
        setOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update order')
      }
    } catch (error) {
      toast.error('An error occurred while updating the order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4 mr-2" />
          Edit Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Order Details</DialogTitle>
          <DialogDescription>
            Update customer information, address, and order configuration.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Customer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Name</Label>
                <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input id="customerEmail" name="customerEmail" value={formData.customerEmail} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input id="customerPhone" name="customerPhone" value={formData.customerPhone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerAltPhone">Alt Phone</Label>
                <Input id="customerAltPhone" name="customerAltPhone" value={formData.customerAltPhone} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressType">Address Type</Label>
                 <Select value={formData.addressType} onValueChange={(val) => handleSelectChange('addressType', val)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apartmentNo">Apartment/House No</Label>
                <Input id="apartmentNo" name="apartmentNo" value={formData.apartmentNo} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locality">Locality</Label>
                <Input id="locality" name="locality" value={formData.locality} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input id="landmark" name="landmark" value={formData.landmark} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" value={formData.state} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" value={formData.country} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={formData.paymentStatus} onValueChange={(val) => handleSelectChange('paymentStatus', val)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input id="transactionId" name="transactionId" value={formData.transactionId} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Order Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="freeInstallation" checked={formData.freeInstallation} onCheckedChange={(checked) => handleCheckboxChange('freeInstallation', checked as boolean)} />
                <Label htmlFor="freeInstallation">Free Installation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="installationCompleted" checked={formData.installationCompleted} onCheckedChange={(checked) => handleCheckboxChange('installationCompleted', checked as boolean)} />
                <Label htmlFor="installationCompleted">Installation Completed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="freeWarranty" checked={formData.freeWarranty} onCheckedChange={(checked) => handleCheckboxChange('freeWarranty', checked as boolean)} />
                <Label htmlFor="freeWarranty">Free Warranty</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="additionalWarranty" checked={formData.additionalWarranty} onCheckedChange={(checked) => handleCheckboxChange('additionalWarranty', checked as boolean)} />
                <Label htmlFor="additionalWarranty">Additional Warranty Purchased</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="amcPurchased" checked={formData.amcPurchased} onCheckedChange={(checked) => handleCheckboxChange('amcPurchased', checked as boolean)} />
                <Label htmlFor="amcPurchased">AMC Purchased</Label>
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
               <div className="space-y-2">
                <Label htmlFor="selectedAdditionalWarranty">Selected Warranty Plan</Label>
                <Select value={formData.selectedAdditionalWarranty || 'none'} onValueChange={(val) => handleSelectChange('selectedAdditionalWarranty', val)}>
                  <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="2year">2 Years</SelectItem>
                    <SelectItem value="3year">3 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="selectedAMC">Selected AMC Plan</Label>
                <Select value={formData.selectedAMC || 'none'} onValueChange={(val) => handleSelectChange('selectedAMC', val)}>
                  <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="2year">2 Years</SelectItem>
                    <SelectItem value="3year">3 Years</SelectItem>
                    <SelectItem value="5year">5 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
             </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
