// The tooltips for a stepper's − or + button once its number can't go any further. Written out
// once here, so every stepper on the site words its limits the same way

/** "Can't go lower than zero", or "Can't go lower than -5" for limits other than 0 */
export function lowerLimitReason(min: number): string {
    return `Can't go lower than ${min === 0 ? 'zero' : min}`
}

/** "Can't go higher than 5" */
export function upperLimitReason(max: number): string {
    return `Can't go higher than ${max}`
}