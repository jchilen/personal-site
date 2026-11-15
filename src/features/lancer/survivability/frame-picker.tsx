import { useState, type ReactNode } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { cn } from 'cn'
import { FilterChoice } from '@/components/filter-choice'
import { lockedClass, underlineInputClass } from '@/components/field-styles'
import { HighlightedName } from '@/components/highlighted-name'
import { Hint } from '@/components/hint'
import { reducedMotionClass } from '@/components/motion-styles'
import { SectionTitle } from '@/components/section-title'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { LOCK_REASONS } from './lock-reasons'
import type { Frame } from './survivability-types'

// The core manufacturers first, in the order the core book lists them. Sources the data gains later
// (new LCPs) follow in alphabetical order instead of disappearing
const SOURCE_ORDER = ['GMS', 'IPS-N', 'SSC', 'HORUS', 'HA']
const ROLE_ORDER = [
    'Striker',
    'Controller',
    'Defender',
    'Support',
    'Artillery',
    'Balanced',
]

// Every value the frames have, known ones in their set order and the rest alphabetically after
function inOrder(values: string[], known: string[]): string[] {
    const unique = [...new Set(values)]
    return [
        ...known.filter((value) => unique.includes(value)),
        ...unique.filter((value) => !known.includes(value)).sort(),
    ]
}

type FramePickerProps = {
    frames: Frame[]
    // At the most cards allowed, so the button is locked and the picker won't open
    full: boolean
    onPick: (frame: string) => void
}

/** The New frame card button, and the picker it opens: every frame by manufacturer, with search and filters */
export function FramePicker({ frames, full, onPick }: FramePickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Hint label={full ? LOCK_REASONS.cardsFull : null}>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className={cn('h-10', full && lockedClass)}
                        aria-disabled={full}
                        onClick={(event) => {
                            // A locked button stays focusable, for its tooltip, but doesn't open the picker
                            if (full) event.preventDefault()
                        }}
                    >
                        <IconPlus data-icon="inline-start" />
                        New frame card
                    </Button>
                </DialogTrigger>
            </Hint>
            <DialogContent
                // A fixed height, so the dialog doesn't jump as filters change how many frames show. On phones the
                // whole dialog scrolls, so the filters can scroll out of the way; on bigger screens only the
                // frame list scrolls, keeping the search and filters in view
                className={`flex h-[min(85svh,56rem)] flex-col gap-4 overflow-y-auto sm:max-w-3xl sm:overflow-hidden ${reducedMotionClass}`}
            >
                {/* Inside the dialog, so the search and filters start fresh each time it opens */}
                <PickerContents
                    frames={frames}
                    onPick={(frame) => {
                        onPick(frame)
                        setIsOpen(false)
                    }}
                />
            </DialogContent>
        </Dialog>
    )
}

type PickerContentsProps = {
    frames: Frame[]
    onPick: (frame: string) => void
}

function PickerContents({ frames, onPick }: PickerContentsProps) {
    const [query, setQuery] = useState('')
    // Empty means no filter. Several can be on at once: a frame shows if it matches any of them
    const [chosenSources, setChosenSources] = useState<string[]>([])
    const [chosenRoles, setChosenRoles] = useState<string[]>([])
    const search = query.trim().toLowerCase()

    const sources = inOrder(
        frames.map((frame) => frame.source),
        SOURCE_ORDER,
    )
    const roles = inOrder(
        frames.flatMap((frame) => frame.roles),
        ROLE_ORDER,
    )
    const shown = frames.filter(
        (frame) =>
            (chosenSources.length === 0 ||
                chosenSources.includes(frame.source)) &&
            (chosenRoles.length === 0 ||
                frame.roles.some((role) => chosenRoles.includes(role))) &&
            frame.name.toLowerCase().includes(search),
    )
    const first = shown.at(0)
    const groups = sources
        .map((name): [string, Frame[]] => [
            name,
            shown.filter((frame) => frame.source === name),
        ])
        .filter(([, members]) => members.length > 0)

    // Read out as the list changes, so screen readers hear how many frames are left
    let status: ReactNode = null
    if (!first) status = 'No frame matches.'
    else if (
        search !== '' ||
        chosenSources.length > 0 ||
        chosenRoles.length > 0
    ) {
        status = `${shown.length} ${shown.length === 1 ? 'frame' : 'frames'}. Press Enter in the search box to add ${first.name}.`
    }

    return (
        <>
            <div className="flex flex-col gap-1 pr-10">
                <DialogTitle>Choose a frame</DialogTitle>
                <DialogDescription>
                    Picking a frame adds a card for it.
                </DialogDescription>
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                    <Input
                        type="search"
                        placeholder="Search frames"
                        aria-label="Search frames"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                            // Enter adds the first frame shown, so you can choose without the mouse
                            if (event.key === 'Enter' && first) {
                                event.preventDefault()
                                onPick(first.name)
                            }
                        }}
                        className={underlineInputClass}
                    />
                    <p
                        aria-live="polite"
                        className="min-h-4 text-xs text-muted-foreground"
                    >
                        {status}
                    </p>
                </div>
                <FilterChoice
                    label="Manufacturer"
                    options={sources}
                    selected={chosenSources}
                    onChange={setChosenSources}
                />
                <FilterChoice
                    label="Role"
                    options={roles}
                    selected={chosenRoles}
                    onChange={setChosenRoles}
                />
            </div>
            <div className="-mx-1 flex flex-col gap-4 px-1 pb-1 sm:min-h-0 sm:flex-1 sm:overflow-y-auto">
                {groups.map(([name, members]) => (
                    <section key={name}>
                        <div className="mb-2">
                            <SectionTitle as="h3">
                                {name} · {members.length}
                            </SectionTitle>
                        </div>
                        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {members.map((frame) => (
                                <li key={frame.name}>
                                    <button
                                        type="button"
                                        onClick={() => onPick(frame.name)}
                                        className="flex w-full flex-col items-start border bg-background px-3 py-2 text-left transition hover:border-primary focus-visible:border-primary"
                                    >
                                        <span className="text-sm font-semibold">
                                            <HighlightedName
                                                name={frame.name}
                                                search={search}
                                            />
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {frame.roles.join(', ')}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>
        </>
    )
}