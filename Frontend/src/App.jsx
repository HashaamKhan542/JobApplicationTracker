import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Applications from './pages/Applications'
import Analytics from './pages/Analytics'
import AITools from './pages/AITools'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/applications" />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/ai-tools" element={<AITools />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App