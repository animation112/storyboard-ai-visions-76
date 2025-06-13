
import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <nav className="flex justify-center px-4 mt-4">
      <div className="bg-black/40 backdrop-blur-md border border-white/10 text-white px-16 py-3 rounded-full w-full max-w-5xl shadow-2xl shadow-black/25">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-teal-400/30">
              <div className="w-3 h-3 bg-white rounded-full relative">
                <div className="absolute inset-0 bg-black rounded-full transform rotate-45 origin-center scale-50"></div>
              </div>
            </div>
            <span className="text-lg font-semibold text-white/95">Amplitux</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 mx-16">
            <a href="#" className="text-white/70 hover:text-white transition-colors text-sm hover:drop-shadow-sm">
              Product
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors text-sm hover:drop-shadow-sm">
              Solution
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors text-sm hover:drop-shadow-sm">
              Pricing
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors text-sm hover:drop-shadow-sm">
              About us
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors text-sm hover:drop-shadow-sm">
              Blogs
            </a>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
            >
              Sign Up
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 backdrop-blur-sm text-black hover:bg-white px-4 py-2 rounded-full font-medium text-sm shadow-lg shadow-white/20 border border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-white/30"
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
