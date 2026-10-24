import { Link } from 'react-router'
import { CategoryBar } from '@/components/category-bar'
import { Eyebrow } from '@/components/eyebrow'
import { Button } from '@/components/ui/button'

export function ComingSoonPage() {
  return (
    <>
      <CategoryBar floating />
      <section className="flex flex-col items-center pt-24 pb-16 text-center">
        <Eyebrow>Coming soon</Eyebrow>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-widest uppercase sm:text-5xl">
          This page isn't built yet
        </h1>
        <Button asChild variant="link" className="mt-8">
          <Link to="/">Back to the home page</Link>
        </Button>
      </section>
    </>
  )
}
