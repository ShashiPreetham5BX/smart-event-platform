import { useState, useCallback, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { supabase } from "../services/supabase"
import CheckInScanner from "../components/CheckInScanner"
import { useCheckIn } from "../hooks/useCheckIn"
import {
    cacheTicketsForEvent,
    getCachedTicket,
    markCheckedInLocally,
    queueCheckIn,
    getQueuedCheckIns,
    removeFromQueue
} from "../utils/offlineDb"
import { useToast } from "../context/ToastContext"

const CheckIn = () => {
    const { checkInTicket, processing } = useCheckIn()
    const { showToast } = useToast()
    const [searchParams] = useSearchParams()
    const eventId = searchParams.get("event")

    const [result, setResult] = useState(null)
    const [paused, setPaused] = useState(false)
    const [isOnline, setIsOnline] = useState(navigator.onLine)
    const [downloading, setDownloading] = useState(false)
    const [downloadedCount, setDownloadedCount] = useState(0)
    const [queuedCount, setQueuedCount] = useState(0)
    const [manualToken, setManualToken] = useState("")

    // Track real browser online/offline state
    useEffect(() => {
        const goOnline = () => setIsOnline(true)
        const goOffline = () => setIsOnline(false)

        window.addEventListener("online", goOnline)
        window.addEventListener("offline", goOffline)

        return () => {
            window.removeEventListener("online", goOnline)
            window.removeEventListener("offline", goOffline)
        }
    }, [])

    const refreshQueueCount = useCallback(async () => {
        const queue = await getQueuedCheckIns()
        setQueuedCount(queue.length)
    }, [])

    const syncQueue = useCallback(async () => {
        const queue = await getQueuedCheckIns()
        if (queue.length === 0) return

        for (const item of queue) {
            const outcome = await checkInTicket(item.ticket_token)

            // We remove it from the queue regardless of outcome — if the
            // server says "already checked in," that's a real conflict from
            // another device, which we surface rather than retry forever.
            await removeFromQueue(item.id)

            if (!outcome.success) {
                showToast(
                    `Sync conflict: ${item.ticket_token.slice(0, 8)}... — ${outcome.message}`,
                    "error"
                )
            }
        }

        refreshQueueCount()
    }, [checkInTicket, refreshQueueCount, showToast])

    useEffect(() => {
        refreshQueueCount()
    }, [refreshQueueCount])

    // Automatically try syncing whenever we come back online
    useEffect(() => {
        if (isOnline) {
            syncQueue()
        }
    }, [isOnline, syncQueue])

    const handleDownloadForOffline = async () => {
        if (!eventId) {
            showToast("Open this page with ?event=EVENT_ID to download tickets for a specific event.", "error")
            return
        }

        setDownloading(true)

        const { data, error } = await supabase
            .from("bookings")
            .select("ticket_token, checked_in_at")
            .eq("event_id", eventId)
            .not("ticket_token", "is", null)

        setDownloading(false)

        if (error) {
            showToast(error.message, "error")
            return
        }

        const tickets = data.map((b) => ({
            ticket_token: b.ticket_token,
            checked_in_locally: b.checked_in_at !== null
        }))

        await cacheTicketsForEvent(tickets)
        setDownloadedCount(tickets.length)
        showToast(`${tickets.length} tickets cached for offline check-in`)
    }

    const handleScan = useCallback(async (token) => {
        if (paused || processing) return

        setPaused(true)

        if (isOnline) {
            // Online: verify directly against the server, same as Feature 6.
            const outcome = await checkInTicket(token)
            setResult(outcome)
        } else {
            // Offline: verify against the local cache instead.
            const cached = await getCachedTicket(token)

            if (!cached) {
                setResult({ success: false, message: "Ticket not found in offline cache." })
            } else if (cached.checked_in_locally) {
                setResult({ success: false, message: "Already checked in (offline record)." })
            } else {
                await markCheckedInLocally(token)
                await queueCheckIn(token)
                await refreshQueueCount()
                setResult({
                    success: true,
                    message: "Checked in offline — will sync when back online.",
                    event_title: "(offline mode)",
                    attendee_email: ""
                })
            }
        }

        setTimeout(() => {
            setResult(null)
            setPaused(false)
        }, 3000)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paused, processing, isOnline])

    return (
        <div className="min-h-screen bg-bg text-text-primary p-6 md:p-10 max-w-lg mx-auto">
            <h1 className="text-3xl font-bold mb-2">Check-In Scanner</h1>

            <div className="flex items-center gap-2 mb-6">
                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-success" : "bg-danger"}`} />
                <span className="text-sm text-text-secondary">
                    {isOnline ? "Online" : "Offline — using cached tickets"}
                </span>
                {queuedCount > 0 && (
                    <span className="ml-auto text-xs bg-warning/15 text-warning px-2 py-1 rounded-full">
                        {queuedCount} pending sync
                    </span>
                )}
            </div>

            <button
                onClick={handleDownloadForOffline}
                disabled={downloading}
                className="w-full mb-6 bg-surface border border-border hover:bg-surface-hover disabled:opacity-50 text-sm font-medium py-3 rounded-lg transition-colors"
            >
                {downloading
                    ? "Downloading..."
                    : downloadedCount > 0
                        ? `✓ ${downloadedCount} tickets cached for offline use`
                        : "Download tickets for offline check-in"}
            </button>

            <CheckInScanner onScan={handleScan} paused={paused} />

            {/* Manual Token Verification fallback */}
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    if (manualToken.trim()) {
                        handleScan(manualToken.trim())
                        setManualToken("")
                    }
                }}
                className="mt-4 flex gap-2"
            >
                <input
                    type="text"
                    placeholder="Enter or paste ticket token (e.g. evt-...)"
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-border text-xs focus:outline-none focus:border-accent font-mono text-text-primary"
                />
                <button
                    type="submit"
                    disabled={!manualToken.trim() || processing}
                    className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                    Verify
                </button>
            </form>

            {result && (
                <div
                    className={`mt-6 rounded-xl p-6 text-center border ${result.success
                            ? "bg-success/10 border-success/30"
                            : "bg-danger/10 border-danger/30"
                        }`}
                >
                    <p className={`text-xl font-bold ${result.success ? "text-success" : "text-danger"}`}>
                        {result.success ? "✓ Checked In" : "✗ " + result.message}
                    </p>
                    {result.success && result.event_title && (
                        <>
                            <p className="text-text-primary mt-2">{result.event_title}</p>
                            {result.attendee_email && (
                                <p className="text-text-secondary text-sm">{result.attendee_email}</p>
                            )}
                        </>
                    )}
                </div>
            )}

            {processing && (
                <p className="text-text-secondary text-center mt-4 text-sm">Verifying...</p>
            )}
        </div>
    )
}

export default CheckIn