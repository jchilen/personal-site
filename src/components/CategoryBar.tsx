import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react'
import { useNavigate } from 'react-router'
import { categories } from '../data/categories'
import ProjectCard from './ProjectCard'

type CategoryBarProps = {
  floating?: boolean
}

function CategoryBar({ floating = false }: CategoryBarProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoverBlockedId, setHoverBlockedId] = useState<string | null>(null)
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
      <nav className="category-bar" aria-label="Site sections">
        {categories.map((category) => {
          const Icon = category.icon
          const isSelected = selectedId === category.id
          const isHoverBlocked = hoverBlockedId === category.id

          let buttonClass = 'category-button'
          if (isSelected) {
            buttonClass += ' is-selected'
          }
          if (isHoverBlocked) {
            buttonClass += ' no-hover'
          }
          return (
            <button
              key={category.id}
              type="button"
              className={buttonClass}
              style={{ '--category-color': category.color } as CSSProperties}
              onClick={() => {
                if (category.scrollsToTop) {
                  if (floating) {
                    navigate('/')
                    return
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                  selectCategory(null)
                  setHoverBlockedId(category.id)
                  return
                }

                if (isSelected) {
                  selectCategory(null)
                  setHoverBlockedId(category.id)
                } else {
                  selectCategory(category.id)
                  scrollToCards()
                }
              }}
              onMouseLeave={() => setHoverBlockedId(null)}
            >
              <Icon size={30} strokeWidth={1.0} />
              {category.label}
            </button>
          )
        })}
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

export default CategoryBar
