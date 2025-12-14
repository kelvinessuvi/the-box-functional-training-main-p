import Hero from "@/components/hero"
import About from "@/components/about"
import Partners from "@/components/partners"
import Modalities from "@/components/modalities"
import Instructors from "@/components/instructors"
import Branches from "@/components/branches"
import Gallery from "@/components/gallery"
import Contact from "@/components/contact"

export default function HomePage() {
  return (
    <main className="bg-black">
      <Hero />
      <About />
      <Partners />
      <Modalities />
      <Instructors />
      <Branches />
      <Gallery />
      <Contact />
    </main>
  )
}
