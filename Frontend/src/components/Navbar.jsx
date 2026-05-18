import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>JobTracker</h1>
      </div>
      <div className="navbar-links">
        <Link 
          to="/applications" 
          className={isActive('/applications') ? 'nav-link active' : 'nav-link'}
        >
          Applications
        </Link>
        <Link 
          to="/analytics" 
          className={isActive('/analytics') ? 'nav-link active' : 'nav-link'}
        >
          Analytics
        </Link>
        <Link 
          to="/ai-tools" 
          className={isActive('/ai-tools') ? 'nav-link active' : 'nav-link'}
        >
          AI Tools
        </Link>
      </div>
    </nav>
  )
}

export default Navbar