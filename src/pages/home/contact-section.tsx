import { IconArrowUpRight } from '@tabler/icons-react'

import { SOCIAL_LINKS } from '@/data/social-links'

const CHANNELS = [
    { ...SOCIAL_LINKS.linkedin, action: 'Profile' },
    { ...SOCIAL_LINKS.github, action: 'Code' },
]

export function ContactSection() {
    return (
        <div className="mx-auto max-w-md">
            <ul>
                {CHANNELS.map((channel) => (
                    <li key={channel.label} className="-mt-px first:mt-0">
                        <a
                            href={channel.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/channel corner-brackets flex items-center justify-between border bg-card px-5 py-4 font-heading text-sm tracking-eyebrow uppercase [--brackets-hover-opacity:1] dark:hover:text-primary"
                        >
                            {channel.label}
                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors group-hover/channel:text-foreground dark:group-hover/channel:text-primary">
                                {channel.action}
                                <IconArrowUpRight className="size-4" />
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
            <p className="mt-4 text-center text-sm text-muted-foreground">
                Fastest reply via email, which you can find on my LinkedIn.
            </p>
        </div>
    )
}
