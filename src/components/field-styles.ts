export const fieldLabelClass =
    'font-heading text-xs tracking-eyebrow text-muted-foreground uppercase'

// Borderless input with an underline that turns the tools color on focus
export const underlineInputClass =
    'h-auto rounded-none border-0 border-b-2 bg-transparent px-0 py-1 shadow-none focus-visible:border-cat-tools focus-visible:ring-0 dark:bg-transparent'

export const numberInputClass = `${underlineInputClass} text-right font-heading text-xl font-semibold`

// A choice in a ToggleGroup: outlined, gold when selected
export const choiceItemClass =
    'corner-brackets h-10 border text-muted-foreground hover:bg-transparent hover:text-foreground data-[state=on]:border-primary data-[state=on]:bg-primary/10 data-[state=on]:text-primary'

// Controls that don't apply right now: diagonal stripes, readable but clearly unavailable.
// When one is still selected (Cover's None in tech attack mode), the gold "you chose this" look
// is swapped for a darker border and normal text; the stripes show in both states
export const lockedClass =
    'text-muted-foreground disabled:opacity-100 bg-[repeating-linear-gradient(135deg,var(--muted)_0_5px,transparent_5px_10px)] data-[state=on]:border-muted-foreground data-[state=on]:bg-transparent data-[state=on]:text-foreground'
