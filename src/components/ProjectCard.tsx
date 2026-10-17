import type { CSSProperties } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { CardItem } from '../data/categories'

type ProjectCardProps = {
  item: CardItem
  color: string
}

function ProjectCard({ item, color }: ProjectCardProps) {
  const Icon = item.icon

  return (
    <a
      href={item.href}
      className="project-card"
      style={{ '--card-color': color } as CSSProperties}
    >
      <div className="project-card-header">
        <Icon size={36} strokeWidth={1.25} className="project-card-icon" />
        <h3>{item.title}</h3>
        <ArrowUpRight size={18} className="project-card-arrow" />
      </div>
      <p>{item.description}</p>
    </a>
  )
}

export default ProjectCard