import { useId, useState } from 'react'
import { IconPlus, IconX } from '@tabler/icons-react'
import {
    fieldLabelClass,
    numberInputClass,
    underlineInputClass,
} from '@/components/field-styles'
import { SectionTitle } from '@/components/section-title'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNumberField } from '@/hooks/use-number-field'
import { errorMessage, postJson } from '@/lib/api'
import type { CreatedPoll } from './api-types'
import { POLL_LIMITS, validateNewPoll } from './poll-rules'

type OptionRow = { id: string; text: string }

// Each row gets a permanent ID to use as its React key, so removing one row can't mix up the others
function newRow(): OptionRow {
    return { id: crypto.randomUUID(), text: '' }
}

const textInputClass = `${underlineInputClass} text-base`

export function CreatePollForm({
    onCreated,
}: {
    onCreated: (poll: CreatedPoll) => void
}) {
    const id = useId()
    const [title, setTitle] = useState('')
    const [options, setOptions] = useState(() => [newRow(), newRow()])
    const voters = useNumberField({ max: POLL_LIMITS.maxVoters, initial: 4 })
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    function updateOption(rowId: string, text: string) {
        setOptions((rows) =>
            rows.map((row) => (row.id === rowId ? { ...row, text } : row)),
        )
    }

    function removeOption(rowId: string) {
        setOptions((rows) => rows.filter((row) => row.id !== rowId))
    }

    async function submit() {
        // The same rules the Worker checks, so most mistakes show up instantly.
        // Rows left empty are skipped rather than treated as mistakes
        const check = validateNewPoll({
            title,
            options: options
                .map((row) => row.text)
                .filter((text) => text.trim() !== ''),
            expectedVoters: voters.number,
        })
        if (!check.ok) {
            setError(check.error)
            return
        }

        setError(null)
        setSubmitting(true)
        try {
            onCreated(await postJson<CreatedPoll>('/api/polls', check.value))
        } catch (caught) {
            setError(errorMessage(caught))
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
            className="divide-y border bg-card"
        >
            <section className="flex flex-col gap-3 p-4">
                <SectionTitle>New poll</SectionTitle>
                <div>
                    <label htmlFor={`${id}-title`} className={fieldLabelClass}>
                        Question
                    </label>
                    <Input
                        id={`${id}-title`}
                        value={title}
                        maxLength={POLL_LIMITS.titleLength}
                        placeholder="Where should we eat on Friday?"
                        onChange={(event) => setTitle(event.target.value)}
                        className={textInputClass}
                    />
                </div>
            </section>

            <section className="flex flex-col gap-3 p-4">
                <SectionTitle>Options</SectionTitle>
                <ol className="flex flex-col gap-2">
                    {options.map((row, index) => (
                        <li key={row.id} className="flex items-center gap-3">
                            <span
                                aria-hidden="true"
                                className="w-4 shrink-0 text-right font-heading text-sm text-muted-foreground"
                            >
                                {index + 1}
                            </span>
                            <Input
                                aria-label={`Option ${index + 1}`}
                                value={row.text}
                                maxLength={POLL_LIMITS.optionLength}
                                onChange={(event) =>
                                    updateOption(row.id, event.target.value)
                                }
                                className={textInputClass}
                            />
                            {options.length > POLL_LIMITS.minOptions && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    aria-label={`Remove option ${index + 1}`}
                                    onClick={() => removeOption(row.id)}
                                >
                                    <IconX />
                                </Button>
                            )}
                        </li>
                    ))}
                </ol>
                {options.length < POLL_LIMITS.maxOptions && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setOptions((rows) => [...rows, newRow()])
                        }
                        className="self-start"
                    >
                        <IconPlus />
                        Add option
                    </Button>
                )}
            </section>

            <section className="flex flex-col gap-4 p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_5rem] items-center gap-3">
                    <label htmlFor={`${id}-voters`} className={fieldLabelClass}>
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
                    Used to show progress, like “3 of 5 voted.” Extra votes
                    still count.
                </p>
                {error && (
                    <p role="alert" className="text-sm text-destructive">
                        {error}
                    </p>
                )}
                <Button type="submit" disabled={submitting}>
                    {submitting ? 'Creating…' : 'Create poll'}
                </Button>
            </section>
        </form>
    )
}
