'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export type ShopFormData = {
  name: string
  email: string
  mobile: string
  password?: string
  confirmPassword?: string
  status?: string
  shopName: string
  alternateMobile: string
  gstNumber: string
  panNumber: string
  address: {
    apartmentNo: string
    locality: string
    state: string
    country: string
    pincode: string
    phone: string
  }
}

interface ShopFormProps {
  initialData?: Partial<ShopFormData>
  onSubmit: (data: ShopFormData) => void
  isSubmitting?: boolean
  mode: 'add' | 'edit'
  onCancel: () => void
}

const defaultFormData: ShopFormData = {
  name: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  status: 'ACTIVE',
  shopName: '',
  alternateMobile: '',
  gstNumber: '',
  panNumber: '',
  address: {
    apartmentNo: '',
    locality: '',
    state: '',
    country: 'India',
    pincode: '',
    phone: '',
  },
}

export const ShopForm: React.FC<ShopFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  mode,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ShopFormData>(defaultFormData)

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        address: {
          ...prev.address,
          ...(initialData.address || {}),
        },
      }))
    }
  }, [initialData])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Owner Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Owner Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter owner name"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-12 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                +91
              </div>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                  handleChange('mobile', value)
                }}
                placeholder="98765 43210"
                disabled={isSubmitting}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="owner@email.com"
              required
              disabled={isSubmitting}
            />
          </div>

          {mode === 'add' && (
            <>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Enter password"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          {mode === 'edit' && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Shop Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shopName">Shop Name</Label>
            <Input
              id="shopName"
              value={formData.shopName}
              onChange={(e) => handleChange('shopName', e.target.value)}
              placeholder="Enter shop name"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alternateMobile">Alternate Mobile</Label>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-12 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                +91
              </div>
              <Input
                id="alternateMobile"
                value={formData.alternateMobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                  handleChange('alternateMobile', value)
                }}
                placeholder="98765 43210"
                disabled={isSubmitting}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gstNumber">GST Number</Label>
            <Input
              id="gstNumber"
              value={formData.gstNumber}
              onChange={(e) => handleChange('gstNumber', e.target.value)}
              placeholder="Enter GST number"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="panNumber">PAN Number</Label>
            <Input
              id="panNumber"
              value={formData.panNumber}
              onChange={(e) => handleChange('panNumber', e.target.value)}
              placeholder="Enter PAN number"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="text-sm font-semibold text-muted-foreground">Address Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="locality">Locality/Area</Label>
            <Input
              id="locality"
              value={formData.address.locality}
              onChange={(e) => handleAddressChange('locality', e.target.value)}
              placeholder="Enter locality or area"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apartmentNo">Apartment/Building No</Label>
            <Input
              id="apartmentNo"
              value={formData.address.apartmentNo}
              onChange={(e) => handleAddressChange('apartmentNo', e.target.value)}
              placeholder="Apt/Building No"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={formData.address.pincode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                handleAddressChange('pincode', value)
              }}
              placeholder="Enter 6-digit pincode"
              maxLength={6}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.address.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              placeholder="Enter state"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.address.country}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              placeholder="Enter country"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
              value={formData.address.phone}
              onChange={(e) => handleAddressChange('phone', e.target.value)}
              placeholder="Landline or other contact"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'add' ? 'Create Shop' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
