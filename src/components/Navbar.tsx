
import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <nav className="flex justify-center px-4 mt-4">
      <div className="bg-black text-white px-6 py-2 rounded-full">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-full relative">
                <div className="absolute inset-0 bg-black rounded-full transform rotate-45 origin-center scale-50"></div>
              </div>
            </div>
            <span className="text-base font-semibold">Amplitux</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4 mx-8">
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              Product
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              Solution
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              Pricing
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              About us
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">
              Blogs
            </a>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white hover:bg-gray-800 px-3 py-1 rounded-full text-sm"
            >
              Sign Up
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-black hover:bg-gray-100 px-3 py-1 rounded-full font-medium text-sm"
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
