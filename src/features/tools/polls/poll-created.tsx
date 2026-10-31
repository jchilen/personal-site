import { useId, useState } from 'react'
import { Link } from 'react-router'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { fieldLabelClass, underlineInputClass } from '@/components/field-styles'
import { SectionTitle } from '@/components/section-title'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CreatedPoll } from './api-types'

function CopyField({ label, value }: { label: string; value: string }) {
    const id = useId()
    const [copied, setCopied] = useState(false)

    function copy() {
        navigator.clipboard
            .writeText(value)
            .then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            })
            // If the browser blocks clipboard access, the link can still be selected and copied by hand
            .catch(() => {})
    }

    return (
        <div>
            <label htmlFor={id} className={fieldLabelClass}>
                {label}
            </label>
            <div className="mt-1 flex items-center gap-2">
                <Input
                    id={id}
                    readOnly
                    value={value}
                    onFocus={(event) => event.currentTarget.select()}
                    className={`${underlineInputClass} min-w-0 flex-1 text-sm`}
                />
                <Button type="button" variant="outline" size="sm" onClick={copy}>
                    {copied ? <IconCheck /> : <IconCopy />}
                    {copied ? 'Copied' : 'Copy'}
                </Button>
            </div>
        </div>
    )
}

type PollCreatedProps = {
    poll: CreatedPoll
    onCreateAnother: () => void
}

export function PollCreated({ poll, onCreateAnother }: PollCreatedProps) {
    const pollPath = `/tools/polls/${poll.id}`
    // The token goes after #, which browsers never send to the server, so it can't end up in request logs
    const adminPath = `${pollPath}/admin#${poll.adminToken}`

    return (
        <div className="flex flex-col gap-4 border bg-card p-4">
            <SectionTitle>Poll created</SectionTitle>
            <CopyField label="Share with voters" value={window.location.origin + pollPath} />
            <CopyField label="Your admin link" value={window.location.origin + adminPath} />
            <p className="text-sm text-muted-foreground">
                Save the admin link somewhere safe. This browser can already manage the poll, but the
                link is the only way to do it from another device or after clearing cookies. It
                isn't shown again.
            </p>
            <div className="flex flex-wrap gap-2">
                <Button asChild>
                    <Link to={`${pollPath}/admin`}>Manage poll</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link to={pollPath}>Open ballot</Link>
                </Button>
                <Button type="button" variant="ghost" onClick={onCreateAnother}>
                    Create another
                </Button>
            </div>
        </div>
    )
}