import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AUTH_PATHS = ['/login', '/signup', '/profile-setup']

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const isActive = (path) => location.pathname === path
  const isAuthPage = AUTH_PATHS.includes(location.pathname)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1>JobTracker</h1>
        </Link>
      </div>

      {!isAuthPage && user && (
        <>
          <div className="navbar-links">
            <Link to="/applications" className={isActive('/applications') ? 'nav-link active' : 'nav-link'}>
              Applications
            </Link>
            <Link to="/analytics" className={isActive('/analytics') ? 'nav-link active' : 'nav-link'}>
              Analytics
            </Link>
            <Link to="/ai-tools" className={isActive('/ai-tools') ? 'nav-link active' : 'nav-link'}>
              AI Tools
            </Link>
          </div>
          <div className="navbar-user">
            <span className="user-email">{user.email}</span>
            <button className="btn-logout" onClick={handleLogout}>Sign out</button>
          </div>
        </>
      )}
    </nav>
  )
}

export default Navbar
