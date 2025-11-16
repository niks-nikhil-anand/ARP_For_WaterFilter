import React from 'react'
import Navbar from '@/components/website/Navbar'
import Footer from '@/components/website/Footer'
import { Wrench, Settings, Shield, Users, CheckCircle, Phone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ServicesPage = () => {
  const services = [
    {
      icon: <Settings className="h-16 w-16 text-blue-600 dark:text-blue-400" />,
      title: 'Water Purifier Sales',
      description: 'We offer a comprehensive selection of water purifiers to suit every need and budget.',
      features: [
        'RO (Reverse Osmosis) Systems',
        'UV (Ultraviolet) Purifiers',
        'UF (Ultrafiltration) Systems',
        'Renowned brand products',
        'Expert product consultation',
        'Competitive pricing'
      ]
    },
    {
      icon: <Wrench className="h-16 w-16 text-blue-600 dark:text-blue-400" />,
      title: 'Installation Services',
      description: 'Professional installation by our skilled technicians ensures optimal performance from day one.',
      features: [
        'Safe and efficient installation',
        'Proper system setup',
        'Water quality testing',
        'Complete system demonstration',
        'Installation warranty',
        'Follow-up support'
      ]
    },
    {
      icon: <Shield className="h-16 w-16 text-blue-600 dark:text-blue-400" />,
      title: 'Repair & Maintenance',
      description: 'Expert repair services and regular maintenance to keep your water purifier running smoothly.',
      features: [
        'Quick response time',
        'Skilled technicians',
        'Genuine spare parts',
        'All brands serviced',
        'Filter replacement',
        'Performance optimization'
      ]
    },
    {
      icon: <Users className="h-16 w-16 text-blue-600 dark:text-blue-400" />,
      title: 'AMC Services',
      description: 'Annual Maintenance Contracts for hassle-free upkeep of your water purification system.',
      features: [
        'Regular service visits',
        'Priority support',
        'Discounted repairs',
        'Filter change reminders',
        'Free water quality checks',
        'Extended warranty options'
      ]
    }
  ]

  const benefits = [
    'Expert consultation and guidance',
    'Competitive pricing',
    'Quality products from top brands',
    'Professional installation',
    'Prompt service and support',
    'Serving 10,000+ satisfied customers',
    'Coverage across Mumbai & Thane',
    'Customized solutions for your needs'
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">Our Services</h1>
              <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
                Comprehensive water purification solutions for homes, offices, and industries in Thane
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                What We Offer
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                From sales to maintenance, we provide end-to-end water purification solutions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="border-2 dark:bg-gray-900 dark:border-gray-800 hover:border-blue-600 dark:hover:border-blue-400 transition-all">
                  <CardHeader>
                    <div className="mb-4">{service.icon}</div>
                    <CardTitle className="text-2xl dark:text-white">{service.title}</CardTitle>
                    <CardDescription className="text-base dark:text-gray-400">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Our Services?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Experience the Samarth Waterpurifier difference
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md border dark:border-gray-800 flex items-start space-x-3"
                >
                  <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Water Purification Systems */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Water Purification Systems We Offer
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-blue-50 dark:bg-gray-900 p-8 rounded-xl border-2 border-blue-200 dark:border-gray-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">RO Systems</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Reverse Osmosis systems that remove dissolved impurities, heavy metals, and bacteria
                  for the purest drinking water.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Removes up to 99% TDS</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Multi-stage filtration</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Best for hard water</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-gray-900 p-8 rounded-xl border-2 border-blue-200 dark:border-gray-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">UV Systems</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Ultraviolet purifiers that use UV rays to kill bacteria, viruses, and other microorganisms
                  without chemicals.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Chemical-free purification</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Kills 99.99% microorganisms</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Low maintenance</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-gray-900 p-8 rounded-xl border-2 border-blue-200 dark:border-gray-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">UF Systems</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Ultrafiltration systems that remove bacteria, cysts, and suspended particles while
                  retaining essential minerals.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">No electricity required</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Retains minerals</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Cost-effective</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600 dark:bg-blue-700 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Contact us today for a free consultation and find the perfect water purification solution for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg">
                <Phone className="mr-2 h-5 w-5" />
                Call Now: +91 XXXXX XXXXX
              </Button>
              <Button size="lg" variant="outline" className="text-lg border-white text-white hover:bg-white hover:text-blue-600">
                Request Quote
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default ServicesPage
