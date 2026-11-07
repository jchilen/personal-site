import {
    Fragment,
    useEffect,
    useEffectEvent,
    useRef,
    useState,
    type CSSProperties,
    type ComponentType,
    type FocusEvent,
    type ReactNode,
} from 'react'
import { Link } from 'react-router'
import { cn } from 'cn'
import { categories, type Category } from '@/data/categories'
import { toggleVariants } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ProjectCard } from '@/components/project-card'
import { floatingShadowClass } from '@/components/shadow-styles'
import {
    headerMotionClass,
    hiddenHeaderClass,
} from '@/components/header-styles'
import { useHideOnScroll } from '@/hooks/use-hide-on-scroll'
import { prefersReducedMotion, scrollBehavior } from '@/lib/motion'

type CategoryBarProps = {
    floating?: boolean
    idle?: ReactNode
}

// Shared by the Home button and the category toggles so all four match
const itemClass = cn(
    'corner-brackets h-auto flex-col gap-1.5 px-4 py-2.5 font-heading text-muted-foreground',
    'hover:bg-transparent hover:text-(--category-color)',
    'data-[state=on]:bg-transparent data-[state=on]:text-(--category-color)',
)

const homeCategory = categories.find((category) => category.scrollsToTop)
const sectionCategories = categories.filter(
    (category) => !category.scrollsToTop,
)

// Shared by both hex sizes; HexShape sits behind the icon and label
const hexItemClass = 'isolate flex-none p-0'

// Home page: full-size hexes with the label always showing
const fullHexClass = 'h-30 w-26'

// Other pages: icon-only mini hexes that grow to full size on hover, keyboard focus, or while open.
// With reduced motion they snap to size instead of growing
const miniHexClass =
    'group h-12 w-10.5 gap-0 transition-[color,width,height,margin] hex-open:mx-1.5 hex-open:h-30 hex-open:w-26 motion-reduce:transition-none'

type HexContentProps = {
    icon: ComponentType<{ className?: string }>
    label: string
    mini: boolean
}

function HexContent({ icon: Icon, label, mini }: HexContentProps) {
    return (
        <>
            <HexShape />
            <Icon
                className={cn(
                    'stroke-[1.25]',
                    mini
                        ? 'size-5 transition-[width,height] group-hex-open:size-7 motion-reduce:transition-none'
                        : 'size-7',
                )}
            />
            {mini ? (
                <span className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] group-hex-open:grid-rows-[1fr] group-hex-open:opacity-100 motion-reduce:transition-none">
                    <span className="overflow-hidden">
                        <span className="block pt-1.5">{label}</span>
                    </span>
                </span>
            ) : (
                label
            )}
        </>
    )
}

function HexShape() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 104 120"
            className={`absolute inset-0 -z-10 size-full overflow-visible fill-card stroke-current ${floatingShadowClass}`}
        >
            <polygon
                points="52,0 104,30 104,90 52,120 0,90 0,30"
                className="pointer-events-auto"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    )
}

// A line with a dot on each end, joining two hexes (desktop only)
function Connector() {
    return (
        <span
            aria-hidden="true"
            className="mx-1.5 h-1 w-8 shrink-0 bg-muted-foreground max-sm:hidden"
        />
    )
}

// Sets the color a hex, its label, and its cards use
function categoryColorStyle(color: string): CSSProperties {
    return { '--category-color': color }
}

type HomeHexProps = { mini: boolean } & (
    { to: string; onClick?: never } | { onClick: () => void; to?: never }
)

// The Home hex looks like the category toggles, but it isn't a choice. On another page it's a
// link to the home page; on the home page, where there's nowhere to go, it's a button that
// scrolls back to the top
function HomeHex({ mini, to, onClick }: HomeHexProps) {
    if (!homeCategory) return null

    const className = cn(
        toggleVariants(),
        itemClass,
        hexItemClass,
        mini ? miniHexClass : fullHexClass,
    )
    const style = categoryColorStyle(homeCategory.color)
    const content = (
        <HexContent
            icon={homeCategory.icon}
            label={homeCategory.label}
            mini={mini}
        />
    )

    return to ? (
        <Link to={to} className={className} style={style}>
            {content}
        </Link>
    ) : (
        <button
            type="button"
            className={className}
            style={style}
            onClick={onClick}
        >
            {content}
        </button>
    )
}

type CategoryTogglesProps = {
    mini: boolean
    selectedId: string | null
    onSelect: (id: string | null) => void
}

// One toggle per section. The home page's full-size hexes are joined by connectors, and shift into
// place on phones
function CategoryToggles({ mini, selectedId, onSelect }: CategoryTogglesProps) {
    return (
        <ToggleGroup
            type="single"
            aria-label="Project categories"
            className="contents"
            // Each hex gets its own Tab stop. With roving focus, the group itself takes the Tab stop
            // while nothing is open, and a display: contents element can't be focused, so Tab
            // would skip every hex
            rovingFocus={false}
            value={selectedId ?? ''}
            // Clicking the open category again sends '', which closes it
            onValueChange={(value) => onSelect(value || null)}
        >
            {sectionCategories.map((category, index) => (
                <Fragment key={category.id}>
                    {!mini && index > 0 && <Connector />}
                    <ToggleGroupItem
                        value={category.id}
                        className={cn(
                            itemClass,
                            hexItemClass,
                            mini ? miniHexClass : fullHexClass,
                            !mini &&
                                index > 0 &&
                                'max-sm:-mt-6 max-sm:translate-x-[calc(50%+0.25rem)]',
                        )}
                        style={categoryColorStyle(category.color)}
                    >
                        <HexContent
                            icon={category.icon}
                            label={category.label}
                            mini={mini}
                        />
                    </ToggleGroupItem>
                </Fragment>
            ))}
        </ToggleGroup>
    )
}

type CategoryCardsProps = {
    category: Category
    isLeaving: boolean
    onAnimationEnd: () => void
    className: string
    // Shown before the cards, like the floating panel's side label
    children?: ReactNode
}

// The open category's cards, which animate in, and out again when another category is picked
function CategoryCards({
    category,
    isLeaving,
    onAnimationEnd,
    className,
    children,
}: CategoryCardsProps) {
    return (
        <div
            className={className}
            style={categoryColorStyle(category.color)}
            onAnimationEnd={onAnimationEnd}
        >
            {children}

            {/* Up to 3 cards share one row; 4 or more go 2 per row (an odd last card centers) */}
            <div
                className={cn(
                    'flex flex-wrap justify-center gap-4 *:pointer-events-auto',
                    category.items.length >= 4 && 'max-w-124',
                )}
            >
                {category.items.map((item, index) => (
                    <ProjectCard
                        key={item.title}
                        item={item}
                        color={category.color}
                        label={category.label}
                        actionLabel={
                            item.actionLabel ?? category.actionLabel ?? 'Open'
                        }
                        index={index}
                        isLeaving={isLeaving}
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * Which category is picked, and which one's cards are on screen. The two differ while the old
 * cards animate out, before the new ones take their place
 */
function useCategorySelection() {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [displayedId, setDisplayedId] = useState<string | null>(null)
    const [isLeaving, setIsLeaving] = useState(false)
    // Slides away while scrolling down, unless a category's cards are open
    const scrolledAway = useHideOnScroll()

    const displayedCategory = categories.find(
        (category) => category.id === displayedId,
    )

    function selectCategory(nextId: string | null) {
        setSelectedId(nextId)

        if (
            !displayedCategory ||
            displayedCategory.items.length === 0 ||
            prefersReducedMotion()
        ) {
            // Nothing (or no cards) on screen: show the new selection right away
            setDisplayedId(nextId)
            setIsLeaving(false)
        } else if (nextId === displayedId) {
            // Clicked back to what's on screen mid-exit: cancel the exit
            setIsLeaving(false)
        } else {
            // Different cards on screen: animate them out first
            setIsLeaving(true)
        }
    }

    // When the old cards finish animating out, the picked category's cards replace them
    function finishLeaving() {
        if (isLeaving) {
            setDisplayedId(selectedId)
            setIsLeaving(false)
        }
    }

    return {
        selectedId,
        displayedCategory,
        isLeaving,
        hidden: scrolledAway && selectedId === null,
        selectCategory,
        finishLeaving,
    }
}

// The home page: full-size hexes that stick to the top while scrolling, with the open category's
// cards in the space below them, or `idle` while none is open
function HomeCategoryBar({ idle }: { idle?: ReactNode }) {
    const {
        selectedId,
        displayedCategory,
        isLeaving,
        hidden,
        selectCategory,
        finishLeaving,
    } = useCategorySelection()
    const cardAreaRef = useRef<HTMLDivElement>(null)

    // Brings the cards back into view if their area has scrolled up under the bar
    function scrollToCards() {
        const cardArea = cardAreaRef.current
        if (!cardArea) return

        if (cardArea.getBoundingClientRect().top < 136) {
            cardArea.scrollIntoView({
                behavior: scrollBehavior(),
                block: 'start',
            })
        }
    }

    return (
        <div className="pointer-events-none contents">
            <div
                className={cn(
                    // On phones the home hexes don't stick, so they never slide away either
                    'sticky top-4 z-10 mx-auto mt-10 w-fit max-sm:static max-sm:translate-y-0',
                    headerMotionClass,
                    hidden && hiddenHeaderClass,
                )}
            >
                <nav
                    aria-label="Site sections"
                    className="flex items-center max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-2 max-sm:pr-14"
                >
                    <HomeHex
                        mini={false}
                        onClick={() => {
                            window.scrollTo({
                                top: 0,
                                behavior: scrollBehavior(),
                            })
                            selectCategory(null)
                        }}
                    />
                    {homeCategory && <Connector />}
                    <CategoryToggles
                        mini={false}
                        selectedId={selectedId}
                        onSelect={(id) => {
                            selectCategory(id)
                            if (id) scrollToCards()
                        }}
                    />
                </nav>
            </div>

            <div
                ref={cardAreaRef}
                className="pointer-events-none flex min-h-72 scroll-mt-36 items-start justify-center pt-8"
            >
                {idle}
                {displayedCategory && (
                    <CategoryCards
                        key={displayedCategory.id}
                        category={displayedCategory}
                        isLeaving={isLeaving}
                        onAnimationEnd={finishLeaving}
                        className="pointer-events-none relative"
                    />
                )}
            </div>
        </div>
    )
}

// Every other page: a dock of mini hexes that slides away while scrolling down, with the open
// category's cards in a panel below it. It opens below the bar, so the page never needs to scroll
function FloatingCategoryBar() {
    const {
        selectedId,
        displayedCategory,
        isLeaving,
        hidden,
        selectCategory,
        finishLeaving,
    } = useCategorySelection()
    const dockRef = useRef<HTMLDivElement>(null)

    // An Effect Event always sees this render's state, so the listener below never acts on an
    // older render's selectCategory, even though the effect doesn't re-run for every change
    const onDocumentClick = useEffectEvent((event: MouseEvent) => {
        if (!dockRef.current?.contains(event.target as Node)) {
            selectCategory(null)
        }
    })

    // Escape closes the panel and puts focus back on the hex that opened it
    const onDocumentKeyDown = useEffectEvent((event: KeyboardEvent) => {
        if (event.key !== 'Escape') return
        dockRef.current
            ?.querySelector<HTMLElement>('[data-state="on"]')
            ?.focus()
        selectCategory(null)
    })

    // While the panel is open, a click outside the dock or Escape anywhere on the page closes it.
    // Escape listens on the whole document because focus isn't always in the dock: some browsers
    // don't focus a button when it's clicked
    useEffect(() => {
        if (selectedId === null) return

        const handleClick = (event: MouseEvent) => onDocumentClick(event)
        const handleKeyDown = (event: KeyboardEvent) => onDocumentKeyDown(event)
        document.addEventListener('click', handleClick)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('click', handleClick)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [selectedId])

    // Tabbing out of the dock closes the panel, so it never sits on top of whatever gets focus
    // next. relatedTarget is where focus went. It's null when focus leaves the browser window,
    // which shouldn't close it
    function handleBlur(event: FocusEvent<HTMLDivElement>): void {
        const next = event.relatedTarget
        if (
            selectedId !== null &&
            next instanceof Node &&
            !dockRef.current?.contains(next)
        ) {
            selectCategory(null)
        }
    }

    return (
        // Focus events from the hexes and the cards inside bubble up to the dock
        <div
            ref={dockRef}
            onBlur={handleBlur}
            className={cn(
                'pointer-events-none sticky top-4 z-10 mx-auto mt-6 w-fit',
                headerMotionClass,
                hidden && hiddenHeaderClass,
            )}
        >
            <nav
                aria-label="Site sections"
                className="flex h-12 items-start gap-1"
            >
                <HomeHex mini to="/" />
                <CategoryToggles
                    mini
                    selectedId={selectedId}
                    onSelect={selectCategory}
                />
            </nav>

            <div className="pointer-events-none absolute top-full left-1/2 mt-21 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-start justify-center">
                {displayedCategory && (
                    <CategoryCards
                        key={displayedCategory.id}
                        category={displayedCategory}
                        isLeaving={isLeaving}
                        onAnimationEnd={finishLeaving}
                        // The panel scans in and out with its cards, rather than appearing first
                        className={cn(
                            'pointer-events-auto relative border border-l-0 bg-muted py-4 pr-4 pl-10 motion-reduce:animate-none',
                            isLeaving
                                ? 'animate-scan-conceal'
                                : 'animate-scan-reveal',
                        )}
                    >
                        <div
                            aria-hidden="true"
                            className="absolute -inset-y-px left-0 flex w-6 items-center justify-center bg-(--category-color)"
                        >
                            <span className="rotate-180 font-heading text-xs font-semibold tracking-eyebrow text-background uppercase [writing-mode:vertical-rl]">
                                {displayedCategory.label}
                            </span>
                        </div>
                    </CategoryCards>
                )}
            </div>
        </div>
    )
}

/** The site's section hexes: full size on the home page, a floating mini dock everywhere else */
export function CategoryBar({ floating = false, idle }: CategoryBarProps) {
    return floating ? <FloatingCategoryBar /> : <HomeCategoryBar idle={idle} />
}
