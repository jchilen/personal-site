import { flushSync } from 'react-dom'

/**
 * Runs a state update as a view transition. The browser snapshots the page before and after the
 * update, then glides each element marked with `glideClass` from its old spot and size to its new
 * one, fading in anything new and fading out anything gone. Browsers without view transitions,
 * and anyone who has asked their system for reduced motion, get the update instantly instead
 */
export function animateLayout(update: () => void): void {
    const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
    ).matches
    if (!('startViewTransition' in document) || reduceMotion) {
        update()
        return
    }
    // flushSync makes React apply the update right away, inside the callback, so the browser's
    // "after" snapshot includes it
    document.startViewTransition(() => flushSync(update))
}
