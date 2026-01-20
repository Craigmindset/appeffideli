"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const slides = [
  {
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2149248535.jpg-usn5FvbaQ9vdaEjX246IcgCPawANlP.jpeg",
    title: "Household Cleaning Routine",
    description:
      "Effideli’s Household Cleaning Routine is a one-time customized chore guide for maids, nannies, and house managers, detailing what to clean, where, and how in any home type—flat, bungalow, or duplex—across a full Monday-to-Sunday schedule to ensure proper hygiene and maintenance",
  },
  {
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2148484647.jpg-4Uuop9peBb5eAKu5kP1cE9gDcu6XAF.jpeg",
    title: "Customized Meal Planning",
    description:
      "Effideli’s Monthly Meal Plan Subscription provides a complete family-friendly menu of intercontinental, African-infused recipes—covering breakfast, snacks, lunch, and dinner—perfect for healthy families, working mums, private chefs, and anyone looking to spice up their home meals",
  },
  {
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2148580388.jpg-JDSXekfxQWwqZ4kTIb14TePj6KG7XF.jpeg",
    title: "Onetime Infant & Toddler Recipe Pack",
    description:
      "Specialized baby food meal plans for your little one's healthy development (6 months - 1 year)",
  },
];

const services = [
  {
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/30286.jpg-XFYYhqFTHOGJnCgLRpRO9nnDeNWxiw.jpeg",
    title: "Household Chores Routine Management",
    description:
      "Are you struggling to keep up with house chores? Our structured Household Chores Routine Management plan provides customized cleaning schedules based on your home type, ensuring efficiency and consistency",
    howItWorks: [
      "Choose a plan based on your home size (Studio, Apartment, Bungalow, Duplex)",
      "Receive a structured cleaning guide",
      "Get a downloadable version instantly upon payment",
    ],
    formId: "household-chore",
    id: "household-chores",
  },
  {
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2151156154.jpg-dsEfo1hVCLbi8sDEGYFAgLppUzMKsh.jpeg",
    title: "Monthly Home Meal Subscription ",
    description:
      "This plan is perfect for families committed to healthy living, busy working mums, parents who feel unsure about what meals to prepare for school or home, private chefs, and mothers looking to bring more variety and balanced nutrition into their kitchens",
    howItWorks: [
      "Subscribe and receive a new meal plan every Friday at 9 PM",
      "Enjoy weekly or monthly curated meals tailored to your dietary needs",
    ],
    formId: "meal-planning",
    id: "meal-planning",
  },
  {
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2149125810.jpg-IscvO8MRCRt5nA08SNlRw4UlVZWmqN.jpeg",
    title: "6-Month to 1-Year Infant Recipe Plan",
    description:
      "Give your baby the best start with our nutritionally balanced meal plan, designed for infants aged 6 months to 1 year.",
    howItWorks: [
      "50 carefully curated infant meals",
      "Recipes delivered instantly via email after payment",
      "Tailored options based on allergies, sweet tooth preferences, and nutrition goals",
    ],
    formId: "baby-menu",
    id: "infant-recipe",
  },
  {
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2682.jpg-ViTZJWdsG3VcWYIF0L8dj3bPKO2Mc5.jpeg",
    title: "Tiger Nuts Recipe Packs",
    description:
      "Discover the health benefits of tiger nuts with our expertly crafted tiger nut-based recipes.",
    howItWorks: [
      "Easy-to-follow recipes",
      "A selection of nutritious, delicious tiger nut dishes",
      "Home delivery for convenience",
    ],
    formId: "tiger-nuts",
    id: "tiger-nuts",
  },
  {
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/63326.jpg-F9Ws6Ivv8v1IspHRqUeysULoM7tCPK.jpeg",
    title: "Customized Recipe Development",
    description:
      "Do you have unique dietary preferences? Our Customized Recipe Development service creates tailor-made meal plans that suit your needs.",
    howItWorks: [
      "Select your preferred food types (Traditional, Iconic, or Classical – pick two)",
      "Specify allergies and dietary requirements",
      "Receive a personalized meal plan within one week",
      "Pay 60% upfront, with the balance settled before final delivery",
    ],
    formId: "custom-recipe",
    id: "custom-recipe",
  },
  {
    image: "",
    title: "Kitchen Hacks Monday",
    description:
      "Kitchen Hacks Monday is an Effideli brand program that shares tips to make cooking fun, flavorful, and educational, adding value to your home—tune in every Monday on social media and the Effideli website.",
    howItWorks: [
      "Tune in every Monday for new tips and tricks!",
      "Follow us on social media and the Effideli website for updates.",
    ],
    formId: "kitchen-hacks-monday",
    id: "kitchen-hacks-monday",
    learnMore: true,
  },
  {
    image: "",
    title: "Saturday Breakfast with Gloria",
    description:
      "Saturday Breakfast with Gloria is a show that inspires families with breakfast ideas they can recreate at home, celebrating culture, promoting intercontinental dishes, and showcasing the brand’s wide range of culinary creativity.",
    howItWorks: [
      "Watch every Saturday for new breakfast inspiration!",
      "Discover recipes and cultural stories on our platforms.",
    ],
    formId: "saturday-breakfast-gloria",
    id: "saturday-breakfast-gloria",
    learnMore: true,
  },
];

export default function ServicesPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    // Handle hash navigation
    if (window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hero Slider Section */}
        <section className="relative h-[90vh] md:h-[80vh] overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={index} className="w-full h-full flex-shrink-0 relative">
                <Image
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                  <h1 className="text-3xl md:text-5xl font-bold text-center mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-center max-w-2xl">
                    {slide.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Controls */}
          <div className="absolute inset-0 flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={nextSlide}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>

          {/* Dots indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/50"
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </section>

        {/* What We Do Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              What We Do
            </h2>

            <div className="space-y-8">
              {services.map((service, index) => (
                <div
                  key={index}
                  id={service.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="relative w-full md:w-1/4 aspect-square">
                        <Image
                          src={service.image || "/placeholder.svg"}
                          alt={service.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold mb-4">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 mb-6 text-lg">
                          {service.description}
                        </p>
                        <div>
                          <h4 className="font-semibold text-primary mb-2 text-lg">
                            How it Works
                          </h4>
                          <ul className="text-gray-500 list-disc pl-4 space-y-1 mb-4">
                            {service.howItWorks.map((step, stepIndex) => (
                              <li key={stepIndex}>{step}</li>
                            ))}
                          </ul>
                          {service.id === "tiger-nuts" ||
                          service.id === "custom-recipe" ? (
                            <Button disabled className="w-full sm:w-auto">
                              <Clock className="mr-2 h-4 w-4" />
                              Coming Soon!
                            </Button>
                          ) : service.learnMore ? (
                            <Button asChild className="w-full sm:w-auto">
                              <Link href="#">Learn More</Link>
                            </Button>
                          ) : (
                            <Button asChild className="w-full sm:w-auto">
                              <Link
                                href={`/get-started?service=${service.formId}`}
                              >
                                Get Started
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      {/* Footer removed, handled by layout */}
    </div>
  );
}
