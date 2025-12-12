"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const heroImages = [
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/effideli-slide-1-rq71jtKBUseHnielAaso4Dpyn3js45.png",
    alt: "Professional cleaning service provider in blue sweater showing enthusiasm",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/effideli-slide-2-F2CDTaeQD8YXVxdMSHiZIQvUuswOrm.png",
    alt: "Professional cleaning service provider in white uniform",
  },
  {
    src: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/effideli-slide-3-gO1ZG6X07HTCHdgvPOmbuYLEpVssGf.png",
    alt: "Professional cleaning staff member with cleaning supplies",
  },
];

export default function Hero() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);

  const testimonials = [
    {
      name: "David Thompson",
      comment:
        "The level of organization and efficiency Effideli brings to home management is incredible. Highly recommended!",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/36894.jpg-eM17TkDK54UcyW7t0yNyqhLINRVykh.jpeg",
      role: "Tech Professional",
    },
    {
      name: "Dr. Sarah Williams",
      comment:
        "As a busy professional, Effideli has made managing my home effortless. Their attention to detail is outstanding.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/102075.jpg-EWSf1VYEEuRtCIC3amxPKFhr2faUcE.jpeg",
      role: "Medical Director",
    },
    {
      name: "Emma Chen",
      comment:
        "Their comprehensive home management solutions have transformed how I maintain my living space.",
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/310701475_5828017063915188_2131444743897198472_n.jpg-rBJCzoQsZdqLzK37nc5tbxhCqxcx7p.jpeg",
      role: "Business Owner",
    },
  ];

  // Auto-slide testimonials every 5 seconds
  useEffect(() => {
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(testimonialTimer);
  }, []);

  // Auto-slide hero images every 4 seconds
  useEffect(() => {
    const imageTimer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(imageTimer);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            'url("https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9888.jpg-19MYBhjvgxpAPRSqKizbyFRC14wWLs.jpeg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.15,
        }}
      />
      <div className="relative z-10 bg-[#F5F7FF]/60">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-8 md:py-12">
            {/* Left Column */}
            <div className="flex flex-col space-y-6 pl-4 md:pl-8 lg:pl-12 order-2 lg:order-1">
              {/* Brand Badge */}
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 md:w-5 md:h-5">
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    className="w-full h-full text-primary"
                  >
                    <path
                      d="M10 0L20 10L10 20L0 10L10 0Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-medium text-primary">
                  We are Effideli
                </span>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-3xl md:text-3xl lg:text-6xl leading-tight lg:leading-none font-bold tracking-tight text-center lg:text-left">
                  Efficiency Delivered
                </h1>
                <p className="text-base md:text-lg text-gray-600 max-w-[500px]">
                  Effideli is the trusted home and kitchen partner for families,
                  offering intercontinental dishes with African-infused flavors,
                  customized meal plans, infant and toddler recipes, and smart
                  household management tips — all designed to make home life
                  easier, healthier, and more enjoyable.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Button
                  asChild
                  className="h-12 px-6 text-white bg-primary hover:bg-primary/90 w-full sm:w-auto"
                >
                  <Link href="/get-started">
                    Get Started
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 px-6 w-full sm:w-auto"
                >
                  <Link href="/services">
                    Learn More
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>

              {/* Testimonials Slider */}
              <div className="mt-8 bg-white rounded-xl p-4 shadow-lg relative">
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                      transform: `translateX(-${currentTestimonial * 100}%)`,
                    }}
                  >
                    {testimonials.map((testimonial, index) => (
                      <div
                        key={index}
                        className="w-full flex-shrink-0 flex items-start gap-4"
                        style={{ width: "100%" }}
                      >
                        <div className="flex-shrink-0">
                          <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden">
                            <Image
                              src={testimonial.image || "/placeholder.svg"}
                              alt={testimonial.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="flex-grow">
                          <p className="text-xs md:text-sm text-gray-700 mb-1 line-clamp-3 md:line-clamp-none">
                            {testimonial.comment}
                          </p>
                          <div>
                            <p className="font-bold text-gray-900 text-xs md:text-sm">
                              {testimonial.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Dots indicator */}
                <div className="flex justify-center gap-2 mt-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-colors ${
                        index === currentTestimonial
                          ? "bg-primary"
                          : "bg-gray-300"
                      }`}
                      onClick={() => setCurrentTestimonial(index)}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Image Slider */}
            <div className="relative order-1 lg:order-2">
              <div className="relative aspect-square max-w-[500px] mx-auto">
                {/* Image slider */}
                <div className="relative z-10 overflow-hidden">
                  <div
                    className="transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentImage * 100}%)` }}
                  >
                    <div className="flex">
                      {heroImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative w-full flex-shrink-0"
                          style={{ width: "100%" }}
                        >
                          <Image
                            src={image.src || "/placeholder.svg"}
                            alt={image.alt}
                            width={600}
                            height={600}
                            className={`object-contain scale-110 ${
                              index === 0 ? "pt-8" : ""
                            }`}
                            priority={index === 0}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dots indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImage ? "bg-white" : "bg-white/50"
                        }`}
                        onClick={() => setCurrentImage(index)}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
