import { Link } from 'react-router'
import { SectionTitle } from '@/components/section-title'
import { Button } from '@/components/ui/button'
import type { CreatedPoll } from './api-types'
import { CopyField } from './copy-field'

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
            <CopyField
                label="Share with voters"
                value={window.location.origin + pollPath}
            />
            <CopyField
                label="Your admin link"
                value={window.location.origin + adminPath}
            />
            <p className="text-sm text-muted-foreground">
                Save the admin link if you want to access this from another
                device, this browser can already manage the poll.
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
