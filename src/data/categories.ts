import { House, Wrench, Dices, Newspaper, SquareRadical, Podium, ShieldCog, ChartNoAxesCombined, type LucideIcon } from 'lucide-react'

export type CardItem = {
  title: string
  description: string
  href: string
  icon: LucideIcon
}

export type Category = {
  id: string
  label: string
  icon: LucideIcon
  color: string
  items: CardItem[]
}

export const categories: Category[] = [
  {
    id: 'home',
    label: 'Home',
    icon: House,
    color: '#7cc4f4',
    items: [],
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: Wrench,
    color: '#ffb347',
    items: [
      {
        title: 'Confidence Calculator',
        description: 'Find out how lucky or unlucky you were in a given game of chance.',
        href: '/tools/confidence-calculator',
        icon: SquareRadical,
      },
      {
        title: 'Reverse Borda Poll',
        description: 'Set up a ranked-choice poll to find the option everyone can live with.',
        href: '/tools/reverse-borda',
        icon: Podium,
      },
    ],
  },
  {
    id: 'lancer',
    label: 'Lancer',
    icon: Dices,
    color: '#e8615a',
    items: [
      {
        title: 'Frame Survivability Analysis',
        description: 'Which Lancer frames can take the most punishment, by the numbers.',
        href: '/lancer/survivability',
        icon: ShieldCog,
      },
    ],
  },
  {
    id: 'articles',
    label: 'Articles',
    icon: Newspaper,
    color: '#5fd3b0',
    items: [
      {
        title: 'Your Article Title',
        description: 'A one-line summary of what the article is about.',
        href: '/articles/your-article',
        icon: ChartNoAxesCombined,
      },
    ],
  },
]