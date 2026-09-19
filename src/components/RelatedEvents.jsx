import { Link } from "react-router-dom"
import { useRelatedEvents } from "../hooks/useRelatedEvents"
import EventCard from "./EventCard"

const RelatedEvents = ({ eventId }) => {
    const { relatedEvents, loading } = useRelatedEvents(eventId)

    if (loading || relatedEvents.length === 0) {
        return null
    }

    return (
        <div className="mt-16 border-t border-border pt-10">
            <h2 className="text-3xl font-bold mb-2">You might also like</h2>
            <p className="text-text-secondary mb-8">
                Based on what other attendees booked alongside this event
            </p>

            <div className="grid md:grid-cols-3 gap-6">
                {relatedEvents.map((event) => (
                    <Link key={event.event_id} to={`/events/${event.event_id}`}>
                        <EventCard
                            event={{
                                id: event.event_id,
                                title: event.title,
                                venue: event.venue,
                                price: event.price,
                                banner_url: event.banner_url,
                                category: event.category
                            }}
                        />
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default RelatedEvents