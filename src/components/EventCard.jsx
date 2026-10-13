import Button from "./ui/Button"
import { FaHeart, FaRegHeart, FaMapMarkerAlt, FaClock } from "react-icons/fa"

const EventCard = ({ event, role, onDelete, onEdit, onBook, isWishlisted, onToggleWishlist }) => {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden border border-border hover:border-zinc-700 hover:shadow-elevated transition-all duration-200 relative group flex flex-col justify-between h-full">

      {onToggleWishlist && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleWishlist(event.id)
          }}
          className="absolute top-3 right-3 z-10 bg-black/60 backdrop-blur-sm hover:bg-black/80 rounded-full w-9 h-9 flex items-center justify-center transition-colors shadow-sm"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? (
            <FaHeart className="text-danger text-base" />
          ) : (
            <FaRegHeart className="text-white text-base" />
          )}
        </button>
      )}

      <div>
        <div className="overflow-hidden relative">
          <img
            src={event?.banner_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}
            alt={event?.title || "event"}
            className="h-52 w-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
          />
          {event?.event_date && (
            <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md border border-white/10 px-3 py-1 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-md">
              <span>
                {new Date(`${event.event_date}T00:00:00`).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric"
                })}
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h2 className="text-xl font-bold text-text-primary truncate">{event?.title || "Upcoming Event"}</h2>
            {event?.category && (
              <span className="shrink-0 text-[11px] uppercase tracking-wider font-semibold bg-accent-soft text-accent px-2.5 py-0.5 rounded-full">
                {event.category}
              </span>
            )}
          </div>

          <p className="text-text-secondary text-sm flex items-center gap-1.5 line-clamp-1">
            <FaMapMarkerAlt className="text-text-muted shrink-0 text-xs" />
            <span>{event?.venue || "Venue TBA"}</span>
          </p>

          {event?.event_time && (
            <p className="text-text-muted text-xs mt-1.5 flex items-center gap-1.5">
              <FaClock className="shrink-0 text-[10px]" />
              {new Date(`${event.event_date || "2026-01-01"}T${event.event_time}`).toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit"
              })}
            </p>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-2">
        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-text-muted block">Ticket Price</span>
            <p className="text-accent font-bold text-xl">₹{event?.price ?? 0}</p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {role === "organizer" && (
              <>
                <Button variant="warning" size="sm" onClick={onEdit}>Edit</Button>
                <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>
              </>
            )}

            {(role === "attendee" || !role) && onBook && (
              <Button variant="primary" size="sm" onClick={onBook}>Book Now</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCard