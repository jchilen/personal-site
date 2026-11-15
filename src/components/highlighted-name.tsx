// The name with the typed letters underlined, so it's clear why it matched
export function HighlightedName({
    name,
    search,
}: {
    name: string
    search: string
}) {
    const start = search === '' ? -1 : name.toLowerCase().indexOf(search)
    if (start === -1) return name
    const end = start + search.length

    return (
        <>
            {name.slice(0, start)}
            <mark className="bg-transparent font-semibold text-foreground underline underline-offset-3">
                {name.slice(start, end)}
            </mark>
            {name.slice(end)}
        </>
    )
}