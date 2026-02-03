import Link from "next/link";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";
import { FaTiktok, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container px-4 md:px-6 py-12 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Effideli</h3>
            <p className="mb-4">
              Your perfect home management solution, providing comprehensive
              services to keep your home in perfect condition.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://web.facebook.com/effideli"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://www.youtube.com/@EffiDeli/videos"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaYoutube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </a>
              <a
                href="https://www.tiktok.com/@effideli?_r=1&_t=ZS-93IEVCSXwPd"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTiktok className="h-5 w-5" />
                <span className="sr-only">TikTok</span>
              </a>
              <a
                href="https://www.instagram.com/effideli?igsh=b3F5M3hmaXhic2Iz"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-white transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/services/meal-plan-subscription"
                  className="hover:text-white transition-colors"
                >
                  Subscription Access
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/services/cleaning-routine"
                  className="hover:text-white transition-colors"
                >
                  Household Cleaning Routine
                </Link>
              </li>
              <li>
                <Link
                  href="/services/meal-plan-subscription"
                  className="hover:text-white transition-colors"
                >
                  Monthly Meal Plan Subscription
                </Link>
              </li>
              <li>
                <Link
                  href="/services/infant-recipes"
                  className="hover:text-white transition-colors"
                >
                  Onetime Infant & Toddler Recipe Pack
                </Link>
              </li>
              <li></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>Lagos, Nigeria</span>
              </li>

              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>info@effideli.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center w-auto">
          <div className="flex justify-center items-center">
            <p>
              &copy; {new Date().getFullYear()} Effideli. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
