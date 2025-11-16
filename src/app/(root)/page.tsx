import React from 'react'
import Navbar from '@/components/website/Navbar'
import HeroSection from '@/components/website/HeroSection'
import ServicesSection from '@/components/website/ServicesSection'
import WhyChooseUsSection from '@/components/website/WhyChooseUsSection'
import BookingForm from '@/components/website/BookingForm'
import Footer from '@/components/website/Footer'

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <WhyChooseUsSection />
        <BookingForm />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage