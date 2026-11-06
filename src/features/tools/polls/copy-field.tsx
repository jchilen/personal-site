import { useEffect, useId, useRef, useState } from 'react'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { underlineInputClass } from '@/components/field-styles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { eyebrowClass } from '@/components/text-styles'

export function CopyField({ label, value }: { label: string; value: string }) {
    const id = useId()
    const [copied, setCopied] = useState(false)
    // The pending "back to Copy" timer, so a second click restarts it instead of being cut short
    const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

    // Stop the timer if the field goes away first
    useEffect(() => () => clearTimeout(resetTimer.current), [])

    function copy() {
        navigator.clipboard
            .writeText(value)
            .then(() => {
                setCopied(true)
                clearTimeout(resetTimer.current)
                resetTimer.current = setTimeout(() => setCopied(false), 2000)
            })
            // If the browser blocks clipboard access, the link can still be selected and copied by hand
            .catch(() => {})
    }

    return (
        <div>
            <label htmlFor={id} className={eyebrowClass}>
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
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copy}
                >
                    {copied ? <IconCheck /> : <IconCopy />}
                    {copied ? 'Copied' : 'Copy'}
                </Button>
            </div>
        </div>
    )
}
