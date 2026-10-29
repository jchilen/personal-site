import type { MDXComponents } from 'mdx/types'

import { Callout } from './callout'
import { Figure } from './figure'
import { Part } from './part'
import { Tagline } from './tagline'
import { YouTube } from './youtube'

export const mdxComponents = {
    Callout,
    Figure,
    Part,
    Tagline,
    YouTube,
} satisfies MDXComponents
