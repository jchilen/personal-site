// A failed request's message under a form's button, announced right away by screen readers.
// Renders nothing while there's no error, so callers don't need their own check
export function FormError({ message }: { message: string | null }) {
    if (!message) return null
    return (
        <p role="alert" className="text-sm text-destructive">
            {message}
        </p>
    )
}
