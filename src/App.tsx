import Footer from './components/Footer'
import { Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'

function App() {
  return (
    <>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>

      <Footer />
    </>
  )
}

export default App