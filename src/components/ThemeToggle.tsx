
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ThemeProvider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-8 w-8"
    >
      <span className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0">☀️</span>
      <span className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100">🌙</span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
