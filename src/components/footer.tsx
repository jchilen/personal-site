import { IconArrowUpRight } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

function FooterLink({ label, href }: { label: string; href: string }) {
    return (
        <Button asChild variant="link" size="sm">
            <a href={href} target="_blank" rel="noopener noreferrer">
                {label}
                <IconArrowUpRight data-icon="inline-end" />
            </a>
        </Button>
    )
}

export function Footer() {
    const year = new Date().getFullYear()
    return (
        <footer className="flex flex-col items-center gap-4 border-t px-4 py-8 font-heading text-xs tracking-widest text-muted-foreground uppercase">
            <ModeToggle className="sm:hidden" />
            <div className="flex items-center gap-2 sm:gap-6">
                <FooterLink label="GitHub" href="https://github.com/jchilen" />
                <p className="text-center">Joe Chilen // IceNine {year}</p>
                <FooterLink
                    label="LinkedIn"
                    href="https://www.linkedin.com/in/jchilen"
                />
            </div>
        </footer>
    )
}
