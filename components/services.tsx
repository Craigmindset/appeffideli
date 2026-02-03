import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Services() {
  const services = [
    {
      title: "Monthly Meal Plan Subscription",
      description:
        "Effideli offers a comprehensive monthly family meal plan featuring intercontinental dishes with African-infused recipes. It includes breakfast, snacks, lunch, dinner, and evening bites—perfect for school meal prep and everyday home cooking.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/63326.jpg-NLSFxg9gkYBCAtPn6A80KDasclzgTs.jpeg",
      href: "/services/meal-plan-subscription",
    },
    {
      title: "Household Cleaning Routine",
      description:
        "Effideli’s Household Cleaning Routine is a one-time customized chore guide for maids, nannies, and house managers, detailing what to clean, where, and how in any home type—flat, bungalow, or duplex—across a full Monday-to-Sunday schedule to ensure proper hygiene and maintenance",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/30286.jpg-vhmf07MH4i4JgOFTn71c3MUUWSC2UJ.jpeg",
      href: "/services/cleaning-routine",
    },
    {
      title: "Onetime Infant & Toddler Recipe Pack",
      description:
        "Effideli’s One-Time Infant & Toddler Recipe Pack provides balanced, nutritious recipes tailored to a baby’s tooth stage, taste development, and potential allergies, helping mums introduce new foods and fruits safely during each stage of their baby’s transition.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2149125810.jpg-pl5CDhf6uIFzqamjRctTgZyUV9SoBI.jpeg",
      href: "/services/infant-recipes",
    },
    {
      title: "Kitchen Hacks Monday",
      description:
        "Kitchen Hacks Monday is an Effideli brand program that shares tips to make cooking fun, flavorful, and educational, adding value to your home—tune in every Monday on social media and the Effideli website.",
      image:
        "https://res.cloudinary.com/djrup28qq/image/upload/v1768937040/kitchen-hack_vzsvch.jpg", // Add image URL if available
      href: "/services/kitchen-hacks-monday",
    },
    {
      title: "Saturday Breakfast with Gloria",
      description:
        "Saturday Breakfast with Gloria is a show that inspires families with breakfast ideas they can recreate at home, celebrating culture, promoting intercontinental dishes, and showcasing the brand’s wide range of culinary creativity.",
      image:
        "https://res.cloudinary.com/djrup28qq/image/upload/v1768938613/3883_ojtmwa.jpg", // Add image URL if available
      href: "/services/saturday-breakfast-gloria",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Effideli
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mb-6" />
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-justify md:text-center">
            Welcome to EffiDeli, We make cooking fun, flavorful, and effortless
            with monthly subscription meal plans, creative recipes, kitchen
            hacks, and home management tips perfect for busy families,
            health-conscious parents, and anyone who loves great food at home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex flex-col bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={service.image || "/placeholder.svg"}
                  alt={service.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col flex-grow p-6">
                <h3 className="text-xl font-bold mb-3 text-black">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  {service.description}
                </p>
                <Button asChild className="w-full">
                  <Link href={service.href}>Learn More</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
