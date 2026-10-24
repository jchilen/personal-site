import { IconMoon, IconSun } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'

export function ModeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme()

    const isDark =
        theme === 'dark' ||
        (theme === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches)

    return (
        <Button
            variant="inverse"
            size="sm"
            className={className}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
            {isDark ? <IconSun /> : <IconMoon />}
            {isDark ? 'Light Mode' : 'Dark Mode'}
        </Button>
    )
}
