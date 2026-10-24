import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import { cn } from 'cn'
import { categories } from '@/data/categories'
import { toggleVariants } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ProjectCard } from '@/components/project-card'

type CategoryBarProps = {
  floating?: boolean
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

export function CategoryBar({ floating = false }: CategoryBarProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [displayedId, setDisplayedId] = useState<string | null>(null)
  const [isLeaving, setIsLeaving] = useState(false)

  const cardAreaRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const dockRef = useRef<HTMLDivElement>(null)

  function scrollToCards() {
    const cardArea = cardAreaRef.current
    if (!cardArea) return

    if (cardArea.getBoundingClientRect().top < 76) {
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
        floating ? 'sticky top-4 z-10 mx-auto mt-6 w-fit' : 'contents',
      )}
    >
      <nav
        aria-label="Site sections"
        className={cn(
          'flex w-fit gap-2 border bg-card p-1',
          !floating && 'sticky top-4 z-10 mx-auto mt-10',
        )}
      >
        {homeCategory && (
          <button
            type="button"
            className={cn(toggleVariants(), itemClass)}
            style={{ '--category-color': homeCategory.color } as CSSProperties}
            onClick={() => {
              if (floating) {
                navigate('/')
                return
              }
              window.scrollTo({ top: 0, behavior: 'smooth' })
              selectCategory(null)
            }}
          >
            <homeCategory.icon className="size-7 stroke-[1.25]" />
            {homeCategory.label}
          </button>
        )}

        <ToggleGroup
          type="single"
          aria-label="Project categories"
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
          {sectionCategories.map((category) => {
            const Icon = category.icon
            return (
              <ToggleGroupItem
                key={category.id}
                value={category.id}
                className={itemClass}
                style={{ '--category-color': category.color } as CSSProperties}
              >
                <Icon className="size-7 stroke-[1.25]" />
                {category.label}
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
      </nav>

      <div
        ref={cardAreaRef}
        className={cn(
          'flex items-start justify-center',
          floating
            ? 'pointer-events-none absolute top-full left-1/2 mt-3 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2'
            : 'min-h-[50svh] scroll-mt-20 pt-8',
        )}
      >
        {displayedCategory && (
          <div
            key={displayedCategory.id}
            className={cn(
              floating &&
                'pointer-events-auto relative border border-l-0 bg-muted py-4 pr-4 pl-10',
            )}
            style={
              { '--category-color': displayedCategory.color } as CSSProperties
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
                'flex flex-wrap justify-center gap-4',
                displayedCategory.items.length >= 4 && 'max-w-124',
              )}
            >
              {displayedCategory.items.map((item, index) => (
                <ProjectCard
                  key={item.title}
                  item={item}
                  color={displayedCategory.color}
                  label={displayedCategory.label}
                  actionLabel={displayedCategory.actionLabel ?? 'Open'}
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
