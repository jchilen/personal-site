import { afterEach, describe, expect, test, vi } from 'vitest'
import { animateLayout } from './animate-layout'

// Stand-ins for the browser: whether reduced motion is on, and whether view transitions exist
function browser({
    reduceMotion = false,
    viewTransitions = true,
}: { reduceMotion?: boolean; viewTransitions?: boolean } = {}) {
    vi.stubGlobal('window', {
        matchMedia: () => ({ matches: reduceMotion }),
    })
    const startViewTransition = vi.fn((callback: () => void) => callback())
    vi.stubGlobal('document', viewTransitions ? { startViewTransition } : {})
    return startViewTransition
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('animateLayout', () => {
    test('runs the update inside a view transition', () => {
        const startViewTransition = browser()
        const update = vi.fn()
        animateLayout(update)
        expect(startViewTransition).toHaveBeenCalledOnce()
        expect(update).toHaveBeenCalledOnce()
    })

    test('without view transitions, runs the update straight away', () => {
        browser({ viewTransitions: false })
        const update = vi.fn()
        animateLayout(update)
        expect(update).toHaveBeenCalledOnce()
    })

    test('with reduced motion on, skips the transition', () => {
        const startViewTransition = browser({ reduceMotion: true })
        const update = vi.fn()
        animateLayout(update)
        expect(startViewTransition).not.toHaveBeenCalled()
        expect(update).toHaveBeenCalledOnce()
    })
})
