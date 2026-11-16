import { cn } from 'cn'
import { reducedMotionClass } from './motion-styles'

// The site's tooltip look: shadcn's chip and arrow, recolored to a card with a border, in the
// uppercase heading font used for labels. The arrow (the only svg inside) gets the card color and a
// border on its two outer edges, so it reads as part of the box. Hint uses it, and so can tooltips
// that aren't tied to one control, like a chart's
export const hintClass = cn(
    'border bg-popover font-heading font-semibold tracking-wider text-foreground uppercase shadow-md',
    '[&_svg]:border-r [&_svg]:border-b [&_svg]:bg-popover [&_svg]:fill-popover',
    reducedMotionClass,
)