import { useCategoryInsights } from "../../hooks/useCategoryInsights"

const CategoryInsightPanel = ({ category }) => {
    const { insights, loading } = useCategoryInsights(category)

    if (loading) {
        return (
            <div className="bg-surface border border-border rounded-lg p-4 text-sm text-text-secondary">
                Loading category insights...
            </div>
        )
    }

    if (!insights || insights.event_count === 0) {
        return (
            <div className="bg-surface border border-border rounded-lg p-4 text-sm text-text-secondary">
                No past events in this category yet — not enough data for a projection.
            </div>
        )
    }

    return (
        <div className="bg-accent-soft border border-accent/30 rounded-lg p-4 space-y-1">
            <p className="text-sm font-medium text-accent">
                Based on {insights.event_count} similar past event{insights.event_count === 1 ? "" : "s"}
            </p>
            <p className="text-sm text-text-secondary">
                Average bookings: <span className="text-text-primary font-medium">{insights.avg_bookings}</span>
                {" · "}
                Best performer: <span className="text-text-primary font-medium">{insights.max_bookings} bookings</span>
            </p>
            <p className="text-sm text-text-secondary">
                Average price in this category: <span className="text-text-primary font-medium">₹{insights.avg_price}</span>
            </p>
        </div>
    )
}

export default CategoryInsightPanel