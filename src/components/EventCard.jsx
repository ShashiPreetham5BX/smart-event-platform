import Button from "./ui/Button"
import { FaHeart, FaRegHeart } from "react-icons/fa"

const EventCard = ({ event, role, onDelete, onEdit, onBook, isWishlisted, onToggleWishlist }) => {
  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-border hover:border-zinc-700 hover:shadow-elevated transition-all duration-200 relative group">

      {onToggleWishlist && (
        <button
          onClick={() => onToggleWishlist(event.id)}
          className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 rounded-full w-9 h-9 flex items-center justify-center transition-colors"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? (
            <FaHeart className="text-danger text-base" />
          ) : (
            <FaRegHeart className="text-white text-base" />
          )}
        </button>
      )}
      <div className="overflow-hidden">
        <img
          src={event?.banner_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}
          alt={event?.title || "event"}
          className="h-52 w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-text-primary truncate">{event?.title}</h2>
          {event?.category && (
            <span className="shrink-0 text-xs uppercase tracking-wide bg-accent-soft text-accent px-2 py-1 rounded-full">
              {event.category}
            </span>
          )}
        </div>

        <p className="text-text-secondary mt-2 text-sm">{event?.venue}</p>
        {event?.event_date && (
          <p className="text-text-muted text-sm mt-1">
            {new Date(`${event.event_date}T${event.event_time || "00:00"}`).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short"
            })}
            {event.event_time && (
              <>
                {" · "}
                {new Date(`${event.event_date}T${event.event_time}`).toLocaleTimeString("en-IN", {
                  hour: "numeric",
                  minute: "2-digit"
                })}
              </>
            )}
          </p>
        )}
        <p className="text-accent font-semibold mt-3 text-lg">₹{event?.price}</p>

        <div className="flex gap-2 mt-5 flex-wrap">
          {role === "organizer" && (
            <>
              <Button variant="warning" size="sm" onClick={onEdit}>Edit</Button>
              <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
            </>
          )}

          {role === "attendee" && (
            <Button variant="primary" size="sm" onClick={onBook}>Book Now</Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventCard