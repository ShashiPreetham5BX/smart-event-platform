import { Link } from "react-router-dom"
import Button from "./ui/Button"

const Hero = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Subtle radial glow behind the headline — adds depth without noise */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: "radial-gradient(600px circle at 50% 0%, var(--color-accent-soft), transparent 70%)"
        }}
      />

      <div className="flex flex-col items-center justify-center text-center py-28 px-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent bg-accent-soft px-3 py-1.5 rounded-full mb-6">
          AI-Powered Event Platform
        </span>

        <h1 className="text-5xl md:text-6xl font-bold text-text-primary max-w-3xl leading-tight tracking-tight">
          Discover, host, and manage
          <br />
          events that matter
        </h1>

        <p className="text-text-secondary text-lg mt-6 max-w-xl">
          Browse curated events, book tickets instantly, and run your own
          events with tools built for organizers.
        </p>

        <div className="flex gap-4 mt-10">
          <Link to="/events">
            <Button size="lg">Explore Events</Button>
          </Link>
          <Link to="/register">
            <Button variant="ghost" size="lg">Get Started Free</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Hero