import Hero from "@/components/hero"
import WhatIsSuperBeast from "@/components/what-is-super-beast"
import About from "@/components/about"
import Modalities from "@/components/modalities"
import Instructors from "@/components/instructors"
import Branches from "@/components/branches"
import Gallery from "@/components/gallery"
import Contact from "@/components/contact"

export default function HomePage() {
  return (
    <main className="bg-black">
      <Hero />
      <WhatIsSuperBeast />
      <About />
      <Modalities />
      <Instructors />
      <Branches />
      <Gallery />
      <Contact />
    </main>
  )
}
