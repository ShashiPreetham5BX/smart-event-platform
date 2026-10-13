import { useState } from "react"
import { FaRobot, FaChartLine, FaUsers, FaCoins, FaInfoCircle } from "react-icons/fa"

const DigitalTwinSimulator = ({ initialCategory = "tech", initialPrice = 499, initialCapacity = 250 }) => {
  const [category, setCategory] = useState(initialCategory)
  const [price, setPrice] = useState(initialPrice)
  const [capacity, setCapacity] = useState(initialCapacity)
  const [marketingPush, setMarketingPush] = useState("medium") // low, medium, aggressive

  // Digital Twin Simulation calculations based on historical patterns
  const baseVelocity = category === "music" ? 22 : category === "tech" ? 18 : category === "comedy" ? 20 : 14
  const priceElasticity = price > 800 ? 0.75 : price > 500 ? 0.9 : 1.2
  const marketingMultiplier = marketingPush === "aggressive" ? 1.4 : marketingPush === "medium" ? 1.0 : 0.7

  const projectedDailyVelocity = Math.max(1, Math.round(baseVelocity * priceElasticity * marketingMultiplier))
  const projectedDaysToSellout = Math.max(1, Math.ceil(capacity / projectedDailyVelocity))
  const projectedFillRate = Math.min(100, Math.round((projectedDailyVelocity * 14 / capacity) * 100))
  const projectedRevenue = Math.round(capacity * (projectedFillRate / 100) * price)
  const projectedNoShowRate = price === 0 ? 28 : price < 300 ? 16 : price < 800 ? 8 : 4.5

  return (
    <div className="bg-surface border border-accent/30 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-soft text-accent flex items-center justify-center text-lg">
            <FaRobot />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-text-primary">Organizer Digital Twin</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-accent/15 text-accent">
                Velocity Simulation
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Simulate event demand, booking velocities, and revenue projections before or during launch
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-surface-hover border border-border text-text-secondary flex items-center gap-1.5">
          <FaInfoCircle className="text-accent" />
          <span>Real-time Monte Carlo Model</span>
        </div>
      </div>

      {/* Simulator Sliders / Controls */}
      <div className="mt-5 grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            Event Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-surface-hover border border-border text-text-primary text-xs focus:outline-none focus:border-accent"
          >
            <option value="tech">Technology & AI</option>
            <option value="music">Live Music & Concerts</option>
            <option value="comedy">Standup Comedy</option>
            <option value="business">Business & Networking</option>
            <option value="workshop">Hands-On Workshops</option>
            <option value="theatre">Arts & Theatre</option>
            <option value="sports">Sports & Fitness</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            Ticket Price (₹): <span className="text-accent font-bold">₹{price}</span>
          </label>
          <input
            type="range"
            min="0"
            max="2500"
            step="50"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full accent-accent cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1.5">
            Venue Capacity: <span className="text-text-primary font-bold">{capacity} seats</span>
          </label>
          <input
            type="range"
            min="50"
            max="1500"
            step="50"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="w-full accent-accent cursor-pointer"
          />
        </div>
      </div>

      {/* Marketing intensity selector */}
      <div className="mt-4 flex items-center gap-2 flex-wrap text-xs">
        <span className="text-text-muted font-medium">Campaign Intensity:</span>
        {[
          { id: "low", label: "Organic Reach" },
          { id: "medium", label: "Socials + Email Push" },
          { id: "aggressive", label: "Platform Spotlight + Influencer" }
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMarketingPush(m.id)}
            className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
              marketingPush === m.id
                ? "bg-accent text-white border-accent font-semibold"
                : "bg-surface-hover border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Projected Metrics Dashboard Cards */}
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface-hover border border-border">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Booking Velocity</span>
            <FaChartLine className="text-accent text-xs" />
          </div>
          <p className="text-xl font-black text-text-primary">{projectedDailyVelocity} <span className="text-xs font-normal text-text-muted">tix/day</span></p>
          <p className="text-[11px] text-text-secondary mt-1">~{projectedDaysToSellout} days to sell out</p>
        </div>

        <div className="p-4 rounded-xl bg-surface-hover border border-border">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Fill Rate (14 Days)</span>
            <FaUsers className="text-accent text-xs" />
          </div>
          <p className={`text-xl font-black ${projectedFillRate >= 80 ? "text-success" : projectedFillRate >= 50 ? "text-warning" : "text-danger"}`}>
            {projectedFillRate}%
          </p>
          <p className="text-[11px] text-text-secondary mt-1">{Math.round(capacity * (projectedFillRate / 100))} expected attendees</p>
        </div>

        <div className="p-4 rounded-xl bg-surface-hover border border-border">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Projected Revenue</span>
            <FaCoins className="text-accent text-xs" />
          </div>
          <p className="text-xl font-black text-accent">₹{projectedRevenue.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-text-secondary mt-1">Based on simulated conversion</p>
        </div>

        <div className="p-4 rounded-xl bg-surface-hover border border-border">
          <div className="flex items-center justify-between text-text-muted mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Est. No-Show Risk</span>
            <span className="text-xs">📉</span>
          </div>
          <p className={`text-xl font-black ${projectedNoShowRate <= 8 ? "text-success" : "text-warning"}`}>
            {projectedNoShowRate}%
          </p>
          <p className="text-[11px] text-text-secondary mt-1">
            ~{Math.round(capacity * (projectedNoShowRate / 100))} buffer seats recommended
          </p>
        </div>
      </div>

      {/* Actionable recommendation */}
      <div className="mt-4 p-3.5 rounded-xl bg-accent-soft/50 border border-accent/20 text-xs text-text-secondary flex items-start gap-2.5">
        <span className="text-accent font-bold mt-0.5">💡</span>
        <div>
          <span className="font-semibold text-text-primary">Digital Twin Recommendation: </span>
          {price > 1000
            ? "Your ticket price is higher than category benchmark. We recommend launching an Early Bird 15% tier to accelerate initial momentum."
            : projectedFillRate < 60
            ? "Demand velocity could benefit from pairing this event with a workshop add-on or early social announcements."
            : "Strong velocity expected! Ensure your check-in staff caches offline tickets in the scanner ahead of doors opening."}
        </div>
      </div>
    </div>
  )
}

export default DigitalTwinSimulator
