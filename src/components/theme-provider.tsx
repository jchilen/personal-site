import { useEffect, useState } from 'react'
import { THEMES, ThemeProviderContext, type Theme } from '@/hooks/use-theme'
import { oneOf } from '@/lib/one-of'

// The inline script in index.html reads this same key, with the same fallback, to pick the theme
// before React loads. Change one and the other must change too, or the page flashes the wrong theme
const STORAGE_KEY = 'theme'
const DEFAULT_THEME: Theme = 'system'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(
        // Anything else in storage (missing, edited by hand, or from an old version) means the default
        () => oneOf(localStorage.getItem(STORAGE_KEY), THEMES, DEFAULT_THEME),
    )

    useEffect(() => {
        const root = window.document.documentElement

        // Pause every CSS transition so the whole page switches themes in one frame
        const pauseTransitions = document.createElement('style')
        pauseTransitions.textContent =
            '*, *::before, *::after { transition: none !important; }'
        document.head.appendChild(pauseTransitions)

        const resolvedTheme =
            theme === 'system'
                ? window.matchMedia('(prefers-color-scheme: dark)').matches
                    ? 'dark'
                    : 'light'
                : theme

        root.classList.remove('light', 'dark')
        root.classList.add(resolvedTheme)

        // Make the browser apply the new colors now, then bring transitions back
        void window.getComputedStyle(document.body).color
        setTimeout(() => pauseTransitions.remove(), 0)
    }, [theme])

    const value = {
        theme,
        setTheme: (theme: Theme) => {
            localStorage.setItem(STORAGE_KEY, theme)
            setTheme(theme)
        },
    }

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}
