import { useId, useState } from 'react'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { fieldLabelClass, underlineInputClass } from '@/components/field-styles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CopyField({ label, value }: { label: string; value: string }) {
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
