import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

function FooterLink({ label, href }: { label: string; href: string }) {
  return (
    <Button asChild variant="link" size="sm">
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
        <ArrowUpRight data-icon="inline-end" />
      </a>
    </Button>
  )
}

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-4 border-t px-4 py-8 font-heading text-xs tracking-widest text-muted-foreground uppercase">
        <div className="flex items-center gap-2 sm:gap-6">
          <FooterLink label="GitHub" href="https://github.com/jchilen" />
            <p>Joe Chilen // IceNine {new Date().getFullYear()}</p>
          <FooterLink label="LinkedIn" href="https://www.linkedin.com/in/your-profile" />
        </div>
      <ModeToggle className="sm:hidden" />
    </footer>
  )
}