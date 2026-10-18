import Footer from './components/Footer'
import { Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'
import SafeLeadPage from './pages/SafeLeadPage'
import ComingSoonPage from './pages/ComingSoonPage'

function App() {
  return (
    <>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools/safe-lead-calculator" element={<SafeLeadPage />} />
          <Route path="*" element={<ComingSoonPage />} />
        </Routes>
      </main>

      <Footer />
    </>
  )
}

export default App