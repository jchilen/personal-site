/// <reference types="mdx" />
declare module '*.mdx' {
    import type { Toc } from '@stefanprobst/rehype-extract-toc'

    export const tableOfContents: Toc
}
