import { IconArrowDown } from '@tabler/icons-react'
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
    return (
        <>
            <title>IceNine</title>
            <Hero />
            <CategoryBar idle={<HexField />} />

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

            <HomeSection id="about" number="01" title="About">
                <p className="text-center text-lg">
                    I'm a software developer in Kansas City, moving from test
                    automation into full-time development. I enjoy analyzing
                    systems and finding room for improvement, and I'm always  
                    happy to deliver quality work that enables the people around me
                    do their best.
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
