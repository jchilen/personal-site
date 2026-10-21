import { Link } from 'react-router'

function ComingSoonPage() {
  return (
    <section className="tool-page">
      <p className="eyebrow">Coming soon</p>
      <h1>This page isn't built yet</h1>
      <p>
        <Link to="/">Back to the home page</Link>
      </p>
    </section>
  )
}

export default ComingSoonPage
