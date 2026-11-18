import { useMemo, useRef, useState } from 'react'
import { IconDeviceFloppy, IconTrash } from '@tabler/icons-react'
import { cn } from 'cn'
import { Eyebrow } from '@/components/eyebrow'
import { lockedButtonClass } from '@/components/field-styles'
import { Hint } from '@/components/hint'
import { reducedMotionClass } from '@/components/motion-styles'
import { eyebrowClass } from '@/components/text-styles'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { useFlip } from '@/hooks/use-flip'
import { useFocusAfterRender } from '@/hooks/use-focus-after-render'
import { neighborAfterRemoval } from '@/lib/focus'
import { prefersReducedMotion } from '@/lib/motion'
import { cardResults } from './card-results'
import { blasts } from './format'
import { LOCK_REASONS } from './lock-reasons'
import { NameField } from './name-field'
import { MAX_SAVED_BUILDS, type SavedBuild } from './saved-builds'
import type { Frame, SurvivabilityData } from './survivability-types'

type SavedBuildsDialogProps = {
    saves: SavedBuild[]
    data: SurvivabilityData
    standard: Frame
    // All the card slots on the page are taken, so nothing can be loaded
    full: boolean
    onLoad: (build: SavedBuild) => void
    // Returns false if another save already has the new name
    onRename: (id: string, newName: string) => boolean
    onDelete: (id: string) => void
}

/**
 * The Manage saved builds button, and the dialog it opens: every saved build as a tile, where it
 * can be renamed, loaded onto the page as a new card, or deleted. Saving happens on the cards
 */
