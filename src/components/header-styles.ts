// The header's slide in and out
export const headerMotionClass =
    'transition-transform duration-300 motion-reduce:transition-none'

// Slides a header element out the top of the screen. Keyboard focus on it, or inside it, brings it
// straight back, so tabbing never lands on something you can't see
export const hiddenHeaderClass =
    '-translate-y-[calc(100%+2rem)] focus-visible:translate-y-0 has-[:focus-visible]:translate-y-0'
