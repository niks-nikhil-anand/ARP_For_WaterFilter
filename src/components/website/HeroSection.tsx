import React from 'react'
import { Button } from '@/components/ui/button'
import { Droplet, Phone, CheckCircle, Star, Award, Shield } from 'lucide-react'
import Link from 'next/link'

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 lg:py-32 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 dark:bg-blue-800 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100 to-transparent dark:from-blue-950 dark:to-transparent rounded-full opacity-30 blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:shadow-xl transition-shadow">
              <Droplet className="h-4 w-4 animate-bounce" />
              <span>Serving Thane Since 2021</span>
              <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
            </div>

            <div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                <span className="block mb-2">WELCOME TO</span>
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Samarth Waterpurifier
                </span>
                <span className="block text-3xl lg:text-4xl xl:text-5xl mt-2 text-gray-700 dark:text-gray-300">
                  Sales & Services
                </span>
              </h1>

              <div className="flex items-center space-x-2 mt-4">
                <div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"></div>
                <Droplet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"></div>
              </div>
            </div>

            <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
              Clean Water for a Healthier Life 💧
            </p>

            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              At Samarth Waterpurifier, we believe that access to clean and safe drinking water
              is a fundamental necessity for good health. As one of the leading providers of water
              purifier sales and services in Thane, we are dedicated to offering top-quality water
              purification solutions to homes, offices, and industries in the region.
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">10,000+ Customers</span>
              </div>
              <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Expert Services</span>
              </div>
              <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="bg-cyan-100 dark:bg-cyan-900 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">RO, UV & UF Systems</span>
              </div>
              <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700">
                <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Mumbai & Thane</span>
              </div>
            </div>
          </div>

          {/* Right Content - Image/Visual */}
          <div className="relative lg:block hidden">
            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 dark:from-blue-500 dark:via-blue-600 dark:to-blue-800 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-400 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 space-y-6 relative z-10 shadow-xl">
                {/* Animated Droplet */}
                <div className="flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 blur-2xl animate-pulse"></div>
                  <Droplet className="h-32 w-32 text-blue-600 dark:text-blue-400 relative z-10 drop-shadow-lg animate-bounce" />
                </div>

                <div className="text-center">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                    Premium Water Solutions
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Trusted by over 10,000 families across Mumbai & Thane
                  </p>
                </div>

                {/* Stats with Icons */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-4 rounded-xl">
                    <Award className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">10K+</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">Customers</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 p-4 rounded-xl">
                    <Star className="h-6 w-6 text-cyan-600 dark:text-cyan-400 mx-auto mb-2 fill-cyan-600 dark:fill-cyan-400" />
                    <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">4+</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">Years</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-xl">
                    <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">100%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">Satisfaction</p>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">5.0 Rating</span>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-400 rounded-full opacity-30 blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-cyan-400 rounded-full opacity-30 blur-2xl animate-pulse delay-700"></div>

            {/* Floating Badge */}
            <div className="absolute -top-8 -left-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full shadow-xl transform rotate-12 hover:rotate-0 transition-transform">
              <p className="text-sm font-bold">✓ Verified</p>
            </div>

            {/* Floating Badge 2 */}
            <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full shadow-xl transform -rotate-12 hover:rotate-0 transition-transform">
              <p className="text-sm font-bold">🏆 Top Rated</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
