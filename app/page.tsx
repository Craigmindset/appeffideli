import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Services from "@/components/services"
import Footer from "@/components/footer"
import WhyChooseUs from "@/components/why-choose-us"
import FloatingButtons from "@/components/floating-buttons"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Services />
        <WhyChooseUs />
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  )
}

