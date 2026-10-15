import Footer from './components/Footer'
import Hero from './components/Hero'

function App() {
  return (
    <>

      <main>
        <Hero />
        <section id="about" className="page-section">
          <p className="eyebrow">About</p>
          <p>A few paragraphs about who you are and what you do.</p>
        </section>

       <section id="experience" className="page-section">
          <p className="eyebrow">Experience</p>
          <p>Work history, skills, and the tools you use.</p>
        </section>

        <section id="contact" className="page-section">
          <p className="eyebrow">Contact</p>
          <p>How people can reach you.</p>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default App