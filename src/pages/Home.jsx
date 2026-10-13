import { Link } from "react-router-dom"
import Hero from "../components/Hero"
import EventCard from "../components/EventCard"
import Footer from "../components/Footer"
import { useEvents } from "../hooks/useEvents"
import { useCity } from "../context/CityContext"
import { FaMusic, FaLaptopCode, FaBriefcase, FaFutbol, FaPalette, FaMicrophone, FaShieldAlt, FaChartLine, FaRobot, FaQrcode } from "react-icons/fa"

const CATEGORIES = [
  { label: "Concerts", icon: FaMusic, category: "music", color: "from-pink-500/20 to-rose-600/20 text-rose-400" },
  { label: "Tech Summits", icon: FaLaptopCode, category: "tech", color: "from-blue-500/20 to-cyan-600/20 text-cyan-400" },
  { label: "Business", icon: FaBriefcase, category: "business", color: "from-amber-500/20 to-orange-600/20 text-amber-400" },
  { label: "Comedy Shows", icon: FaMicrophone, category: "general", color: "from-purple-500/20 to-indigo-600/20 text-purple-400" },
  { label: "Sports", icon: FaFutbol, category: "sports", color: "from-emerald-500/20 to-teal-600/20 text-emerald-400" },
  { label: "Workshops", icon: FaPalette, category: "arts", color: "from-violet-500/20 to-fuchsia-600/20 text-fuchsia-400" },
]

const INNOVATIONS = [
  {
    icon: FaShieldAlt,
    title: "Cryptographic Lineage",
    desc: "Single-use ticket tokens prevent counterfeit passes and gate fraud."
  },
  {
    icon: FaChartLine,
    title: "Predictive No-Show AI",
    desc: "Attendance probability scoring enables dynamic overbooking & fair waitlists."
  },
  {
    icon: FaRobot,
    title: "EventAI Copilot",
    desc: "AI assistant for theme ideation, description copy, and ticket sales optimization."
  },
  {
    icon: FaQrcode,
    title: "Offline Sync Check-In",
    desc: "Fast QR ticket verification with IndexedDB caching even with zero internet."
  }
]

const Home = () => {
  const { events, loading } = useEvents({ page: 1 })
  const { selectedCity } = useCity()

  const trendingEvents = events || []

  return (
    <div className="bg-bg min-h-screen text-text-primary flex flex-col">
      {/* 1. HERO SPOTLIGHT CAROUSEL */}
      <Hero />

      {/* 2. CATEGORY ICON EXPLORER (BookMyShow Style) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-4 w-full">
        <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold tracking-tight text-text-primary">
              Browse By Category
            </h3>
            <Link to="/events" className="text-xs font-semibold text-accent hover:underline">
              View All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <Link
                  key={cat.label}
                  to={`/events?category=${cat.category}`}
                  className="group p-4 rounded-xl border border-border/80 hover:border-zinc-700 bg-surface-hover/50 hover:bg-surface-hover transition-all flex flex-col items-center text-center gap-2.5 cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-sm`}>
                    <Icon />
                  </div>
                  <span className="text-xs font-bold text-text-primary group-hover:text-accent transition-colors">
                    {cat.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 3. TRENDING IN [CITY] (BookMyShow Main Grid) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Recommended Events in <span className="text-accent">{selectedCity}</span>
              </h2>
            </div>
            <p className="text-xs md:text-sm text-text-secondary mt-1">
              Popular concerts, conferences, and community gatherings happening near you
            </p>
          </div>

          <Link
            to="/events"
            className="text-accent hover:underline text-xs md:text-sm font-bold flex items-center gap-1"
          >
            See all in {selectedCity} →
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-surface border border-border rounded-2xl h-80 animate-pulse" />
            ))}
          </div>
        ) : trendingEvents.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-12 text-center text-text-secondary">
            No events found in {selectedCity} right now. Check back soon or switch cities!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingEvents.map((event) => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <EventCard event={event} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 4. EVENTAI INNOVATIVE PLATFORM FEATURES */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10 w-full">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-accent bg-accent/20 px-3 py-1 rounded-full">
              Why EventAI
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold mt-3">
              Next-Generation Event Discovery & Fraud-Proof Ticketing
            </h3>
            <p className="text-zinc-400 text-xs md:text-sm mt-2">
              Built with cutting-edge AI and cryptographic architecture for genuine event experiences.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INNOVATIONS.map((item, idx) => {
              const Icon = item.icon
              return (
                <div key={idx} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 text-accent flex items-center justify-center text-lg mb-3">
                    <Icon />
                  </div>
                  <h4 className="font-bold text-sm text-white">{item.title}</h4>
                  <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. ORGANIZER CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16 w-full">
        <div className="border border-border rounded-2xl p-8 bg-surface flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-xl font-bold">Hosting an Event or Conference?</h4>
            <p className="text-text-secondary text-xs md:text-sm mt-1 max-w-xl">
              Publish your tickets, track live attendee check-ins, unlock explainable pricing insights, and forecast attendance velocity with EventAI.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <Link
              to="/dashboard"
              className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Organizer Dashboard
            </Link>
            <Link
              to="/ai-chat"
              className="bg-surface-hover hover:bg-border text-text-primary px-5 py-3 rounded-xl text-xs font-bold border border-border transition-all"
            >
              Ask EventAI Copilot
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Home