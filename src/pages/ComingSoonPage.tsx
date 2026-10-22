import { Link } from 'react-router'
import { CategoryBar } from '@/components/category-bar'

function ComingSoonPage() {
  return (
      <>
        <CategoryBar floating />
        <section className="tool-page">
        <p className="eyebrow">Coming soon</p>
        <h1>This page isn't built yet</h1>
        <p>
          <Link to="/">Back to the home page</Link>
        </p>
    </section>
      </>
  )
}

export default ComingSoonPage