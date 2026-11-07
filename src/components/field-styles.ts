// Borderless input with an underline that turns the tools color on focus
export const underlineInputClass =
    'h-auto rounded-none border-0 border-b-2 bg-transparent px-0 py-1 shadow-none focus-visible:border-cat-tools focus-visible:ring-0 dark:bg-transparent'

export const numberInputClass = `${underlineInputClass} text-right font-heading text-xl font-semibold`

// A choice in a ToggleGroup: outlined, gold when selected
export const choiceItemClass =
    'corner-brackets h-10 border text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary'

// Controls that don't apply right now: faded and striped, with a "not allowed" cursor and no hover
// effects. They use aria-disabled rather than disabled, so they still receive the mouse, for the
// cursor (and tooltips later). One that's still selected (Cover's None in tech) keeps its gold look
export const lockedClass =
    'cursor-not-allowed bg-[repeating-linear-gradient(135deg,var(--muted)_0_5px,transparent_5px_10px)] opacity-35 [--brackets-hover-opacity:0] hover:text-muted-foreground data-[state=on]:bg-none data-[state=on]:opacity-100 data-[state=on]:hover:text-primary'

// Makes an aria-disabled button look and act like a disabled one. Use aria-disabled (with a guard
// in the click handler) for buttons that become unavailable while focused, like a stepper reaching
// its limit: a disabled button drops focus, while an aria-disabled one keeps it, and screen readers
// still say it's unavailable
export const ariaDisabledClass =
    'aria-disabled:pointer-events-none aria-disabled:opacity-50'
