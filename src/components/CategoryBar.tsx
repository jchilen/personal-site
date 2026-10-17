import { useState, type CSSProperties } from 'react'
import { categories } from '../data/categories'

function CategoryBar() {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [hoverBlockedId, setHoverBlockedId] = useState<string | null>(null)
    const selectedCategory = categories.find((category) => category.id === selectedId)
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
        {selectedCategory && (
            <div className="card-list">
                {selectedCategory.items.map((item) => {
                    return <p key={item.title}>{item.title}</p>
                })}
            </div>
    )}
    </>
    )
}

export default CategoryBar