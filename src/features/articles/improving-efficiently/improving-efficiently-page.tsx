import { ArticleLayout } from '../components/article-layout'
import { mdxComponents } from '../components/mdx-components'
import { ImprovingEfficientlyArt } from './improving-efficiently-art'
import Article, { tableOfContents } from './improving-efficiently.mdx'

export function ImprovingEfficientlyPage() {
    return (
        <ArticleLayout
            title="Improving Efficiently"
            byline="By Joe Chilen // IceNine"
            note="Originally published on LiquidDota on July 9, 2020, before the site was retired."
            art={<ImprovingEfficientlyArt className="block w-full" />}
            toc={tableOfContents}
        >
            <Article components={mdxComponents} />
        </ArticleLayout>
    )
}
