import { IconArrowDown } from '@tabler/icons-react'
import { Hero } from './hero'
import { HomeSection } from './home-section'
import { ExperienceSection } from './experience-section'
import { ContactSection } from './contact-section'
import { HexField } from './hex-field'
import { CategoryBar } from '@/components/category-bar'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'

const SECTIONS = [
    { id: 'about', title: 'About' },
    { id: 'experience', title: 'Experience' },
    { id: 'contact', title: 'Contact' },
]

export function HomePage() {
    const { theme } = useTheme()
    return (
        <>
            <title>IceNine</title>
            <div className="relative isolate min-h-svh">
                <Hero />
                <CategoryBar idle={<HexField key={theme} />} />

                <p className="pointer-events-none relative mx-auto mt-8 max-w-md text-center text-lg/relaxed text-balance text-shadow-halo halo-blur">
                    Building tools, automating drudgery, and enabling
                    those around me to do what they love.
                </p>

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
                            className="pointer-events-auto relative bg-card halo-blur hover:border-primary hover:bg-card dark:hover:bg-card"
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
                    I'm a software developer in Kansas City, moving from test
                    automation into full-time development. I have passions for
                    soccer, games, and improving efficiency in the systems I
                    work in.
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
