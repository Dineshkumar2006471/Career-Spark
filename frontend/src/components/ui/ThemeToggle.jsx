import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`grid h-10 w-10 place-items-center rounded-full bg-surface-soft text-body transition-all hover:bg-surface-dark/5 hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/20 ${className}`}
      aria-label="Toggle dark mode"
      type="button"
    >
      {theme === 'dark' ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </button>
  )
}
