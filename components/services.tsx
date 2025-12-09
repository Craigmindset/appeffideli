import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Services() {
  const services = [
    {
      title: "Household Chores Routine Management",
      description:
        "Are you struggling to keep up with house chores? Our structured Household Chores Routine Management plan provides customized cleaning schedules based on your home type, ensuring efficiency and consistency.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/30286.jpg-vhmf07MH4i4JgOFTn71c3MUUWSC2UJ.jpeg",
      href: "/services#household-chores",
    },
    {
      title: "Monthly Home Meal Subscription / Weekly Home Meal Plan",
      description: "Simplify your cooking routine with our pre-planned, easy-to-follow meal subscription service..",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/63326.jpg-NLSFxg9gkYBCAtPn6A80KDasclzgTs.jpeg",
      href: "/services#meal-planning",
    },
    {
      title: "6-Month to 1-Year Infant Recipe Plan",
      description:
        "Give your baby the best start with our nutritionally balanced meal plan, designed for infants aged 6 months to 1 year.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2149125810.jpg-pl5CDhf6uIFzqamjRctTgZyUV9SoBI.jpeg",
      href: "/services#infant-recipe",
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Effideli</h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-6" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-justify md:text-center">
            Welcome to EffiDeli, where efficiency meets home management and culinary excellence. We understand the
            challenges of balancing work, family, and daily responsibilities, so we've designed seamless solutions to
            simplify your routine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex flex-col bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-64 w-full">
                <Image src={service.image || "/placeholder.svg"} alt={service.title} fill className="object-cover" />
              </div>
              <div className="flex flex-col flex-grow p-6">
                <h3 className="text-xl font-bold mb-3 text-black">{service.title}</h3>
                <p className="text-gray-600 mb-6 flex-grow">{service.description}</p>
                <Button asChild className="w-full">
                  <Link href={service.href}>Learn More</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

