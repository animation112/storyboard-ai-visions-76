
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="bg-black text-white px-4 py-2 mx-4 mt-4 rounded-full">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full relative">
              <div className="absolute inset-0 bg-black rounded-full transform rotate-45 origin-center scale-50"></div>
            </div>
          </div>
          <span className="text-lg font-semibold">Amplitux</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-gray-300">
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm">Cart (0)</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="bg-white text-black hover:bg-gray-100 px-4 py-1 rounded-full font-medium text-sm"
          >
            Login
          </Button>
        </div>
      </div>
    </nav>
  )
}
