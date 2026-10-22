import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { useNavigate } from 'react-router'
import { cn } from 'cn'
import { categories } from '@/data/categories'
import { toggleVariants } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import ProjectCard from './ProjectCard'

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
const sectionCategories = categories.filter((category) => !category.scrollsToTop)

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

    if (!displayedCategory || displayedCategory.items.length === 0) {
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

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const cards =
      event.currentTarget.querySelectorAll<HTMLElement>('.project-card')

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`)
      card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`)
    })
  }

  return (
    <div
      ref={dockRef}
      className={floating ? 'category-dock is-floating' : 'category-dock'}
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
        className="card-area"
        ref={cardAreaRef}
        onMouseMove={handleMouseMove}
      >
        {displayedCategory && (
          <div
            className={'card-list' + (isLeaving ? ' is-leaving' : '')}
            key={displayedCategory.id}
            onAnimationEnd={() => {
              if (isLeaving) {
                setDisplayedId(selectedId)
                setIsLeaving(false)
              }
            }}
          >
            {displayedCategory.items.map((item) => {
              return (
                <ProjectCard
                  key={item.title}
                  item={item}
                  color={displayedCategory.color}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
