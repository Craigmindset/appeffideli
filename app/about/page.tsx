import Image from "next/image"
import { Target, Award, Briefcase, Baby, Home, Apple } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 bg-primary/5">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-center lg:text-left">
                  Transforming Home Management for Modern Living
                </h1>
                <p className="text-base text-gray-600 text-justify">
                  At EffiDeli, we specialize in household chores routine management, curated meal subscriptions, and
                  customized recipes, ensuring you spend less time worrying about daily tasks and more time enjoying
                  life. Whether you need a structured cleaning schedule, nutritious meal plans for your family, or
                  specialized recipes for infants, we provide expert-driven solutions tailored to your lifestyle. Our
                  mission is to make home management and meal planning effortless, enjoyable, and highly efficient,
                  helping you maintain a healthy, well-organized home with ease.
                </p>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2149230513.jpg-attFUM9iJbmQJpp71o07P34hhsSjmi.jpeg"
                  alt="Effideli team members"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Mission & Values</h2>
              <div className="w-24 h-1 bg-primary mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Mission</h3>
                <p className="text-gray-600">
                  At EffiDeli, we empower individuals and families with expertly crafted meal plans, structured
                  household management systems, and personalized culinary experiences. Through efficiency, innovation,
                  and customer-focused solutions, we simplify daily routines, ensuring healthier and more balanced
                  living.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
                <div className="p-3 rounded-full bg-primary/10 mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Vision</h3>
                <p className="text-gray-600">
                  To revolutionize home management and meal planning by providing seamless, time-saving solutions that
                  enhance family well-being and lifestyle convenience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Audience Section */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Audience</h2>
              <div className="w-24 h-1 bg-primary mx-auto mb-6" />
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                We're dedicated to serving diverse needs with tailored solutions that make a real difference in people's
                lives.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center p-6 bg-gray-800 rounded-lg">
                <div className="p-3 rounded-full bg-primary/20 mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <p className="text-gray-300">Busy professionals looking for structured meal plans</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-gray-800 rounded-lg">
                <div className="p-3 rounded-full bg-primary/20 mb-4">
                  <Baby className="h-8 w-8 text-primary" />
                </div>
                <p className="text-gray-300">New parents seeking tailored infant nutrition</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-gray-800 rounded-lg">
                <div className="p-3 rounded-full bg-primary/20 mb-4">
                  <Home className="h-8 w-8 text-primary" />
                </div>
                <p className="text-gray-300">Families needing an easier way to manage household chores</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-gray-800 rounded-lg">
                <div className="p-3 rounded-full bg-primary/20 mb-4">
                  <Apple className="h-8 w-8 text-primary" />
                </div>
                <p className="text-gray-300">Health-conscious individuals wanting custom recipes</p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-[500px] rounded-lg overflow-hidden">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/45519.jpg-DIalqoHMrDSfB4d0xTTYuTYN2yYSNM.jpeg"
                  alt="Our story"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Message from the Founder</h2>
                <div className="w-24 h-1 bg-primary" />
                <p className="text-lg text-gray-600">
                  "EffiDeli was created from a passion for making everyday living simpler and more efficient. We
                  understand the importance of structure, nutrition, and balance in a busy world, and we are here to
                  take the burden off your shoulders. Let us help you create a home that runs effortlessly while you
                  focus on what truly matters."
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

