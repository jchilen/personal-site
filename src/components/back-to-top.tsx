import { useEffect, useState } from 'react'
import { IconChevronUp } from '@tabler/icons-react'
import { cn } from 'cn'
import { Hint } from '@/components/hint'
import { Button } from '@/components/ui/button'
import { scrollBehavior } from '@/lib/motion'

// How far down the page, in pixels, before the button shows
const SHOW_AFTER = 200

/**
 * A ^ button in the bottom right corner that scrolls back to the top of the page. It stays hidden
 * at the top, and fades in once the page is scrolled down
 */
export function BackToTop() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const update = () => setScrolled(window.scrollY > SHOW_AFTER)
        // Checked once to start, for a page that loads already scrolled down
        update()
        window.addEventListener('scroll', update, { passive: true })
        return () => window.removeEventListener('scroll', update)
    }, [])

    function backToTop() {
        window.scrollTo({ top: 0, behavior: scrollBehavior() })
        // The button hides at the top, which would drop keyboard focus, so focus goes to the page's
        // heading instead. preventScroll leaves the smooth scroll to finish on its own
        document
            .querySelector<HTMLElement>('main h1')
            ?.focus({ preventScroll: true })
    }

    return (
        <Hint label="Back to top" side="left">
            <Button
                variant="framed"
                size="icon"
                aria-label="Back to top"
                onClick={backToTop}
                // size-15: one and a half times the usual icon button, so it's easy to find and hit.
                // It replaces size="icon"'s size-10, since the last class wins.
                // invisible, not just see-through, while hidden, so Tab and screen readers skip it.
                // visibility is in the transition so it waits for the fade out before switching off
                className={cn(
                    'fixed right-4 bottom-4 z-20 size-15 transition-[opacity,visibility] duration-300 motion-reduce:transition-none',
                    !scrolled && 'invisible opacity-0',
                )}
            >
                <IconChevronUp className="size-7.5" />
            </Button>
        </Hint>
    )
}
