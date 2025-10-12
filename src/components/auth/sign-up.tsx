"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2

  // User Information
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [mobile, setMobile] = useState("")
  const [role, setRole] = useState("")

  // Address Information
  const [addressType, setAddressType] = useState("")
  const [pincode, setPincode] = useState("")
  const [landmark, setLandmark] = useState("")
  const [apartmentNo, setApartmentNo] = useState("")
  const [state, setState] = useState("")
  const [country, setCountry] = useState("")
  const [locality, setLocality] = useState("")
  const [phone, setPhone] = useState("")
  const [altPhone, setAltPhone] = useState("")

  const handleNext = () => {
    // Validate Step 1
    if (currentStep === 1) {
      if (!name || !email || !password || !confirmPassword || !role) {
        alert("Please fill in all required fields!")
        return
      }
      if (password !== confirmPassword) {
        alert("Passwords do not match!")
        return
      }
    }
    setCurrentStep(currentStep + 1)
  }

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const userData = {
      name,
      email,
      password,
      mobile,
      role,
      address: {
        type: addressType,
        pincode,
        landmark,
        apartmentNo,
        state,
        country,
        locality,
        phone,
        altPhone
      }
    }
    
    console.log(userData)
    // Add your registration logic here
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8'>
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            Step {currentStep} of {totalSteps}: {currentStep === 1 ? 'Personal Information' : 'Address Details'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Please provide your basic details to create your account. This information will be used to identify you and secure your account.
                  </p>
                </div>
                
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>Select Role *</Label>
                  <RadioGroup value={role} onValueChange={setRole} required>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin" id="admin" />
                      <Label htmlFor="admin" className="cursor-pointer font-normal">
                        Admin
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="shop-owner" id="shop-owner" />
                      <Label htmlFor="shop-owner" className="cursor-pointer font-normal">
                        Shop Owner
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="agent" id="agent" />
                      <Label htmlFor="agent" className="cursor-pointer font-normal">
                        Agent
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Address Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Address Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your address details to help us serve you better. This information is optional but recommended for a complete profile.
                  </p>
                </div>

                {/* Address Type */}
                <div className="space-y-2">
                  <Label htmlFor="addressType">Address Type</Label>
                  <Select value={addressType} onValueChange={setAddressType}>
                    <SelectTrigger id="addressType">
                      <SelectValue placeholder="Select address type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Apartment/Flat No */}
                <div className="space-y-2">
                  <Label htmlFor="apartmentNo">Apartment/Flat No</Label>
                  <Input
                    id="apartmentNo"
                    type="text"
                    placeholder="Enter apartment or flat number"
                    value={apartmentNo}
                    onChange={(e) => setApartmentNo(e.target.value)}
                  />
                </div>

                {/* Locality */}
                <div className="space-y-2">
                  <Label htmlFor="locality">Locality/Area</Label>
                  <Input
                    id="locality"
                    type="text"
                    placeholder="Enter locality or area"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                  />
                </div>

                {/* Landmark */}
                <div className="space-y-2">
                  <Label htmlFor="landmark">Landmark</Label>
                  <Input
                    id="landmark"
                    type="text"
                    placeholder="Enter nearby landmark"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </div>

                {/* Pincode and State in Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      type="text"
                      placeholder="Enter pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      type="text"
                      placeholder="Enter state"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                </div>

                {/* Country */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    type="text"
                    placeholder="Enter country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>

                {/* Phone Numbers in Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="altPhone">Alternate Phone</Label>
                    <Input
                      id="altPhone"
                      type="tel"
                      placeholder="Alternate phone"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  className="w-full sm:w-auto"
                >
                  Previous
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto ml-auto"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="w-full sm:w-auto ml-auto"
                >
                  Create Account
                </Button>
              )}
            </div>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <a href="/auth/sign-in" className="text-primary hover:underline">
              Sign In
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignUp
