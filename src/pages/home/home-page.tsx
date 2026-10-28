import { IconArrowDown } from '@tabler/icons-react'
import { useRef } from 'react'
import { Hero } from './hero'
import { HomeSection } from './home-section'
import { ExperienceSection } from './experience-section'
import { ContactSection } from './contact-section'
import { HexField } from './hex-field'
import { CategoryBar } from '@/components/category-bar'
import { Button } from '@/components/ui/button'

const SECTIONS = [
    { id: 'about', title: 'About' },
    { id: 'experience', title: 'Experience' },
    { id: 'contact', title: 'Contact' },
]

export function HomePage() {
    const nameRef = useRef<HTMLHeadingElement>(null)
    return (
        <>
            <title>IceNine</title>
            <div className="relative isolate min-h-svh">
                <Hero nameRef={nameRef} />
                <CategoryBar
                    idle={<HexField focusRef={nameRef} />}
                />

                <nav
                    aria-label="Page sections"
                    className="pointer-events-none relative flex flex-wrap justify-center gap-3 pt-8 pb-16"
                >
                    {SECTIONS.map((section) => (
                        <Button
                            key={section.id}
                            asChild
                            variant="outline"
                            size="sm"
                            className="pointer-events-auto bg-card drop-shadow-[0_2px_6px_rgb(3_20_34/0.75)] hover:border-primary hover:bg-card dark:drop-shadow-[0_0_8px_rgb(0_0_0/0.99)] dark:hover:bg-card"
                        >
                            <a href={`#${section.id}`}>
                                {section.title}
                                <IconArrowDown data-icon="inline-end" />
                            </a>
                        </Button>
                    ))}
                </nav>
            </div>

            <HomeSection id="about" number="01" title="About">
                <p className="text-center text-lg">
                    I'm a software developer moving from test automation into
                    full-time development. Bulding tools, automating drudgery,
                    and enabling those around me to do what they love are the
                    things I do best.
                </p>
            </HomeSection>

            <HomeSection id="experience" number="02" title="Experience" wide>
                <ExperienceSection />
            </HomeSection>

            <HomeSection id="contact" number="03" title="Contact">
                <ContactSection />
            </HomeSection>
        </>
    )
}
