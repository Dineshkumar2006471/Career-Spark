/*
 * PublicNav provides a consistent navigation bar on landing and auth-adjacent pages.
 * It exists so all public screens share the same Sort-inspired top navigation.
 */
import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import UserNavMenu from './UserNavMenu.jsx'
import ThemeToggle from '../ui/ThemeToggle.jsx'
import { useAuth } from '../../context/authState.js'
import logo from '../../assets/logo.png'

function PublicNav() {
  const auth = useAuth()

  return (
    <header className="sticky top-4 z-50 mx-auto max-w-[1240px] px-4 sm:px-6 pt-2">
      {/* Clean, crisp glassmorphic navbar container */}
      <nav className="flex items-center justify-between rounded-full bg-canvas/95 backdrop-blur-xl border border-hairline px-6 py-3 shadow-md">
        
        {/* Logo Image Only (Removed redundant text) */}
        <Link className="flex items-center group" to="/">
          <img src={logo} alt="CareerSpark Logo" className="h-10 sm:h-11 w-auto group-hover:scale-105 transition-transform duration-300" />
        </Link>

        {/* Continuously Animated Color Border ONLY on Navigation Buttons (Features, Learning Path, Workflow) */}
        <div className="hidden md:block relative rounded-full p-[2px] overflow-hidden shadow-sm animate-border-glow">
          {/* Rotating gradient background for buttons border */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#4ADE80] via-[#3B82F6] via-[#A855F7] to-[#10B981] animate-gradient-x"></div>
          
          <div className="relative flex items-center gap-8 rounded-full bg-canvas px-7 py-2 text-sm font-semibold text-body">
            <a className="hover:text-primary transition-colors" href="/#features">Features</a>
            <a className="hover:text-primary transition-colors" href="/#roadmap-proof">Learning Path</a>
            <a className="hover:text-primary transition-colors" href="/#workflow">Workflow</a>
          </div>
        </div>

        {auth?.user ? (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNavMenu />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button to="/login" variant="text" className="hidden px-3 text-sm font-semibold text-ink sm:inline-flex hover:text-primary transition-colors">Log in</Button>
            <Button to="/register" className="bg-ink text-white hover:bg-primary shadow-md hover:shadow-lg hover:-translate-y-0.5 rounded-full px-6 py-2.5 text-sm font-bold transition-all">
              Start free ➔
            </Button>
          </div>
        )}
      </nav>
    </header>
  )
}

export default PublicNav
