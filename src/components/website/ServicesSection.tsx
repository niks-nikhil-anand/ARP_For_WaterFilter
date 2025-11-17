import React from 'react'
import { Wrench, Home, Building2, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ServicesSection = () => {
  const services = [
    {
      icon: <Home className="h-12 w-12 text-blue-600 dark:text-blue-400" />,
      title: 'Domestic RO, UV Sales',
      description: 'Best quality Water Aquaguard DOMESTIC RO, UV, SALES services provided to customers as per their requirements. Perfect solutions for homes and families.'
    },
    {
      icon: <Building2 className="h-12 w-12 text-green-600 dark:text-green-400" />,
      title: 'Commercial RO, UV Sales',
      description: 'Best quality Water Aquaguard COMMERCIAL RO, UV, SALES services provided to customers as per their requirements. Ideal for offices, restaurants, and businesses.'
    },
    {
      icon: <Wrench className="h-12 w-12 text-orange-600 dark:text-orange-400" />,
      title: 'RO, UV Maintenance & Services',
      description: 'Best quality Water Aquaguard RO, UV MAINTENANCE & SERVICES provided to customers as per their requirements. Regular upkeep and expert repairs.'
    },
    {
      icon: <Shield className="h-12 w-12 text-purple-600 dark:text-purple-400" />,
      title: 'AMC Services',
      description: 'Comprehensive Annual Maintenance Contracts for both domestic and commercial water purifiers. Priority support with regular check-ups and servicing.'
    }
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-100 dark:bg-blue-950 px-4 py-2 rounded-full mb-4">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Authorized Aquaguard Service Provider
            </p>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Best quality Water Aquaguard solutions provided as per customer requirements
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const borderColors = [
              'hover:border-blue-600 dark:hover:border-blue-400',
              'hover:border-green-600 dark:hover:border-green-400',
              'hover:border-orange-600 dark:hover:border-orange-400',
              'hover:border-purple-600 dark:hover:border-purple-400'
            ]
            const bgGradients = [
              'hover:bg-gradient-to-br hover:from-blue-50 hover:to-transparent dark:hover:from-blue-950 dark:hover:to-transparent',
              'hover:bg-gradient-to-br hover:from-green-50 hover:to-transparent dark:hover:from-green-950 dark:hover:to-transparent',
              'hover:bg-gradient-to-br hover:from-orange-50 hover:to-transparent dark:hover:from-orange-950 dark:hover:to-transparent',
              'hover:bg-gradient-to-br hover:from-purple-50 hover:to-transparent dark:hover:from-purple-950 dark:hover:to-transparent'
            ]

            return (
              <Card
                key={index}
                className={`border-2 transition-all hover:shadow-xl transform hover:-translate-y-1 dark:bg-gray-900 dark:border-gray-800 ${borderColors[index]} ${bgGradients[index]}`}
              >
                <CardHeader>
                  <div className="mb-4 transform transition-transform hover:scale-110">{service.icon}</div>
                  <CardTitle className="text-xl dark:text-white">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-8 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Aquaguard?
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-4xl mx-auto">
              We are authorized service providers for Aquaguard water purifiers, offering genuine parts,
              expert technicians, and comprehensive solutions for both domestic and commercial needs.
              Trust us for the best quality RO and UV water purification services.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
