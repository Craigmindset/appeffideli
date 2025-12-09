"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  ClipboardList,
  UtensilsCrossed,
  Baby,
  UserRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const pathname = usePathname();

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const serviceLinks = [
    {
      name: "Household Chore Routine Management",
      href: "/services#household-chores",
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      name: "Monthly Home Meal Subscription/Weekly Home Meal Plan",
      href: "/services#meal-planning",
      icon: <UtensilsCrossed className="h-4 w-4" />,
    },
    {
      name: "6-Months to 1-Years Infant Recipe Plan",
      href: "/services#infant-recipe",
      icon: <Baby className="h-4 w-4" />,
    },
    {
      name: "Tiger Nuts Recipe Packs (Coming Soon!)",
      href: "/services#tiger-nuts",
      icon: <Baby className="h-4 w-4" />,
    },
  ];

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Articles", href: "/articles" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EffiDeli%27s%20full%20color%20%28%20transparent%20background%20icon%20only%20%29-Fbe2ZXggbmATpsonEw5l7wWP2r4XS9.png"
                alt="Effideli Logo"
                width={60}
                height={60}
                className="h-14 w-auto"
              />
              <span className="text-2xl font-bold" style={{ color: "#174969" }}>
                Effideli
              </span>
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "text-red-600"
                  : "text-foreground hover:text-primary hover:bg-accent"
              }`}
            >
              Home
            </Link>
            {/* Services Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className="px-3 py-2 rounded-md text-sm font-medium text-foreground hover:text-primary hover:bg-accent transition-colors inline-flex items-center gap-1"
              >
                Services
                <ChevronDown className="h-4 w-4" />
              </button>

              {isServicesOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsServicesOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-popover ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1">
                      {serviceLinks.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          className="group flex items-center px-4 py-3 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          <span className="mr-3 text-muted-foreground group-hover:text-primary">
                            {link.icon}
                          </span>
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {navLinks.slice(1).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors inline-flex items-center ${
                  pathname === link.href
                    ? "text-red-600"
                    : "text-foreground hover:text-primary hover:bg-accent"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Theme Toggle */}
            <ThemeToggle />
            <Link
              href="/login"
              className="ml-2 px-4 py-2 rounded-md text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary hover:bg-accent focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity md:hidden z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Mobile menu */}
      <div
        className={`
          fixed top-0 right-0 bottom-0 w-[280px] bg-[#174969] border-l z-50
          transform transition-transform duration-300 ease-in-out md:hidden
          ${isMenuOpen ? "translate-x-0" : "translate-x-full"}
          before:content-[''] before:absolute before:inset-0 before:bg-[url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2148484647.jpg-8L5af8IjroIBCHcT9BagVct7EhcqNu.jpeg')] before:bg-cover before:bg-center before:opacity-10 before:z-[-1]
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <span className="text-lg font-semibold text-white">Menu</span>
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white/80 hover:bg-white/10 focus:outline-none"
          >
            <X className="block h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-2 py-3 divide-y divide-white/10">
          <div className="space-y-1 pb-3">
            <Link
              href="/"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                pathname === "/"
                  ? "text-red-600"
                  : "text-white hover:text-white/80 hover:bg-white/10"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
          </div>

          {/* Services section in mobile menu */}
          <div className="py-3">
            <button
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
              className="flex items-center justify-between w-full px-3 py-2 text-base font-medium text-white hover:text-white/80 hover:bg-white/10 rounded-md"
            >
              <span>Services</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isMobileServicesOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`
                mt-1 pl-4 space-y-1 overflow-hidden transition-all duration-200 ease-in-out
                ${
                  isMobileServicesOpen
                    ? "max-h-[500px] opacity-100"
                    : "max-h-0 opacity-0"
                }
              `}
            >
              {serviceLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center px-3 py-2 text-sm transition-colors rounded-md ${
                    pathname === link.href
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsMobileServicesOpen(false);
                  }}
                >
                  <span className="mr-3 text-current">{link.icon}</span>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-1 pt-3">
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex w-full px-3 py-2 rounded-md text-base font-medium transition-colors items-center justify-between ${
                  pathname === link.href
                    ? "text-red-600"
                    : "text-white hover:text-white/80 hover:bg-white/10"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/login"
              className="flex w-full mt-2 px-3 py-2 rounded-md text-base font-semibold text-white bg-primary hover:bg-primary/90 transition-colors items-center justify-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
