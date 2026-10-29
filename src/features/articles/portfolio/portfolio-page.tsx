import { ToolLayout } from '@/components/tool-layout'
import { ProjectCard } from '@/components/project-card'
import { portfolio } from '@/data/portfolio'
import { HexMosaic } from './hex-mosaic'

export function PortfolioPage() {
    return (
        <ToolLayout
            eyebrow="Articles"
            title="Writing Portfolio"
            intro="Articles I've written for other sites."
        >
            <div className="grid grid-cols-[repeat(auto-fill,15rem)] justify-center gap-4">
                {portfolio.map((item, index) => (
                    <ProjectCard
                        key={item.href}
                        item={item}
                        color={`oklch(var(--hue-lightness) var(--hue-chroma) ${item.hue})`}
                        label={item.source}
                        actionLabel="Read article"
                        index={index}
                        isLeaving={false}
                        header={
                            <HexMosaic seed={item.title} tall={item.featured} />
                        }
                        className={
                            item.featured
                                ? 'sm:col-span-2 sm:w-auto'
                                : undefined
                        }
                    />
                ))}
            </div>
        </ToolLayout>
    )
}
