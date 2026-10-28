import { useState, type ChangeEvent } from 'react'

type NumberFieldOptions = {
    max: number
    initial?: number
    decimal?: boolean // allow one decimal point, like 6.5
}

// A number input that can be emptied while editing and restores its previous value if left empty
export function useNumberField({
    max,
    initial = 0,
    decimal = false,
}: NumberFieldOptions) {
    const [text, setText] = useState(String(initial))
    const [previous, setPrevious] = useState(String(initial)) // the value when editing started

    const number = Number(text === '' ? previous : text) // empty → keep using the previous value

    function setNumber(next: number) {
        setText(String(Math.min(max, Math.max(0, next))))
    }

    function clean(raw: string) {
        if (!decimal) return raw.replace(/\D/g, '')
        // Keep digits and only the first decimal point
        const [whole, ...rest] = raw.replace(/[^\d.]/g, '').split('.')
        return rest.length > 0 ? `${whole}.${rest.join('')}` : whole
    }

    const inputProps = {
        value: text,
        onFocus: () => setPrevious(text), // remember the value as editing starts
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
            const cleaned = clean(event.target.value)
            if (cleaned === '') {
                setText('')
            } else if (Number(cleaned) > max) {
                setText(String(max))
            } else {
                // Whole numbers drop leading zeros ("007" → "7"); decimals are left
                // alone mid-typing so "6." doesn't snap back to "6"
                setText(decimal ? cleaned : String(Number(cleaned)))
            }
        },
        onBlur: () => {
            // Left empty, or just "." → put the old value back
            if (text === '' || Number.isNaN(Number(text))) setText(previous)
        },
    }

    return { number, setNumber, inputProps }
}