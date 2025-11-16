import React from 'react'
import Navbar from '@/components/website/Navbar'
import Footer from '@/components/website/Footer'
import { Droplet, Users, Award, Target, Heart, Shield } from 'lucide-react'

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">About Us</h1>
              <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
                Your Trusted Partner for Clean and Safe Drinking Water in Thane
              </p>
            </div>
          </div>
        </section>

        {/* Company Introduction */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 shadow-xl">
                  <div className="bg-white rounded-xl p-8 flex items-center justify-center">
                    <Droplet className="h-48 w-48 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Samarth Waterpurifier Sales & Services in Thane
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  At Samarth Waterpurifier, we believe that access to clean and safe drinking
                  water is a fundamental necessity for good health. As one of the leading providers
                  of water purifier sales and services in Thane, we are dedicated to offering
                  top-quality water purification solutions to homes, offices, and industries in the region.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Whether you need a new water purifier installation or expert repair and maintenance
                  services, Samarth Waterpurifier is your trusted partner for all things related to
                  water purification.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Our Mission & Values
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <div className="flex justify-center mb-4">
                  <Target className="h-16 w-16 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600">
                  To provide every household and business in Thane with access to clean,
                  safe drinking water through reliable purification solutions and exceptional service.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <div className="flex justify-center mb-4">
                  <Heart className="h-16 w-16 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Customer First</h3>
                <p className="text-gray-600">
                  Our first priority is to satisfy customers with our prompt and quick services.
                  We believe in building long-term relationships based on trust and reliability.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-md text-center">
                <div className="flex justify-center mb-4">
                  <Shield className="h-16 w-16 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quality Assurance</h3>
                <p className="text-gray-600">
                  We offer only high-quality products from renowned brands and ensure every
                  installation and service meets the highest standards of excellence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Samarth Waterpurifier?
              </h2>
            </div>

            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  1. Wide Range of High-Quality Water Purifiers
                </h3>
                <p className="text-gray-700">
                  We offer a comprehensive selection of water purifiers, including RO (Reverse Osmosis)
                  systems, UV (Ultraviolet) purifiers, and UF (Ultrafiltration) systems. Our products
                  come from renowned brands that are known for their reliability, efficiency, and durability.
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  2. Expert Sales and Consultation
                </h3>
                <p className="text-gray-700">
                  Our expert sales team is always ready to guide you through the selection process.
                  We will evaluate your water quality and your purification needs to recommend the
                  best system that fits your budget and requirements.
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  3. Professional Installation Services
                </h3>
                <p className="text-gray-700">
                  Our skilled technicians handle the installation process efficiently and safely.
                  We understand that proper installation is key to the long-term performance of
                  your purifier, ensuring optimal function from day one.
                </p>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  4. Water Purification Systems Tailored to Your Needs
                </h3>
                <p className="text-gray-700">
                  We offer customized solutions to ensure that every customer receives a purifier
                  that's right for them. Our team takes into account factors such as water quality,
                  usage, and preferences before recommending a system.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Service Area */}
        <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Serving Thane with Pride
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                As a locally operated business, we are proud to serve the Thane community
                and surrounding areas.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Our Office Location</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>Address:</strong> Office no-1, Om Niwas, Plot No 73, RSC 19/120,
                    Svarakar Nagar, Opp Sankalp School, Thane(W)- 400606
                  </p>
                  <p className="text-gray-700">
                    Our team is familiar with the local water conditions, which allows us to
                    provide better guidance and solutions tailored to the region.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Service Coverage</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Thane West</li>
                    <li>• Thane East</li>
                    <li>• Kalyan</li>
                    <li>• Mumbai & Surrounding Areas</li>
                    <li>• 10,000+ Satisfied Customers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <Users className="h-16 w-16 mx-auto mb-4" />
                <p className="text-5xl font-bold mb-2">10,000+</p>
                <p className="text-xl text-blue-100">Satisfied Customers</p>
              </div>
              <div>
                <Award className="h-16 w-16 mx-auto mb-4" />
                <p className="text-5xl font-bold mb-2">4+ Years</p>
                <p className="text-xl text-blue-100">Of Excellence</p>
              </div>
              <div>
                <Shield className="h-16 w-16 mx-auto mb-4" />
                <p className="text-5xl font-bold mb-2">100%</p>
                <p className="text-xl text-blue-100">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Get in Touch with Us Today
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              If you're looking for water purifier sales and services in Thane, look no further
              than Samarth Waterpurifier. Our team is here to help you find the perfect water
              purification solution and provide the best after-sales services to keep your system
              running smoothly.
            </p>
            <p className="text-2xl font-bold text-blue-600 mb-8">
              Clean water is just a call away!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact Us
              </a>
              <a
                href="/services"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                View Services
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default AboutPage
