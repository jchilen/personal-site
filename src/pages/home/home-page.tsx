import type { ReactNode } from 'react'
import { IconArrowDown } from '@tabler/icons-react'
import { Hero } from './hero'
import { CategoryBar } from '@/components/category-bar'
import { Eyebrow } from '@/components/eyebrow'
import { Button } from '@/components/ui/button'

const SECTIONS = [
    { id: 'about', title: 'About' },
    { id: 'experience', title: 'Experience' },
    { id: 'contact', title: 'Contact' },
]

type HomeSectionProps = {
    id: string
    title: string
    children: ReactNode
}

function HomeSection({ id, title, children }: HomeSectionProps) {
    return (
        <section id={id} className="scroll-mt-28 py-24">
            <div className="flex flex-col items-center gap-2">
                <Eyebrow asChild>
                    <h2>{title}</h2>
                </Eyebrow>
                <span aria-hidden="true" className="h-0.5 w-6 bg-primary" />
            </div>
            <div className="mx-auto mt-8 max-w-prose">{children}</div>
        </section>
    )
}

export function HomePage() {
    return (
        <>
            <Hero />
            <CategoryBar />

            <nav
                aria-label="Page sections"
                className="flex flex-wrap justify-center gap-3 pt-6 pb-12"
            >
                {SECTIONS.map((section) => (
                    <Button
                        key={section.id}
                        asChild
                        variant="outline"
                        size="sm"
                        className="bg-card hover:border-primary hover:bg-card dark:hover:bg-card"
                    >
                        <a href={`#${section.id}`}>
                            {section.title}
                            <IconArrowDown data-icon="inline-end" />
                        </a>
                    </Button>
                ))}
            </nav>

            <HomeSection id="about" title="About">
                <p>A few paragraphs about who you are and what you do.</p>
            </HomeSection>

            <HomeSection id="experience" title="Experience">
                <p>Work history, skills, and the tools you use.</p>
            </HomeSection>

            <HomeSection id="contact" title="Contact">
                <p>How people can reach you.</p>
            </HomeSection>
        </>
    )
}
