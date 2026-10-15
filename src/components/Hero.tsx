import avatar from '../assets/icenine_avatar.png'

function Hero() {
  return (
    <section className="hero">
      <img src={avatar} className="avatar" alt="IceNine // Joe Chilen"/>
      <p className="eyebrow">Software Developer</p>
      <h1>Joe Chilen</h1>
      <nav className="pill-nav">
        <a className="pill" href="#about">About</a>
        <a className="pill" href="#experience">Experience</a>
        <a className="pill" href="#contact">Contact</a>
      </nav>
    </section>
  )
}

export default Hero