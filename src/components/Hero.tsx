import avatar from '../assets/icenine_avatar.png'

function Hero() {
  return (
    <section className="hero">
      <img src={avatar} className="avatar"alt="IceNine // Joe Chilen"/>
      <p className="eyebrow">Software Developer</p>
      <h1>Joe Chilen</h1>
    </section>
  )
}

export default Hero