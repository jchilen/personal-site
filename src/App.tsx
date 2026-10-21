import Footer from './components/Footer'
import { ModeToggle } from '@/components/mode-toggle'
import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router'
import HomePage from './pages/HomePage'
import SafeLeadPage from './pages/SafeLeadPage'
import ComingSoonPage from './pages/ComingSoonPage'

function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <ModeToggle />
      <main key={pathname}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/tools/safe-lead-calculator"
            element={<SafeLeadPage />}
          />
          <Route path="*" element={<ComingSoonPage />} />
        </Routes>
      </main>

      <Footer />
    </>
  )
}

export default App
