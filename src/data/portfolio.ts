import {
    IconArmchair,
    IconArrowsExchange,
    IconChess,
    IconCompass,
    IconHeartbeat,
    IconRoute,
    IconShoppingCart,
    IconSkull,
    IconTrophy,
    IconWind,
} from '@tabler/icons-react'
import type { CardItem } from './categories'

// A portfolio entry is a regular card plus the site it was published on, its color, and
// whether it's featured (shown double-width)
export type PortfolioItem = CardItem & {
    source: string
    hue: number // 0–360 around the color wheel; lightness and saturation come from the theme
    featured?: boolean
}

export const portfolio: PortfolioItem[] = [
    // Note: "Analytical Article for SAP"
    {
        title: "W33's Windranger: Analyzing Shackleshot",
        source: 'Team Liquid',
        description: 'A Player-Hero spotlight.',
        href: 'https://www.teamliquid.com/news/2019/08/20/w33s-windranger-analyzing-shackleshot',
        icon: IconWind,
        hue: 200,
        featured: true,
    },
    {
        title: "Defining Moments - Miracle's Solo Rampage",
        source: 'Team Liquid',
        description: 'A one-of-a-kind moment.',
        href: 'https://www.teamliquid.com/news/2019/08/05/defining-moments-miracles-solo-rampage',
        icon: IconSkull,
        hue: 236,
    },
    {
        title: 'Race to the Finish Line: Earth Spirit vs Puck',
        source: 'Team Liquid',
        description:
            'Analytics on one of the longest chases in Dota 2 history.',
        href: 'https://www.teamliquid.com/news/2019/02/19/race-to-the-finish-line-earth-spirit-vs-puck',
        icon: IconRoute,
        hue: 272,
    },
    {
        title: "Team Liquid's TI Drafts: Analyzing Comfort Heroes",
        source: 'Team Liquid',
        description:
            'A look into the value of utilizing your most-played heroes.',
        href: 'https://www.teamliquid.com/news/2019/10/08/team-liquids-ti-drafts-analyzing-comfort-heroes',
        icon: IconArmchair,
        hue: 308,
    },
    {
        title: 'Itemizing with iNSaNiA',
        source: 'Team Liquid',
        description: "Forget hero picks, let's talk item picks.",
        href: 'https://www.teamliquid.com/news/2020/04/26/itemizing-with-insania',
        icon: IconShoppingCart,
        hue: 344,
    },
    {
        title: 'My Moment by Taiga',
        source: 'Team Liquid',
        description: "An article I ghostwrote for Team Liquid's Taiga.",
        href: 'https://www.teamliquid.com/news/2020/10/24/my-moment-by-taiga',
        icon: IconHeartbeat,
        hue: 20,
    },
    {
        title: "Exploring Dota's New Frontiers",
        source: 'Team Liquid',
        description: 'An analytical perspective on a big new patch.',
        href: 'https://www.teamliquid.com/news/2023/07/04/exploring-dotas-new-frontiers',
        icon: IconCompass,
        hue: 56,
    },
    {
        title: 'Trading Places: Adjusting to Liquid with 33',
        source: 'Team Liquid',
        description: 'A change in team members means a change in focus.',
        href: 'https://teamliquid.com/news/trading-places-adjusting-to-liquid-with-33',
        icon: IconArrowsExchange,
        hue: 92,
    },
    {
        title: 'The Kuala Lumpur Recap', // TODO: confirm the published headline
        source: 'LiquidDota',
        description: 'A tournament recap for LiquidDota.',
        href: 'https://tl.net/forum/dota-2-general/539235-the-kuala-lumpur-recap',
        icon: IconTrophy,
        hue: 128,
    },
    {
        title: 'More Than Just a Role',
        source: 'LiquidDota',
        description:
            "A look into how one of Dota's key positions has changed over time.",
        href: 'https://tl.net/forum/dota-2-general/525993-playmakers-more-than-just-a-role',
        icon: IconChess,
        hue: 164,
        featured: true,
    },
]
