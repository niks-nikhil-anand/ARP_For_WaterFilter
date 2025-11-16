import React from 'react'
import Navbar from '@/components/website/Navbar'
import HeroSection from '@/components/website/HeroSection'
import ServicesSection from '@/components/website/ServicesSection'
import WhyChooseUsSection from '@/components/website/WhyChooseUsSection'
import Footer from '@/components/website/Footer'

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <WhyChooseUsSection />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage