import {
    Fragment,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type ComponentType,
    type ReactNode,
} from 'react'
import { useNavigate } from 'react-router'
import { cn } from 'cn'
import { categories } from '@/data/categories'
import { toggleVariants } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ProjectCard } from '@/components/project-card'

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

// Other pages: icon-only mini hexes that grow to full size on hover, keyboard focus, or while open
const miniHexClass =
        'group h-12 w-10.5 gap-0 transition-[color,width,height,margin] hex-open:mx-1.5 hex-open:h-30 hex-open:w-26'

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
                        ? 'size-5 transition-[width,height] group-hex-open:size-7'
                        : 'size-7',
                )}
            />
            {mini ? (
                <span className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] group-hex-open:grid-rows-[1fr] group-hex-open:opacity-100">
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
            className="absolute inset-0 -z-10 size-full overflow-visible fill-card stroke-current drop-shadow-[0_2px_6px_rgb(3_20_34/0.75)] dark:drop-shadow-[0_0_8px_rgb(0_0_0/0.99)]"
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

export function CategoryBar({ floating = false, idle }: CategoryBarProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [displayedId, setDisplayedId] = useState<string | null>(null)
    const [isLeaving, setIsLeaving] = useState(false)

    const cardAreaRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    const dockRef = useRef<HTMLDivElement>(null)

    function scrollToCards() {
        const cardArea = cardAreaRef.current
        // The floating panel opens below the bar, so the page never needs to scroll for it
        if (!cardArea || floating) return

        if (cardArea.getBoundingClientRect().top < 136) {
            cardArea.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    const displayedCategory = categories.find(
        (category) => category.id === displayedId,
    )

    function selectCategory(nextId: string | null) {
        setSelectedId(nextId)

        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches

        if (
            !displayedCategory ||
            displayedCategory.items.length === 0 ||
            prefersReducedMotion
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

    useEffect(() => {
        if (!floating || selectedId === null) return

        function handleClickOutside(event: Event) {
            if (!dockRef.current?.contains(event.target as Node)) {
                selectCategory(null)
            }
        }

        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    })

    return (
        <div
            ref={dockRef}
            className={cn(
                'pointer-events-none',
                floating ? 'sticky top-4 z-10 mx-auto mt-6 w-fit' : 'contents',
            )}
        >
            <div
                className={cn(
                    !floating &&
                        'sticky top-4 z-10 mx-auto mt-10 w-fit max-sm:static',
                )}
            >
                <nav
                    aria-label="Site sections"
                    className={cn(
                        floating
                            ? 'flex h-12 items-start gap-1'
                            : 'flex items-center max-sm:grid max-sm:grid-cols-2 max-sm:gap-x-2 max-sm:pr-14',
                    )}
                >
                    {homeCategory && (
                        <button
                            type="button"
                            className={cn(
                                toggleVariants(),
                                itemClass,
                                hexItemClass,
                                floating ? miniHexClass : fullHexClass,
                            )}
                            style={
                                {
                                    '--category-color': homeCategory.color,
                                } as CSSProperties
                            }
                            onClick={() => {
                                if (floating) {
                                    navigate('/')
                                    return
                                }
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                selectCategory(null)
                            }}
                        >
                            <HexContent
                                icon={homeCategory.icon}
                                label={homeCategory.label}
                                mini={floating}
                            />
                        </button>
                    )}

                    {homeCategory && !floating && <Connector />}

                    <ToggleGroup
                        type="single"
                        aria-label="Project categories"
                        className="contents"
                        value={selectedId ?? ''}
                        onValueChange={(value) => {
                            if (!value) {
                                selectCategory(null)
                                return
                            }
                            selectCategory(value)
                            scrollToCards()
                        }}
                    >
                        {sectionCategories.map((category, index) => (
                            <Fragment key={category.id}>
                                {!floating && index > 0 && <Connector />}
                                <ToggleGroupItem
                                    value={category.id}
                                    className={cn(
                                        itemClass,
                                        hexItemClass,
                                        floating ? miniHexClass : fullHexClass,
                                        !floating &&
                                            index > 0 &&
                                            'max-sm:-mt-6 max-sm:translate-x-[calc(50%+0.25rem)]',
                                    )}
                                    style={
                                        {
                                            '--category-color': category.color,
                                        } as CSSProperties
                                    }
                                >
                                    <HexContent
                                        icon={category.icon}
                                        label={category.label}
                                        mini={floating}
                                    />
                                </ToggleGroupItem>
                            </Fragment>
                        ))}
                    </ToggleGroup>
                </nav>
            </div>

            <div
                ref={cardAreaRef}
                className={cn(
                    'pointer-events-none flex items-start justify-center',
                    floating
                        ? 'absolute top-full left-1/2 mt-21 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2'
                        : 'min-h-72 scroll-mt-36 pt-8',
                )}
            >
                {!floating && idle}
                {displayedCategory && (
                    <div
                        key={displayedCategory.id}
                        className={cn(
                            floating
                                ? 'pointer-events-auto relative border border-l-0 bg-muted py-4 pr-4 pl-10'
                                : 'pointer-events-none relative',
                        )}
                        style={
                            {
                                '--category-color': displayedCategory.color,
                            } as CSSProperties
                        }
                        onAnimationEnd={() => {
                            if (isLeaving) {
                                setDisplayedId(selectedId)
                                setIsLeaving(false)
                            }
                        }}
                    >
                        {floating && (
                            <div
                                aria-hidden="true"
                                className="absolute -inset-y-px left-0 flex w-6 items-center justify-center bg-(--category-color)"
                            >
                                <span className="rotate-180 font-heading text-xs font-semibold tracking-eyebrow text-background uppercase [writing-mode:vertical-rl]">
                                    {displayedCategory.label}
                                </span>
                            </div>
                        )}

                        {/* Up to 3 cards share one row; 4 or more go 2 per row (an odd last card centers) */}
                        <div
                            className={cn(
                                'flex flex-wrap justify-center gap-4 *:pointer-events-auto',
                                displayedCategory.items.length >= 4 &&
                                    'max-w-124',
                            )}
                        >
                            {displayedCategory.items.map((item, index) => (
                                <ProjectCard
                                    key={item.title}
                                    item={item}
                                    color={displayedCategory.color}
                                    label={displayedCategory.label}
                                    actionLabel={
                                        item.actionLabel ??
                                        displayedCategory.actionLabel ??
                                        'Open'
                                    }
                                    index={index}
                                    isLeaving={isLeaving}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
