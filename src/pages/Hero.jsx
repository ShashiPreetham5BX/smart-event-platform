import { Link } from "react-router-dom"
import Hero from "../components/Hero"
import EventCard from "../components/EventCard"
import Footer from "../components/Footer"
import { useEvents } from "../hooks/useEvents"

const STATS = [
    { label: "Events Hosted", value: "500+" },
    { label: "Tickets Booked", value: "10,000+" },
    { label: "Verified Organizers", value: "200+" },
]

const Home = () => {
    const { events, loading } = useEvents({ page: 1 })
    const trending = events.slice(0, 3)

    return (
        <div className="bg-bg min-h-screen text-text-primary">
            <Hero />

            {/* STATS BAR */}
            <div className="border-y border-border bg-surface/50">
                <div className="max-w-5xl mx-auto grid grid-cols-3 divide-x divide-border">
                    {STATS.map((stat) => (
                        <div key={stat.label} className="text-center py-8 px-4">
                            <p className="text-3xl md:text-4xl font-bold text-accent">{stat.value}</p>
                            <p className="text-text-secondary text-sm mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <section className="px-6 md:px-10 py-20 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-bold">Trending Events</h2>
                    <Link to="/events" className="text-accent hover:underline text-sm font-medium">
                        View all →
                    </Link>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-surface border border-border rounded-xl h-80 animate-pulse" />
                        ))}
                    </div>
                ) : trending.length === 0 ? (
                    <p className="text-text-secondary">
                        No events yet —{" "}
                        <Link to="/events" className="text-accent hover:underline">
                            check back soon
                        </Link>.
                    </p>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {trending.map((event) => (
                            <Link key={event.id} to="/events">
                                <EventCard event={event} />
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </div>
    )
}

export default Home