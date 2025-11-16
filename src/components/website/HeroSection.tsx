import React from 'react'
import { Button } from '@/components/ui/button'
import { Droplet, Phone, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Droplet className="h-4 w-4" />
              <span>Serving Thane Since 2021</span>
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              WELCOME TO <span className="text-blue-600 dark:text-blue-400">Samarth Waterpurifier</span> Sales & Services
            </h1>

            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
              Clean Water for a Healthier Life
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              At Samarth Waterpurifier, we believe that access to clean and safe drinking water
              is a fundamental necessity for good health. As one of the leading providers of water
              purifier sales and services in Thane, we are dedicated to offering top-quality water
              purification solutions to homes, offices, and industries in the region.
            </p>

            {/* Key Features */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">10,000+ Satisfied Customers</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Expert Installation & Repair Services</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">RO, UV & UF Water Purification Systems</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">Serving Mumbai & Thane</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-lg">
                <Phone className="mr-2 h-5 w-5" />
                Contact Us Now
              </Button>
              <Button size="lg" variant="outline" className="text-lg dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                Explore Services
              </Button>
            </div>

            {/* Contact Info */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md inline-block border dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Call us for immediate assistance</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+91 XXXXX XXXXX</p>
            </div>
          </div>

          {/* Right Content - Image/Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700 rounded-2xl p-8 shadow-2xl">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-8 space-y-6">
                <div className="flex items-center justify-center">
                  <Droplet className="h-32 w-32 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Premium Water Solutions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Trusted by over 10,000 families across Mumbai & Thane
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">10K+</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Customers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">4+</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Years</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">100%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Satisfaction</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-200 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-300 rounded-full opacity-50 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
