import { useId, useRef, useState, type RefCallback } from 'react'
import { IconPlus, IconX } from '@tabler/icons-react'
import {
    ariaDisabledClass,
    numberInputClass,
    underlineInputClass,
} from '@/components/field-styles'
import { SectionTitle } from '@/components/section-title'
import { glideClass } from '@/components/motion-styles'
import { Button } from '@/components/ui/button'
import { Hint } from '@/components/hint'
import { Input } from '@/components/ui/input'
import { useFocusAfterRender } from '@/hooks/use-focus-after-render'
import { useNumberField } from '@/hooks/use-number-field'
import { animateLayout } from '@/lib/animate-layout'
import { errorMessage, postJson } from '@/lib/api'
import { neighborAfterRemoval } from '@/lib/focus'
import type { CreatedPoll } from './api-types'
import { DurationField } from './duration-field'
import { FormError } from './form-error'
import { useDuration } from './use-duration'
import {
    DEFAULT_DURATION_MINUTES,
    POLL_LIMITS,
    validateNewPoll,
} from './poll-rules'
import { eyebrowClass } from '@/components/text-styles'

type OptionRow = { id: string; text: string }

// Each row gets a permanent ID to use as its React key, so removing one row can't mix up the others
function newRow(): OptionRow {
    return { id: crypto.randomUUID(), text: '' }
}

const textInputClass = `${underlineInputClass} text-base`

type CreatePollFormProps = {
    onCreated: (poll: CreatedPoll) => void
    // Focuses the question as the form appears, for when it replaces the new poll's links
    autoFocus?: boolean
}

// Each option row's input and Remove button, which take focus when a row is added or removed
type RowControl = 'input' | 'remove'

