import type { ComponentType } from 'react'
import {
    IconHeartPlus,
    IconHome,
    IconIcosahedron,
    IconNews,
    IconSquareRoot,
    IconTool,
    IconTargetArrow,
    IconPuzzle,
} from '@tabler/icons-react'
import {
    ChartLineUpIcon,
    CourtBasketballIcon,
    RankingIcon,
} from '@phosphor-icons/react'

export type IconComponent = ComponentType<{ className?: string }>

export type CardItem = {
    title: string
    description: string
    href: string
    icon: IconComponent
    actionLabel?: string
}

export type Category = {
    id: string
    label: string
    icon: IconComponent
    color: string
    items: CardItem[]
    actionLabel?: string
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
        actionLabel: 'Open tool',
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
                title: 'Is the Lead Safe?',
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
        actionLabel: 'Open analytics',
        items: [
            {
                title: 'Frame Survivability',
                description:
                    'Which Lancer frames can take the most punishment.',
                href: '/lancer/survivability',
                icon: IconHeartPlus,
            },
            {
                title: 'Chance-to-Hit Calculator',
                description:
                    'Find out your likelihood of hitting a given Lancer enemy.',
                href: '/lancer/chance-to-hit',
                icon: IconTargetArrow,
            },
            {
                title: 'Foundry Modules, Content, & More',
                description:
                    'Links to my Foundry Modules, Lancer Content, and other utilities.',
                href: '/lancer/links',
                icon: IconPuzzle,
                actionLabel: 'View links',
            },
        ],
    },
    {
        id: 'articles',
        label: 'Articles',
        icon: IconNews,
        color: 'var(--cat-articles)',
        actionLabel: 'Read article',
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
