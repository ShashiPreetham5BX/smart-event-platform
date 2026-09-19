import { useRef, useCallback } from "react"

/**
 * Simple client-side rate limiter: allows at most `maxAttempts` calls
 * within a `windowMs` sliding window. Resets automatically as old
 * attempts fall outside the window.
 *
 * NOTE: this only protects against accidental rapid-fire clicks from
 * a normal browser session — it is not a substitute for server-side
 * rate limiting, since it can be bypassed by calling the API directly.
 */
export const useRateLimit = (maxAttempts = 5, windowMs = 60000) => {
    const attemptsRef = useRef([])

    const isAllowed = useCallback(() => {
        const now = Date.now()

        // Drop any attempts older than the window
        attemptsRef.current = attemptsRef.current.filter((t) => now - t < windowMs)

        if (attemptsRef.current.length >= maxAttempts) {
            return false
        }

        attemptsRef.current.push(now)
        return true
    }, [maxAttempts, windowMs])

    const getRetryAfterSeconds = useCallback(() => {
        if (attemptsRef.current.length === 0) return 0
        const oldest = attemptsRef.current[0]
        const msLeft = windowMs - (Date.now() - oldest)
        return Math.max(0, Math.ceil(msLeft / 1000))
    }, [windowMs])

    return { isAllowed, getRetryAfterSeconds }
}