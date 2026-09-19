import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { supabase } from "../services/supabase"
import { useAuth } from "../context/AuthContext"
import { useReviews } from "../hooks/useReviews"
import { useToast } from "../context/ToastContext"
import { FaStar, FaRegStar } from "react-icons/fa"
import { useWaitlist } from "../hooks/useWaitlist"
import CredibilityBadge from "../components/ui/CredibilityBadge"
import RelatedEvents from "../components/RelatedEvents"
import { useExpectedNoShows } from "../hooks/useExpectedNoShows"

const StarRating = ({ value }) => (
    <span className="inline-flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) =>
            n <= value ? (
                <FaStar key={n} className="text-warning text-sm" />
            ) : (
                <FaRegStar key={n} className="text-text-muted text-sm" />
            )
        )}
    </span>
)

const EventDetails = () => {
    const { eventId } = useParams()
    const navigate = useNavigate()
    const { user, role } = useAuth()
    const { showToast } = useToast()

    const [event, setEvent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)
    const [booking, setBooking] = useState(false)
    const [alreadyBooked, setAlreadyBooked] = useState(false)

    const { reviews, averageRating, myReview, submitReview } = useReviews(eventId)
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState("")
    const [submittingReview, setSubmittingReview] = useState(false)
    const { isWaitlisted, waitlistCount, joinWaitlist, leaveWaitlist } = useWaitlist(eventId)
    const [bookedCount, setBookedCount] = useState(0)
    const { data: noShowData } = useExpectedNoShows(eventId)

    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true)

            const { data, error } = await supabase
                .from("events")
                .select("*")
                .eq("id", eventId)
                .single()

            if (error || !data) {
                setNotFound(true)
                setLoading(false)
                return
            }

            setEvent(data)

            const { count } = await supabase
                .from("bookings")
                .select("*", { count: "exact", head: true })
                .eq("event_id", eventId)

            setBookedCount(count ?? 0)

            if (user) {
                const { data: existing } = await supabase
                    .from("bookings")
                    .select("id")
                    .eq("event_id", eventId)
                    .eq("user_id", user.id)
                    .maybeSingle()

                setAlreadyBooked(!!existing)
            }

            setLoading(false)
        }

        fetchEvent()
    }, [eventId, user])

    useEffect(() => {
        if (myReview) {
            setRating(myReview.rating)
            setComment(myReview.comment || "")
        }
    }, [myReview])

    const handleBooking = async () => {
        if (!user) {
            showToast("Please login first.", "error")
            navigate("/login")
            return
        }

        setBooking(true)

        try {
            // Check for a same-day booking conflict before proceeding
            if (event.event_date) {
                const { data: conflicting } = await supabase
                    .from("bookings")
                    .select("id, events!inner(event_date, title)")
                    .eq("user_id", user.id)
                    .eq("events.event_date", event.event_date)

                if (conflicting && conflicting.length > 0) {
                    showToast(
                        `You already have a booking on this date (${conflicting[0].events.title}). You can't book two events on the same day.`,
                        "error"
                    )
                    return
                }
            }

            const QRCode = (await import("qrcode")).default

            // Insert the booking first — the database's generate_ticket_token
            // trigger auto-fills a secure, unguessable ticket_token on insert.
            // We need that token back before we can generate a QR from it.
            const { data: inserted, error } = await supabase
                .from("bookings")
                .insert([
                    {
                        user_id: user.id,
                        event_id: event.id,
                        ticket_count: 1,
                        total_amount: event.price
                    }
                ])
                .select("id, ticket_token")
                .single()

            if (error) {
                showToast(error.message, "error")
            } else {
                // Generate the QR from the secure token (not raw event
                // details) so a screenshot can't be reused after check-in.
                const qrCode = await QRCode.toDataURL(inserted.ticket_token)

                const { error: qrUpdateError } = await supabase
                    .from("bookings")
                    .update({ qr_code: qrCode })
                    .eq("id", inserted.id)

                if (qrUpdateError) {
                    console.error("Failed to save QR code:", qrUpdateError.message)
                }

                showToast("Ticket booked! Find it under 'My Tickets'.")
                setAlreadyBooked(true)
                setBookedCount((c) => c + 1)
            }
        } finally {
            setBooking(false)
        }
    }

    const handleWaitlistToggle = async () => {
        const result = isWaitlisted ? await leaveWaitlist() : await joinWaitlist()

        if (!result.success) {
            showToast(result.error, "error")
        } else {
            showToast(
                isWaitlisted
                    ? "Left the waitlist"
                    : "You're on the waitlist! We'll notify you if a spot opens up."
            )
        }
    }

    const handleSubmitReview = async (e) => {
        e.preventDefault()
        setSubmittingReview(true)
        const result = await submitReview(rating, comment)
        setSubmittingReview(false)

        if (!result.success) {
            showToast(result.error, "error")
        } else {
            showToast(myReview ? "Review updated. Thank you!" : "Review submitted. Thank you!")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center">
                Loading event...
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-bg text-text-primary flex flex-col items-center justify-center gap-4">
                <p className="text-2xl">Event not found.</p>
                <Link to="/events" className="text-accent hover:underline">
                    Back to Events
                </Link>
            </div>
        )
    }

    const isFull = event.capacity != null && bookedCount >= event.capacity

    return (
        <div className="min-h-screen bg-bg text-text-primary p-6 md:p-10 max-w-4xl mx-auto">
            <Link to="/events" className="text-accent hover:underline">
                &larr; Back to Events
            </Link>

            {event.banner_url && (
                <img
                    src={event.banner_url}
                    alt={event.title}
                    className="w-full h-80 object-cover rounded-xl mt-6"
                />
            )}

            <div className="flex items-center gap-4 mt-8">
                <h1 className="text-5xl font-bold">{event.title}</h1>
                {event.category && (
                    <span className="text-xs uppercase tracking-wide bg-accent-soft text-accent px-3 py-1 rounded-full">
                        {event.category}
                    </span>
                )}
            </div>

            <p className="text-text-secondary text-xl mt-4">{event.venue}</p>

            {event.event_date && (
                <p className="text-text-secondary mt-2">
                    📅{" "}
                    {new Date(`${event.event_date}T${event.event_time || "00:00"}`).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    })}
                    {event.event_time && (
                        <>
                            {" at "}
                            {new Date(`${event.event_date}T${event.event_time}`).toLocaleTimeString("en-IN", {
                                hour: "numeric",
                                minute: "2-digit"
                            })}
                        </>
                    )}
                </p>
            )}

            <p className="text-accent text-3xl font-semibold mt-6">
                ₹ {event.price}
            </p>

            {role === "attendee" && !alreadyBooked && isFull && (
                <div className="mt-10">
                    <p className="text-warning font-medium mb-3">
                        This event is fully booked.
                    </p>
                    <button
                        onClick={handleWaitlistToggle}
                        className="bg-accent hover:bg-accent-hover text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
                    >
                        {isWaitlisted ? "Leave Waitlist" : "Join Waitlist"}
                    </button>
                    {waitlistCount > 0 && (
                        <p className="text-text-secondary text-sm mt-3">
                            {waitlistCount} {waitlistCount === 1 ? "person" : "people"} waiting
                        </p>
                    )}
                </div>
            )}

            {role === "attendee" && (alreadyBooked || !isFull) && (
                <button
                    onClick={handleBooking}
                    disabled={booking || alreadyBooked}
                    className="mt-10 bg-success hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
                >
                    {alreadyBooked
                        ? "Already Booked"
                        : booking
                            ? "Booking..."
                            : `Book Ticket${event.capacity != null ? ` (${event.capacity - bookedCount} left)` : ""}`}
                </button>
            )}

            {role === "organizer" && event.organizer_id === user?.id && noShowData && noShowData.total_bookings > 0 && (
                <div className="mt-6 bg-surface border border-border rounded-lg p-4 text-sm max-w-md">
                    <p className="font-medium text-text-primary mb-1">📊 No-show risk estimate</p>
                    <p className="text-text-secondary">
                        {noShowData.high_risk_count} of {noShowData.total_bookings} bookings show elevated no-show risk,
                        based on attendee history. If accurate, roughly {noShowData.expected_available_seats} seat
                        {noShowData.expected_available_seats === 1 ? "" : "s"} could open up.
                    </p>
                    {isFull && noShowData.expected_available_seats > 0 && waitlistCount > 0 && (
                        <p className="text-accent mt-2">
                            Consider proactively messaging your top {Math.min(noShowData.expected_available_seats, waitlistCount)} waitlisted attendee{Math.min(noShowData.expected_available_seats, waitlistCount) === 1 ? "" : "s"} ahead of the event.
                        </p>
                    )}
                </div>
            )}

            {!user && (
                <p className="mt-10 text-text-secondary">
                    <Link to="/login" className="text-accent hover:underline">
                        Log in
                    </Link>{" "}
                    to book this event.
                </p>
            )}

            <div className="mt-16 border-t border-border pt-10">
                <h2 className="text-3xl font-bold mb-2">Reviews</h2>
                <div className="flex items-center gap-2 mb-8">
                    {averageRating !== null ? (
                        <>
                            <StarRating value={Math.round(averageRating)} />
                            <span className="text-text-secondary text-sm">
                                {averageRating} average · {reviews.length} review{reviews.length === 1 ? "" : "s"}
                            </span>
                        </>
                    ) : (
                        <span className="text-text-secondary text-sm">No ratings yet</span>
                    )}
                </div>

                {alreadyBooked && (
                    <form
                        onSubmit={handleSubmitReview}
                        className="bg-surface border border-border rounded-xl p-6 mb-8 space-y-4 max-w-xl"
                    >
                        <label className="block text-text-secondary text-sm">Your rating</label>
                        <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="p-3 rounded-lg bg-bg border border-border outline-none focus:ring-2 focus:ring-accent/40"
                        >
                            {[5, 4, 3, 2, 1].map((n) => (
                                <option key={n} value={n}>{"⭐".repeat(n)}</option>
                            ))}
                        </select>
                        <textarea
                            placeholder="Share your experience..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-3 rounded-lg bg-bg border border-border outline-none focus:ring-2 focus:ring-accent/40 min-h-[80px]"
                        />
                        <button
                            type="submit"
                            disabled={submittingReview}
                            className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                            {submittingReview ? "Submitting..." : myReview ? "Update Review" : "Submit Review"}
                        </button>
                    </form>
                )}

                <div className="space-y-4">
                    {reviews.map((r) => (
                        <div key={r.id} className="bg-surface border border-border rounded-xl p-5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <StarRating value={r.rating} />
                                <CredibilityBadge userId={r.user_id} />
                            </div>
                            {r.comment && <p className="text-text-secondary mt-2">{r.comment}</p>}
                        </div>
                    ))}
                </div>
            </div>
            <RelatedEvents eventId={eventId} />
        </div>
    )
}

export default EventDetails