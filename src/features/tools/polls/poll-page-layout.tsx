import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { IconArrowLeft } from '@tabler/icons-react'
import { ToolLayout } from '@/components/tool-layout'

type PollPageLayoutProps = {
    eyebrow: string
    title: string
    intro: string
    children: ReactNode
}

// The shared frame for a poll's own pages (ballot, admin, results): a link back to Polling Home,
// kept out of search results, in a narrow column
export function PollPageLayout({
    eyebrow,
    title,
    intro,
    children,
}: PollPageLayoutProps) {
    return (
        <ToolLayout eyebrow={eyebrow} title={title} intro={intro}>
            <meta name="robots" content="noindex" />
            <div className="mx-auto max-w-md">
                <Link
                    to="/tools/polls"
                    className="mb-3 inline-flex items-center gap-1.5 font-heading text-xs tracking-eyebrow text-cat-tools uppercase transition-colors hover:text-foreground"
                >
                    <IconArrowLeft aria-hidden="true" className="size-3.5" />
                    <span className="[text-box:trim-both_cap_alphabetic]">
                        Polling Home
                    </span>
                </Link>
                {children}
            </div>
        </ToolLayout>
    )
}
