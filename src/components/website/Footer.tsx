import React from 'react'
import Link from 'next/link'
import { Droplet, MapPin, Phone, Mail, Clock } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 dark:text-gray-400 border-t dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Droplet className="h-8 w-8 text-blue-400 dark:text-blue-500" />
              <span className="text-xl font-bold text-white">
                Samarth Waterpurifier
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Leading provider of water purifier sales and services in Thane.
              Serving over 10,000 satisfied customers across Mumbai & Thane.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-blue-400 dark:hover:text-blue-500 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-400 dark:hover:text-blue-500 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-blue-400 dark:hover:text-blue-500 transition-colors text-sm">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-blue-400 dark:hover:text-blue-500 transition-colors text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 dark:hover:text-blue-500 transition-colors text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm">
              <li>Water Purifier Sales</li>
              <li>Installation Services</li>
              <li>Repair & Maintenance</li>
              <li>AMC Services</li>
              <li>RO, UV & UF Systems</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Office no-1, Om Niwas, Plot No 73, RSC 19/120, Svarakar Nagar,
                  Opp Sankalp School, Thane(W)- 400606
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400 dark:text-blue-500 flex-shrink-0" />
                <span className="text-sm">+91 XXXXX XXXXX</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400 dark:text-blue-500 flex-shrink-0" />
                <span className="text-sm">info@samarthwaterpurifier.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-400 dark:text-blue-500 flex-shrink-0" />
                <span className="text-sm">Mon - Sat: 9:00 AM - 7:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 dark:border-gray-900 mt-8 pt-8 text-center text-sm">
          <p>© 2021 Samarth Waterpurifier Sales & Services. All Rights Reserved</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