export function CreatePollForm({
    onCreated,
    autoFocus = false,
}: CreatePollFormProps) {
    const id = useId()
    const [title, setTitle] = useState('')
    const [options, setOptions] = useState(() => [newRow(), newRow()])
    const voters = useNumberField({ max: POLL_LIMITS.maxVoters, initial: 4 })
    const duration = useDuration(DEFAULT_DURATION_MINUTES)
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const focusAfterRender = useFocusAfterRender()
    const rowControls = useRef(new Map<string, HTMLElement>())

    function rowControlRef(
        control: RowControl,
        rowId: string,
    ): RefCallback<HTMLElement> {
        const key = `${control}:${rowId}`
        return (node) => {
            if (node) rowControls.current.set(key, node)
            else rowControls.current.delete(key)
        }
    }

    function focusRowControl(control: RowControl, rowId: string): void {
        focusAfterRender(() => rowControls.current.get(`${control}:${rowId}`))
    }

    function updateOption(rowId: string, text: string) {
        setOptions((rows) =>
            rows.map((row) => (row.id === rowId ? { ...row, text } : row)),
        )
    }

    // Rows, and everything below them, glide into place as one is added or removed

    // Adding the last row allowed takes away the Add button, so focus moves into the new row
    function addOption() {
        const row = newRow()
        if (options.length + 1 >= POLL_LIMITS.maxOptions) {
            focusRowControl('input', row.id)
        }
        animateLayout(() => setOptions((rows) => [...rows, row]))
    }

    // Focus moves to the next row's Remove button, or the previous row's if this was the last. Back
    // at the fewest options allowed, the Remove buttons go away, so focus goes to that row's input
    function removeOption(rowId: string) {
        const index = options.findIndex((row) => row.id === rowId)
        const next = neighborAfterRemoval(options, index)
        if (next) {
            const removesLeft = options.length - 1 > POLL_LIMITS.minOptions
            focusRowControl(removesLeft ? 'remove' : 'input', next.id)
        }

        animateLayout(() =>
            setOptions((rows) => rows.filter((row) => row.id !== rowId)),
        )
    }

    // The message slides open or closed, rather than pushing the button down in one jump
    function showError(message: string | null) {
        animateLayout(() => setError(message))
    }

    async function submit() {
        // The Create button stays focusable while the poll is sent (aria-disabled), and Enter in a
        // field submits the form too, so a second try is ignored here
        if (submitting) return
        // The same rules the Worker checks, so most mistakes show up instantly.
        // Rows left empty are skipped rather than treated as mistakes
        const check = validateNewPoll({
            title,
            options: options
                .map((row) => row.text)
                .filter((text) => text.trim() !== ''),
            expectedVoters: voters.number,
            durationMinutes: duration.total,
        })
        if (!check.ok) {
            showError(check.error)
            return
        }

        showError(null)
        setSubmitting(true)
        try {
            onCreated(await postJson<CreatedPoll>('/api/polls', check.value))
        } catch (caught) {
            showError(errorMessage(caught))
            setSubmitting(false)
        }
    }

    return (
        <form
            noValidate
            onSubmit={(event) => {
                event.preventDefault()
                void submit()
            }}
            className={`divide-y border bg-card ${glideClass}`}
        >
            <section className="flex flex-col gap-3 p-4">
                <SectionTitle>New poll</SectionTitle>
                <div>
                    <label htmlFor={`${id}-title`} className={eyebrowClass}>
                        Question
                    </label>
                    <Input
                        id={`${id}-title`}
                        autoFocus={autoFocus}
                        value={title}
                        maxLength={POLL_LIMITS.titleLength}
                        placeholder="What should our poll be about?"
                        onChange={(event) => setTitle(event.target.value)}
                        className={textInputClass}
                    />
                </div>
            </section>

            <section className={`flex flex-col gap-3 p-4 ${glideClass}`}>
                <SectionTitle>Options</SectionTitle>
                <ol className="flex flex-col gap-2">
                    {options.map((row, index) => (
                        <li
                            key={row.id}
                            className={`flex items-center gap-3 ${glideClass}`}
                        >
                            <span
                                aria-hidden="true"
                                className="w-4 shrink-0 text-right font-heading text-sm text-muted-foreground"
                            >
                                {index + 1}
                            </span>
                            <Input
                                ref={rowControlRef('input', row.id)}
                                aria-label={`Option ${index + 1}`}
                                value={row.text}
                                maxLength={POLL_LIMITS.optionLength}
                                onChange={(event) =>
                                    updateOption(row.id, event.target.value)
                                }
                                className={textInputClass}
                            />
                            {options.length > POLL_LIMITS.minOptions && (
                                // To the right, into the margin, instead of over the other rows
                                <Hint
                                    label={`Remove option ${index + 1}`}
                                    side="right"
                                >
                                    <Button
                                        ref={rowControlRef('remove', row.id)}
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        aria-label={`Remove option ${index + 1}`}
                                        onClick={() => removeOption(row.id)}
                                    >
                                        <IconX />
                                    </Button>
                                </Hint>
                            )}
                        </li>
                    ))}
                </ol>
                {options.length < POLL_LIMITS.maxOptions && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        className={`self-start ${glideClass}`}
                    >
                        <IconPlus />
                        Add option
                    </Button>
                )}
            </section>

            <section className={`flex flex-col gap-3 p-4 ${glideClass}`}>
                <SectionTitle>Poll length</SectionTitle>
                <DurationField id={`${id}-length`} duration={duration} />
            </section>

            <section className={`flex flex-col gap-4 p-4 ${glideClass}`}>
                <div className="grid grid-cols-[minmax(0,1fr)_5rem] items-center gap-3">
                    <label htmlFor={`${id}-voters`} className={eyebrowClass}>
                        Expected voters
                    </label>
                    <Input
                        id={`${id}-voters`}
                        inputMode="numeric"
                        {...voters.inputProps}
                        className={numberInputClass}
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    Used to show progress, like “3 of 5 voted.”
                </p>
                <FormError message={error} />
                {/* aria-disabled, not disabled, while the poll is sent: if it fails, focus stays here
                    with the error just above */}
                <Button
                    type="submit"
                    aria-disabled={submitting}
                    className={ariaDisabledClass}
                >
                    {submitting ? 'Creating…' : 'Create poll'}
                </Button>
            </section>
        </form>
    )
}
