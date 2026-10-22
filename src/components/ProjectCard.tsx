import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { IconArrowUpRight } from '@tabler/icons-react'
import type { CardItem } from '../data/categories'

type ProjectCardProps = {
  item: CardItem
  color: string
}

function ProjectCard({ item, color }: ProjectCardProps) {
  const Icon = item.icon

  return (
    <Link
      to={item.href}
      className="project-card"
      style={{ '--card-color': color } as CSSProperties}
    >
      <div className="project-card-header">
        <Icon className="project-card-icon size-9 stroke-[1.25]" />
        <h3>{item.title}</h3>
        <IconArrowUpRight className="project-card-arrow size-4.5 stroke-[1.5]" />
      </div>
      <p>{item.description}</p>
    </Link>
  )
}

export default ProjectCard
