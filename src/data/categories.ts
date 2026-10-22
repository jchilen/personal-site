import type { ComponentType } from 'react'
import {
  IconHeartPlus,
  IconHome,
  IconIcosahedron,
  IconNews,
  IconSquareRoot,
  IconTool,
} from '@tabler/icons-react'
import { ChartLineUpIcon, CourtBasketballIcon, RankingIcon } from '@phosphor-icons/react'

export type IconComponent = ComponentType<{ className?: string }>

export type CardItem = {
  title: string
  description: string
  href: string
  icon: IconComponent
}

export type Category = {
  id: string
  label: string
  icon: IconComponent
  color: string
  items: CardItem[]
  scrollsToTop?: boolean
}

export const categories: Category[] = [
  {
    id: 'home',
    label: 'Home',
    icon: IconHome,
    color: 'var(--cat-home)',
    items: [],
    scrollsToTop: true,
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: IconTool,
    color: 'var(--cat-tools)',
    items: [
      {
        title: 'Confidence Calculator',
        description:
          'Find out how lucky or unlucky you were in a given game of chance.',
        href: '/tools/confidence-calculator',
        icon: IconSquareRoot,
      },
      {
        title: 'Reverse Borda Poll',
        description:
          'Set up a ranked-choice poll to find the option everyone can live with.',
        href: '/tools/reverse-borda',
        icon: RankingIcon,
      },
      {
        title: 'CBB: Is the Lead Safe?',
        description:
          "Find out if a college basketball game is effectively over, using Bill James' Safe Lead Formula.",
        href: '/tools/safe-lead-calculator',
        icon: CourtBasketballIcon,
      },
    ],
  },
  {
    id: 'lancer',
    label: 'Lancer',
    icon: IconIcosahedron,
    color: 'var(--cat-lancer)',
    items: [
      {
        title: 'Frame Survivability',
        description: 'Which Lancer frames can take the most punishment.',
        href: '/lancer/survivability',
        icon: IconHeartPlus,
      },
    ],
  },
  {
    id: 'articles',
    label: 'Articles',
    icon: IconNews,
    color: 'var(--cat-articles)',
    items: [
      {
        title: 'Improving Efficiently',
        description: 'A one-line summary of what the article is about.',
        href: '/articles/your-article',
        icon: ChartLineUpIcon,
      },
    ],
  },
]
