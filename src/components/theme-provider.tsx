import { useEffect, useState } from 'react'
import { ThemeProviderContext, type Theme } from '@/hooks/use-theme'

type ThemeProviderProps = {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'vite-ui-theme',
    ...props
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
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
            localStorage.setItem(storageKey, theme)
            setTheme(theme)
        },
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}
