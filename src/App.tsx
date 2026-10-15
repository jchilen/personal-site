import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import Header from './components/Header'
import Footer from './components/Footer'
import Hero from './components/Hero'

function App() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <h1>Hi, I'm Joe</h1>
        <p>This is a homepage that shows you what is on my site.</p>

        <section>
          <h2>About Me</h2>
          <p>A short introduction, linking to the About page.</p>
        </section>

        <section>
          <h2>Projects</h2>
          <p>Cards for each project will go here.</p>
        </section>

        <section>
          <h2>Articles</h2>
          <p>Links to articles will go here.</p>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default App