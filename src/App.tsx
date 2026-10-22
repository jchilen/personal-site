import { Footer } from '@/components/footer'
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
      <ModeToggle className="fixed top-4 right-4 z-20 max-sm:hidden" />
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
