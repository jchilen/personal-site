/**
 * Marks an element to glide to its new spot and size when animateLayout runs. `match-element`
 * gives every marked element its own transition name automatically, so names never clash
 */
export const glideClass = '[view-transition-name:match-element]'

/**
 * Slides a Radix CollapsibleContent open and closed. Keep padding off it, on an element inside
 * instead, so it can shrink all the way to nothing
 */
export const collapseClass =
    'overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down motion-reduce:animate-none'