export function SavedBuildsDialog({
    saves,
    data,
    standard,
    full,
    onLoad,
    onRename,
    onDelete,
}: SavedBuildsDialogProps) {
    const [open, setOpen] = useState(false)
    // Why the last rename didn't happen, until the next one does
    const [renameError, setRenameError] = useState<string | null>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const deleteRefs = useRef(new Map<string, HTMLButtonElement>())
    const focusAfterRender = useFocusAfterRender()
    // The dialog box, which shrinks smoothly along with the tiles when one is deleted
    const boxRef = useRef<HTMLDivElement>(null)
    const flip = useFlip<string>(boxRef)
    // The save whose tile is fading out, so a second click can't delete twice
    const leaving = useRef<string | null>(null)

    // Each save's frame and blasts to kill, worked out once per change to the saves. A save whose
    // frame the data no longer has gets null, and can't be loaded
    const details = useMemo(
        () =>
            new Map(
                saves.map((save) => {
                    const card = { ...save, collapsed: false }
                    return [save.id, cardResults(card, data, standard)]
                }),
            ),
        [saves, data, standard],
    )

    // The deleted tile fades out, then the tiles after it glide into its place. It takes its
    // button with it, so focus moves to the next tile's Delete, or the previous one's if it was
    // last. With none left, it goes to the title
    function remove(id: string, tile: HTMLElement | null) {
        if (leaving.current) return
        const index = saves.findIndex((save) => save.id === id)
        const next = neighborAfterRemoval(saves, index)

        const finish = () => {
            leaving.current = null
            focusAfterRender(() =>
                next ? deleteRefs.current.get(next.id) : titleRef.current,
            )
            flip.measure()
            onDelete(id)
        }
        if (!tile || prefersReducedMotion()) {
            finish()
            return
        }
        leaving.current = id
        // fill: 'forwards' keeps it invisible after fading, until it's gone
        tile.animate(
            [
                { opacity: 1, transform: 'scale(1)' },
                { opacity: 0, transform: 'scale(0.95)' },
            ],
            { duration: 150, easing: 'ease-out', fill: 'forwards' },
        ).finished.then(finish)
    }

    function rename(id: string, newName: string) {
        const renamed = onRename(id, newName)
        setRenameError(
            renamed
                ? null
                : `Another saved build is already called “${newName.trim()}”.`,
        )
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                setOpen(next)
                setRenameError(null)
            }}
        >
            <DialogTrigger asChild>
                <Button type="button" variant="outline" className="h-10">
                    <IconDeviceFloppy data-icon="inline-start" />
                    Manage saved builds
                </Button>
            </DialogTrigger>
            <DialogContent
                ref={boxRef}
                aria-describedby={undefined}
                // Focus starts on the title, so opening the dialog doesn't drop you into renaming
                // the first build
                onOpenAutoFocus={(event) => {
                    event.preventDefault()
                    titleRef.current?.focus()
                }}
                // Escape while renaming only cancels the rename, which the name field (a textarea)
                // handles
                onEscapeKeyDown={(event) => {
                    if (document.activeElement instanceof HTMLTextAreaElement)
                        event.preventDefault()
                }}
                className={`flex max-h-[85svh] flex-col gap-0 p-0 sm:max-w-3xl ${reducedMotionClass}`}
            >
                <div className="border-b p-6 pr-16">
                    <Eyebrow className="font-semibold text-foreground dark:text-primary">
                        Saved builds
                    </Eyebrow>
                    <DialogTitle
                        ref={titleRef}
                        tabIndex={-1}
                        className="mt-2 text-xl tracking-widest outline-none"
                    >
                        Manage saved builds
                    </DialogTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {saves.length} of {MAX_SAVED_BUILDS} saved.
                    </p>
                    <p
                        aria-live="polite"
                        className="mt-1 text-sm text-destructive empty:hidden"
                    >
                        {renameError}
                    </p>
                </div>

                <div className="min-h-0 overflow-y-auto p-6">
                    {saves.length === 0 ? (
                        <p className="text-muted-foreground">
                            No saved builds yet. Use the save icon on a card to
                            keep it here.
                        </p>
                    ) : (
                        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {saves.map((save) => {
                                const results = details.get(save.id)
                                const lockedReason = !results
                                    ? LOCK_REASONS.frameMissing
                                    : full
                                      ? LOCK_REASONS.loadFull
                                      : undefined
                                return (
                                    <li
                                        key={save.id}
                                        ref={flip.ref(save.id)}
                                        className="flex flex-col gap-3 border bg-card p-4"
                                    >
                                        <NameField
                                            name={save.name}
                                            label="Saved build name"
                                            onRename={(newName) =>
                                                rename(save.id, newName)
                                            }
                                            className="text-sm"
                                        />
                                        <p className="-mt-2 text-sm text-muted-foreground">
                                            {results
                                                ? `${results.frame.name} · ${results.frame.source} · ${results.frame.roles.join(', ')}`
                                                : save.frame}
                                        </p>
                                        <div className="mt-auto flex items-end justify-between gap-3">
                                            <div>
                                                <p className={eyebrowClass}>
                                                    Blasts to kill
                                                </p>
                                                <p className="font-heading text-2xl font-semibold text-primary tabular-nums">
                                                    {results
                                                        ? blasts(
                                                              results.blastsToKill,
                                                          )
                                                        : '—'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Hint
                                                    label={
                                                        lockedReason
                                                            ? `Load ${save.name}`
                                                            : null
                                                    }
                                                    reason={lockedReason}
                                                >
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        aria-label={`Load ${save.name}`}
                                                        aria-disabled={
                                                            lockedReason !==
                                                            undefined
                                                        }
                                                        onClick={() => {
                                                            if (lockedReason)
                                                                return
                                                            setOpen(false)
                                                            onLoad(save)
                                                        }}
                                                        className={cn(
                                                            lockedReason &&
                                                                lockedButtonClass,
                                                        )}
                                                    >
                                                        Load
                                                    </Button>
                                                </Hint>
                                                <Hint
                                                    label={`Delete ${save.name}`}
                                                >
                                                    <Button
                                                        ref={(node) => {
                                                            if (node)
                                                                deleteRefs.current.set(
                                                                    save.id,
                                                                    node,
                                                                )
                                                            else
                                                                deleteRefs.current.delete(
                                                                    save.id,
                                                                )
                                                        }}
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label={`Delete ${save.name}`}
                                                        onClick={(event) =>
                                                            remove(
                                                                save.id,
                                                                event.currentTarget.closest(
                                                                    'li',
                                                                ),
                                                            )
                                                        }
                                                    >
                                                        <IconTrash />
                                                    </Button>
                                                </Hint>
                                            </div>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
