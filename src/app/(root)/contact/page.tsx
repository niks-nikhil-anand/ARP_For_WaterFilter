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
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {contactInfo.map((info, index) => (
                <Card key={index} className="text-center dark:bg-gray-900 dark:border-gray-800">
                  <CardHeader>
                    <div className="flex justify-center mb-4">{info.icon}</div>
                    <CardTitle className="text-xl dark:text-white">{info.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {info.link ? (
                      <a
                        href={info.link}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-pre-line"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {info.content}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Map Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Send Us a Message
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-gray-900 dark:text-white">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-900 dark:text-white">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-gray-900 dark:text-white">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-gray-900 dark:text-white">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="mt-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      placeholder="What is this regarding?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-gray-900 dark:text-white">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="mt-2 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Map & Additional Info */}
              <div className="space-y-8">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border dark:border-gray-800">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Our Location
                  </h3>
                  <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                    <MapPin className="h-16 w-16 text-gray-400" />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    <strong>Samarth Waterpurifier Sales & Services</strong>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Office no-1, Om Niwas, Plot No 73, RSC 19/120, Svarakar Nagar,
                    Opp Sankalp School, Thane(W)- 400606
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg border dark:border-gray-800">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Quick Contact
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone</p>
                      <a
                        href="tel:+91XXXXXXXXXX"
                        className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        +91 XXXXX XXXXX
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                      <a
                        href="mailto:info@samarthwaterpurifier.com"
                        className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        info@samarthwaterpurifier.com
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Working Hours</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        Monday - Saturday<br />
                        9:00 AM - 7:00 PM
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600 dark:bg-blue-700 p-8 rounded-xl shadow-lg text-white">
                  <h3 className="text-2xl font-bold mb-4">Need Immediate Assistance?</h3>
                  <p className="text-blue-100 mb-6">
                    For urgent service requests or emergency repairs, call us directly.
                    We're here to help!
                  </p>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                  >
                    <Phone className="mr-2 h-5 w-5" />
                    Call Now
                  </Button>
                </div>
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
