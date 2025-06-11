
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="bg-black text-white px-6 py-4 mx-4 mt-4 rounded-full">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full relative">
              <div className="absolute inset-0 bg-black rounded-full transform rotate-45 origin-center scale-50"></div>
            </div>
          </div>
          <span className="text-xl font-semibold">Amplitux</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            Product
          </a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            Solution
          </a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            About us
          </a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            Blogs
          </a>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-300">
            <ShoppingCart className="w-5 h-5" />
            <span>Cart (0)</span>
          </div>
          <Button
            variant="secondary"
            className="bg-white text-black hover:bg-gray-100 px-6 py-2 rounded-full font-medium"
          >
            Login
          </Button>
        </div>
      </div>
    </nav>
  )
}
