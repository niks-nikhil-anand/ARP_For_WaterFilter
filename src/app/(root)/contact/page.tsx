'use client'

import React, { useState } from 'react'
import Navbar from '@/components/website/Navbar'
import Footer from '@/components/website/Footer'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })
  }

  const contactInfo = [
    {
      icon: <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      title: 'Visit Us',
      content: 'Office no-1, Om Niwas, Plot No 73, RSC 19/120, Svarakar Nagar, Opp Sankalp School, Thane(W)- 400606'
    },
    {
      icon: <Phone className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      title: 'Call Us',
      content: '+91 XXXXX XXXXX',
      link: 'tel:+91XXXXXXXXXX'
    },
    {
      icon: <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      title: 'Email Us',
      content: 'info@samarthwaterpurifier.com',
      link: 'mailto:info@samarthwaterpurifier.com'
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
      title: 'Working Hours',
      content: 'Monday - Saturday: 9:00 AM - 7:00 PM\nSunday: Closed'
    }
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">Contact Us</h1>
              <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
                Get in touch with us for all your water purification needs
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information Cards */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  className="overflow-hidden relative text-center dark:bg-gray-900 dark:border-gray-800 transform hover:-translate-y-1 hover:shadow-2xl transition-transform duration-200"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-emerald-400" />
                  <CardHeader className="pt-6">
                    <div className="flex justify-center mb-4">
                      <div className="h-14 w-14 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-800">
                        {info.icon}
                      </div>
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">{info.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2">
                    {info.link ? (
                      <a
                        href={info.link}
                        className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-pre-line block"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{info.content}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Map & Additional Info - responsive layout (Quick Contact + Assistance) */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 max-w-4xl mx-auto">
              <div className="relative overflow-hidden rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-emerald-400" />
                <div className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-800 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Samarth Waterpurifier Sales & Services</h3>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">Office no-1, Om Niwas, Plot No 73, RSC 19/120, Svarakar Nagar, Opp Sankalp School, Thane(W)- 400606</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a href="tel:+91XXXXXXXXXX" className="inline-block">
                      <Button  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 py-4">
                        <Phone className="mr-2 h-5 w-5" />
                        Call Now
                      </Button>
                    </a>

                    <a href="https://www.google.com/maps/dir/?api=1&destination=Office+no-1,+Om+Niwas,+Plot+No+73,+RSC+19/120,+Svarakar+Nagar,+Opp+Sankalp+School,+Thane+W,+400606" target="_blank" rel="noreferrer" className="inline-block">
                      <Button variant="secondary"  className="w-full py-4">
                        Get Directions
                      </Button>
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-500 to-pink-600 dark:from-rose-600 dark:to-pink-700 p-8 rounded-xl shadow-2xl text-white">
                <h3 className="text-2xl font-bold mb-4">Need Immediate Assistance?</h3>
                <p className="text-rose-50 mb-6">For urgent service requests or emergency repairs, call us directly. We're here to help!</p>
                <Button variant="secondary" size="lg" className="w-full bg-white text-pink-600 hover:bg-gray-100">
                  <Phone className="mr-2 h-5 w-5" />
                  Call Now
                </Button>
              </div>
            </div>
          </div>
        </section>
        {/* Service Areas */}
        <section className="py-20 bg-white dark:bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Service Areas
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                We proudly serve customers across Mumbai & Thane
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {['Thane West', 'Thane East', 'Kalyan', 'Dombivli', 'Mumbai Suburbs', 'Navi Mumbai', 'Bhiwandi', 'Ulhasnagar'].map((area, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center border dark:border-gray-800"
                >
                  <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-gray-700 dark:text-gray-300 font-medium">{area}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default ContactPage
