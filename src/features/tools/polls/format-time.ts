// The viewer's own language and time zone, e.g. "Sat, Nov 1, 1:05 AM"
const closeTimeFormat = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
})

export function formatCloseTime(timestamp: number): string {
    return closeTimeFormat.format(timestamp)
}
