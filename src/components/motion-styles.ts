/**
 * Marks an element to glide to its new spot and size when animateLayout runs. `match-element`
 * gives every marked element its own transition name automatically, so names never clash
 */
export const glideClass = '[view-transition-name:match-element]'

/**
 * Turns an animation off for reduced motion, including ones set by data-state classes. Those beat a
 * plain motion-reduce:animate-none: their attribute selector makes them more specific, and the
 * media query motion-reduce adds counts for nothing. So this one uses !important
 */
export const reducedMotionClass = 'motion-reduce:animate-none!'

/**
 * Slides a Radix CollapsibleContent open and closed. Keep padding off it, on an element inside
 * instead, so it can shrink all the way to nothing
 */
export const collapseClass = `overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down ${reducedMotionClass}`
