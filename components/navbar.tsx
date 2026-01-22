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
  LogOut,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { signOut } from "@/app/actions/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState("User");
  const pathname = usePathname();
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createBrowserSupabaseClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setIsLoggedIn(true);

          // Fetch user profile
          const { data: profile } = await supabase
            .from("users_profile")
            .select("full_name")
            .eq("id", user.id)
            .single();

          if (profile && profile.full_name) {
            const firstName = profile.full_name.split(" ")[0];
            setFirstName(firstName || "User");
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      // Clear client-side storage
      localStorage.clear();
      sessionStorage.clear();

      // Get supabase client and sign out
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();

      // Clear server-side session
      await signOut();

      // Update state
      setIsLoggedIn(false);

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
      name: "Monthly Meal Plan",
      href: "/services/meal-plan-subscription",
      icon: <UtensilsCrossed className="h-4 w-4" />,
    },
    {
      name: "Onetime Infant & Toddler Recipe Pack",
      href: "/services/infant-recipes",
      icon: <Baby className="h-4 w-4" />,
    },
    {
      name: "Household Cleaning Routine",
      href: "/services/cleaning-routine",
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      name: "Kitchen Hacks Monday",
      href: "/services/kitchen-hacks-monday",
      icon: <UtensilsCrossed className="h-4 w-4" />,
    },
    {
      name: "Saturday Breakfast with Gloria",
      href: "/services/saturday-breakfast-gloria",
      icon: <UtensilsCrossed className="h-4 w-4" />,
    },
  ];

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/EffiDeli%27s%20full%20color%20%28%20transparent%20background%20icon%20only%20%29-Fbe2ZXggbmATpsonEw5l7wWP2r4XS9.png"
                alt="Effideli Logo"
                width={60}
                height={60}
                className="h-10 w-auto md:h-14"
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

            {/* Auth Section */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="ml-2 flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-accent transition-colors"
                  title="Go to Dashboard"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/avatar.png" alt={firstName} />
                    <AvatarFallback className="bg-primary text-white text-xs">
                      {getInitials(firstName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline">{firstName}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="ml-2 px-4 py-2 rounded-md text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            {isLoggedIn && (
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex items-center justify-center p-1 rounded-full hover:bg-accent transition-colors"
                title="Go to Dashboard"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/avatar.png" alt={firstName} />
                  <AvatarFallback className="bg-primary text-white text-xs">
                    {getInitials(firstName)}
                  </AvatarFallback>
                </Avatar>
              </button>
            )}
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
          fixed top-0 left-0 bottom-0 w-[280px] bg-[#FFFBF7] border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out md:hidden shadow-lg
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-900">Menu</span>
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors"
          >
            <X className="block h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-2 py-4 space-y-1">
          <div>
            <Link
              href="/"
              className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                pathname === "/"
                  ? "bg-amber-100 text-amber-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
          </div>

          {/* Services section in mobile menu */}
          <div>
            <button
              onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
              className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
                mt-1 space-y-1 overflow-hidden transition-all duration-200 ease-in-out
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
                  className={`flex items-center px-4 py-2 text-sm transition-colors rounded-lg ${
                    pathname === link.href
                      ? "bg-amber-100 text-amber-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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

          <div className="space-y-1 pt-2">
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex w-full px-4 py-3 rounded-lg text-base font-medium transition-all items-center justify-between ${
                  pathname === link.href
                    ? "bg-amber-100 text-amber-900"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {/* Auth Section for Mobile */}
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    router.push("/dashboard");
                  }}
                  className="flex w-full mt-4 px-4 py-3 rounded-lg text-base font-semibold text-white bg-primary hover:bg-primary/90 transition-all items-center justify-center gap-2 shadow-sm"
                >
                  <UserRound className="h-5 w-5" />
                  Dashboard ({firstName})
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full mt-2 px-4 py-3 rounded-lg text-base font-semibold text-white bg-red-600 hover:bg-red-700 transition-all items-center justify-center gap-2 shadow-sm"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex w-full mt-4 px-4 py-3 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all items-center justify-center gap-2 shadow-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserRound className="h-5 w-5" />
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
