// The import makes this file a module, so the block below adds to React's types instead of
// replacing them
import 'react'

// Lets inline styles set CSS variables, like style={{ '--category-color': color }}, without a cast
declare module 'react' {
    interface CSSProperties {
        [key: `--${string}`]: string | number
    }
}
