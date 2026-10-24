import { useState, type ChangeEvent } from 'react'

// A number input that can be emptied while editing and restores its previous value if left empty
export function useNumberField(max: number) {
  const [text, setText] = useState('0')
  const [previous, setPrevious] = useState('0') // the value when editing started

  const number = Number(text === '' ? previous : text) // empty → keep using the previous value

  function setNumber(next: number) {
    setText(String(Math.min(max, Math.max(0, next))))
  }

  const inputProps = {
    value: text,
    onFocus: () => setPrevious(text), // remember the value as editing starts
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value.replace(/\D/g, '')
      setText(digits === '' ? '' : String(Math.min(max, Number(digits))))
    },
    onBlur: () => {
      if (text === '') setText(previous) // left empty → put the old value back
    },
  }

  return { number, setNumber, inputProps }
}