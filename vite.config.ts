import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import mdx from '@mdx-js/rollup'
import rehypeSlug from 'rehype-slug'
import withToc from '@stefanprobst/rehype-extract-toc'
import withTocExport from '@stefanprobst/rehype-extract-toc/mdx'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        {
            enforce: 'pre',
            ...mdx({ rehypePlugins: [rehypeSlug, withToc, withTocExport] }),
        },
        react({ include: /\.(mdx|js|jsx|ts|tsx)$/ }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, './src'),
        },
    },
})
