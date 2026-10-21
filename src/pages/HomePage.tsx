import Hero from '../components/Hero'
import CategoryBar from '../components/CategoryBar'

function HomePage() {
  return (
    <>
      <main>
        <Hero />
        <CategoryBar />
        <nav className="pill-nav">
          <a className="pill" href="#about">
            About
          </a>
          <a className="pill" href="#experience">
            Experience
          </a>
          <a className="pill" href="#contact">
            Contact
          </a>
        </nav>
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
    </>
  )
}

export default HomePage
