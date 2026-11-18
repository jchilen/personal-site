import { useState, type RefCallback } from 'react'
import { IconPencil } from '@tabler/icons-react'
import { cn } from 'cn'
import { Hint } from '@/components/hint'
import { Button } from '@/components/ui/button'
import { MAX_NAME_LENGTH } from './settings'

type NameFieldProps = {
    name: string
    // The field's name for screen readers, like "Card name"
    label: string
    onRename: (name: string) => void
    // Called with each change to the draft as you type, and null once editing ends, for anything
    // beside the field that should show the name it's about to have
    onDraftChange?: (draft: string | null) => void
    inputRef?: RefCallback<HTMLTextAreaElement>
    // The text size, like text-lg on a card
    className?: string
}

/**
 * A name edited in place, with a pencil button that starts editing. While typing it's a draft;
 * leaving the field (or Enter) renames, and Escape puts the old name back. Whatever onRename does
 * with a blank or refused name, the field shows `name` again once you leave it.
 *
 * It's a one-line textarea rather than an input, because an input never wraps: on a narrow screen
 * a long name would be cut off. A textarea wraps onto more lines instead, and field-sizing grows it
 * to fit. Enter still finishes editing, and pasted line breaks become spaces, so it stays one line
 * of text
 */
export function NameField({
    name,
    label,
    onRename,
    onDraftChange,
    inputRef,
    className,
}: NameFieldProps) {
    const [draft, setDraftState] = useState<string | null>(null)
    const [input, setInput] = useState<HTMLTextAreaElement | null>(null)

    function setDraft(next: string | null) {
        setDraftState(next)
        onDraftChange?.(next)
    }

    return (
        <div className="flex min-w-0 items-center gap-1">
            <textarea
                ref={(node) => {
                    setInput(node)
                    inputRef?.(node)
                }}
                aria-label={label}
                value={draft ?? name}
                maxLength={MAX_NAME_LENGTH}
                // One line tall where field-sizing isn't supported, like the input it replaced
                rows={1}
                onFocus={() => setDraft(name)}
                onChange={(event) =>
                    setDraft(event.target.value.replace(/\s*[\r\n]+\s*/g, ' '))
                }
                onBlur={() => {
                    if (draft !== null) onRename(draft)
                    setDraft(null)
                }}
                onKeyDown={(event) => {
                    // preventDefault: Enter would otherwise add a line break before the blur
                    if (event.key === 'Enter') {
                        event.preventDefault()
                        event.currentTarget.blur()
                    }
                    if (event.key === 'Escape') {
                        setDraft(null)
                        // Blurring after clearing the draft saves nothing
                        requestAnimationFrame(() => input?.blur())
                    }
                }}
                className={cn(
                    'field-sizing-content max-w-full min-w-16 resize-none border-b border-dashed border-muted-foreground bg-transparent font-heading font-semibold tracking-widest uppercase outline-none focus-visible:border-solid focus-visible:border-cat-lancer',
                    className,
                )}
            />
            <Hint label="Rename">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Rename ${name}`}
                    onClick={() => input?.focus()}
                >
                    <IconPencil />
                </Button>
            </Hint>
        </div>
    )
}
