import { createContext, useContext } from 'react'

export const THEMES = ['dark', 'light', 'system'] as const
export type Theme = (typeof THEMES)[number]

type ThemeProviderState = {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: 'system',
    setTheme: () => null,
}

export const ThemeProviderContext =
    createContext<ThemeProviderState>(initialState)

export function useTheme() {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider')

    return context
}
