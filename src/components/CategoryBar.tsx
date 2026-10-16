import type { CSSProperties } from 'react'
import { categories } from '../data/categories'

function CategoryBar() {
  return (
    <nav className="category-bar" aria-label="Site sections">
      {categories.map((category) => {
        const Icon = category.icon
        return (
          <button
            key={category.id}
            type="button"
            className="category-button"
            style={{ '--category-color': category.color } as CSSProperties}
          >
            <Icon />
            {category.label}
          </button>
        )
      })}
    </nav>
  )
}

export default CategoryBar