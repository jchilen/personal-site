import { useState, type CSSProperties, type MouseEvent } from 'react'
import { categories } from '../data/categories'
import ProjectCard from './ProjectCard'

function CategoryBar() {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [hoverBlockedId, setHoverBlockedId] = useState<string | null>(null)
    const selectedCategory = categories.find((category) => category.id === selectedId)

    function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
        const cards = event.currentTarget.querySelectorAll<HTMLElement>('.project-card')

        cards.forEach((card) => {
            const rect = card.getBoundingClientRect()
            card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`)
            card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`)
        })
    }

    return (
        <>
        <nav className="category-bar" aria-label="Site sections">
        {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedId === category.id
            const isHoverBlocked = hoverBlockedId === category.id

            let buttonClass = 'category-button'
            if (isSelected) {
                buttonClass+=" is-selected"
            }
            if (isHoverBlocked) {
                buttonClass+=" no-hover"
            }
            return (
            <button
                key={category.id}
                type="button"
                className={buttonClass}
                style={{ '--category-color': category.color } as CSSProperties}
                onClick={() => {
                    if (isSelected) {
                        setSelectedId(null)
                        setHoverBlockedId(category.id)
                    } else {
                        setSelectedId(category.id)
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

        <div className="card-area" onMouseMove={handleMouseMove}>
            {selectedCategory && (
                <div className="card-list" key={selectedCategory.id}>
                    {selectedCategory.items.map((item) => {
                        return (
                            <ProjectCard
                                key={item.title}
                                item={item}
                                color={selectedCategory.color}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    </>
    )
}

export default CategoryBar