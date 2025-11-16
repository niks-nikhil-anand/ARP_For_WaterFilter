import React from 'react'
import { Wrench, Settings, Shield, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ServicesSection = () => {
  const services = [
    {
      icon: <Settings className="h-12 w-12 text-blue-600 dark:text-blue-400" />,
      title: 'Sales & Installation',
      description: 'Wide range of high-quality water purifiers including RO, UV, and UF systems from renowned brands. Professional installation services ensuring optimal performance.'
    },
    {
      icon: <Wrench className="h-12 w-12 text-blue-600 dark:text-blue-400" />,
      title: 'Repair & Maintenance',
      description: 'Expert repair services for all types of water purifiers. Our skilled technicians ensure your system runs smoothly with regular maintenance and quick repairs.'
    },
    {
      icon: <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400" />,
      title: 'AMC Services',
      description: 'Comprehensive Annual Maintenance Contracts to keep your water purifier in perfect condition year-round with regular check-ups and priority service.'
    },
    {
      icon: <Users className="h-12 w-12 text-blue-600 dark:text-blue-400" />,
      title: 'Expert Consultation',
      description: 'Free consultation to evaluate your water quality and purification needs. We recommend the best system that fits your budget and requirements.'
    }
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Comprehensive water purification solutions tailored to your needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="border-2 hover:border-blue-600 dark:hover:border-blue-400 transition-all hover:shadow-lg dark:bg-gray-900 dark:border-gray-800">
              <CardHeader>
                <div className="mb-4">{service.icon}</div>
                <CardTitle className="text-xl dark:text-white">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ServicesSection
