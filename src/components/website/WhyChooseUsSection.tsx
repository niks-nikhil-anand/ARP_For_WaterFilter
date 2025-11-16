import React from 'react'
import { Award, Clock, ThumbsUp, Headphones, Star, MapPin } from 'lucide-react'

const WhyChooseUsSection = () => {
  const reasons = [
    {
      icon: <Award className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
      title: 'Wide Range of High-Quality Products',
      description: 'Comprehensive selection of RO, UV, and UF water purifiers from renowned brands known for reliability and efficiency.'
    },
    {
      icon: <Star className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
      title: 'Expert Sales & Consultation',
      description: 'Our expert team evaluates your water quality and needs to recommend the perfect system that fits your budget.'
    },
    {
      icon: <ThumbsUp className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
      title: 'Professional Installation',
      description: 'Skilled technicians handle installation with precision and care, ensuring optimal performance from day one.'
    },
    {
      icon: <Headphones className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
      title: 'Prompt & Quick Services',
      description: 'Our first priority is customer satisfaction with rapid response times and efficient service delivery.'
    },
    {
      icon: <Clock className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
      title: 'Customized Solutions',
      description: 'Water purification systems tailored to your specific needs, considering water quality, usage, and preferences.'
    },
    {
      icon: <MapPin className="h-10 w-10 text-blue-600 dark:text-blue-400" />,
      title: 'Local Expertise',
      description: 'Proudly serving Thane and surrounding areas with knowledge of local water conditions for better solutions.'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Samarth Waterpurifier?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Your trusted partner for clean and safe drinking water in Thane
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-xl transition-all border dark:border-gray-800"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  {reason.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {reason.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {reason.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 bg-blue-600 dark:bg-blue-500 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-2">10,000+</p>
              <p className="text-blue-100 dark:text-blue-50">Satisfied Customers</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">4+ Years</p>
              <p className="text-blue-100 dark:text-blue-50">Of Excellence</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">100%</p>
              <p className="text-blue-100 dark:text-blue-50">Customer Satisfaction</p>
            </div>
          </div>
        </div>

        {/* Office Location Highlight */}
        <div className="mt-12 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md border-l-4 border-blue-600 dark:border-blue-400 dark:border dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Visit Our Office</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            <strong>Address:</strong> Office no-1, Om Niwas, Plot No 73, RSC 19/120,
            Svarakar Nagar, Opp Sankalp School, Thane(W)- 400606
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            We are working with a satisfied customer base of more than 10 thousand all over Mumbai & Thane.
          </p>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUsSection
