/*
 * PublicNav provides a consistent navigation bar on landing and auth-adjacent pages.
 * It exists so all public screens share the same Sort-inspired top navigation.
 */
import { Link } from 'react-router-dom'
import Button from '../ui/Button.jsx'
import UserNavMenu from './UserNavMenu.jsx'
import { useAuth } from '../../context/authState.js'

// Renders the public navigation and returns shared links plus auth actions.
function PublicNav() {
  const auth = useAuth()

  return (
    <nav className="mx-auto flex max-w-[1180px] items-center justify-between px-lg py-lg">
      <Link className="font-display text-xl font-semibold text-ink" to="/">
        CareerSpark
      </Link>
      <div className="hidden items-center gap-lg rounded-md border border-hairline bg-canvas px-base py-sm text-sm text-body md:flex">
        <a className="hover:text-ink" href="/#features">Features</a>
        <a className="hover:text-ink" href="/#roadmap-proof">Roadmap</a>
        <a className="hover:text-ink" href="/#workflow">Workflow</a>
      </div>
      {auth?.user ? (
        <UserNavMenu />
      ) : (
        <div className="flex items-center gap-sm">
          <Button to="/login" variant="text" className="hidden px-sm text-ink sm:inline-flex">Log in</Button>
          <Button to="/register" className="bg-ink text-white hover:bg-primary">Start free</Button>
        </div>
      )}
    </nav>
  )
}

export default PublicNav
