/** Whether the person has asked their system for less motion */
export function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * The behavior for scrollTo and scrollIntoView: smooth, unless reduced motion is on. Scrolling
 * started from JavaScript with behavior: 'smooth' ignores the CSS that turns smooth scrolling off
 * for reduced motion, so it has to check for itself
 */
export function scrollBehavior(): ScrollBehavior {
    return prefersReducedMotion() ? 'auto' : 'smooth'
}
