import { House, Wrench, Dices, Newspaper, SquareRadical, Podium, ShieldCog, ChartNoAxesCombined, GraduationCap, type LucideIcon} from 'lucide-react'

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
  scrollsToTop?: boolean
}

export const categories: Category[] = [
  {
    id: 'home',
    label: 'Home',
    icon: House,
    color: 'var(--cat-home)',
    items: [],
    scrollsToTop: true,
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: Wrench,
    color: 'var(--cat-tools)',
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
      {
        title: 'CBB: Is the Lead Safe?',
        description: "Find out if a college basketball game is effectively over, using Bill James' Safe Lead Formula.",
        href: '/tools/safe-lead-calculator',
        icon: GraduationCap,
      },
    ],
  },
  {
    id: 'lancer',
    label: 'Lancer',
    icon: Dices,
    color: 'var(--cat-lancer)',
    items: [
      {
        title: 'Frame Survivability',
        description: 'Which Lancer frames can take the most punishment.',
        href: '/lancer/survivability',
        icon: ShieldCog,
      },
    ],
  },
  {
    id: 'articles',
    label: 'Articles',
    icon: Newspaper,
    color: 'var(--cat-articles)',
    items: [
      {
        title: 'Improving Efficiently',
        description: 'A one-line summary of what the article is about.',
        href: '/articles/your-article',
        icon: ChartNoAxesCombined,
      },
    ],
  },
]