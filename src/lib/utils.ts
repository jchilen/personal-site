// Kept for the shadcn CLI. components.json points its "utils" alias here, and the CLI rewrites
// imports in the components it adds to use that alias, so new ones import cn from this file.
// Our own code imports from 'cn' directly
export { cn } from 'cn'
