import Hero from "@/components/hero"
import WhatIsSuperBeast from "@/components/what-is-super-beast"
import About from "@/components/about"
import Founders from "@/components/founders"
import Packages from "@/components/packages"
import HowItWorks from "@/components/how-it-works"
import Gallery from "@/components/gallery"
import Testimonials from "@/components/testimonials"
import PersonalizedOffer from "@/components/personalized-offer"
import Contact from "@/components/contact"

export default function HomePage() {
  return (
    <main className="bg-white">
      <Hero />
      <WhatIsSuperBeast />
      <About />
      <Founders />
      <Packages />
      <HowItWorks />
      <Gallery />
      <Testimonials />
      <PersonalizedOffer />
      <Contact />
    </main>
  )
}
