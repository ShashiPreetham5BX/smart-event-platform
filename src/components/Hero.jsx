import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaCalendarAlt, FaMapMarkerAlt, FaChevronLeft, FaChevronRight, FaFire } from "react-icons/fa"

const FEATURED_SLIDES = [
  {
    id: 1,
    title: "Global AI & Tech Summit 2026",
    subtitle: "The Flagship Artificial Intelligence & Developer Conference",
    venue: "Hitex Exhibition Center, Hyderabad",
    date: "15 Nov 2026",
    time: "10:00 AM",
    price: 499,
    category: "Tech",
    badge: "Trending • Selling Fast",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&q=80"
  },
  {
    id: 2,
    title: "Indie Beats Live Music Fest",
    subtitle: "An Electrifying Open-Air Celebration of Indie, Fusion & Acoustic",
    venue: "Gachibowli Stadium Ground, Hyderabad",
    date: "20 Nov 2026",
    time: "06:30 PM",
    price: 799,
    category: "Music",
    badge: "Early-Bird Active",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1400&q=80"
  },
  {
    id: 3,
    title: "Startup Pitch & Venture Networking",
    subtitle: "Connect With Top Angel Investors, VCs, and High-Growth Founders",
    venue: "T-Hub Phase 2, Knowledge City",
    date: "25 Nov 2026",
    time: "02:00 PM",
    price: 299,
    category: "Business",
    badge: "Limited Seats",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1400&q=80"
  }
]

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURED_SLIDES.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [])

  const slide = FEATURED_SLIDES[currentSlide]

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-12">
      {/* FEATURED SPOTLIGHT CAROUSEL BANNER */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 h-[380px] sm:h-[420px] md:h-[460px] bg-zinc-950">
        {/* Background Banner Image with Gradient Mask */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
          style={{ backgroundImage: `url(${slide.image})` }}
        />

        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent md:w-3/4" />

        {/* Carousel Content */}
        <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 md:p-12 z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs uppercase font-extrabold tracking-wider bg-accent text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <FaFire className="text-amber-300" /> {slide.badge}
            </span>
            <span className="text-xs uppercase font-semibold text-zinc-300 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
              {slide.category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {slide.title}
          </h1>

          <p className="text-xs sm:text-sm text-zinc-300 mt-2 line-clamp-2 max-w-lg">
            {slide.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-300 mt-4">
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
              <FaCalendarAlt className="text-accent" /> {slide.date} • {slide.time}
            </span>
            <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
              <FaMapMarkerAlt className="text-accent" /> {slide.venue}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <Link
              to={`/events/${slide.id}`}
              className="bg-accent hover:bg-accent-hover text-white px-6 sm:px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-accent/40 flex items-center gap-2"
            >
              Book Tickets • ₹{slide.price}
            </Link>
            <Link
              to="/events"
              className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 px-5 py-3 rounded-xl font-semibold text-xs transition-all"
            >
              Browse All
            </Link>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + FEATURED_SLIDES.length) % FEATURED_SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all z-20 cursor-pointer"
          aria-label="Previous slide"
        >
          <FaChevronLeft className="text-sm" />
        </button>

        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % FEATURED_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all z-20 cursor-pointer"
          aria-label="Next slide"
        >
          <FaChevronRight className="text-sm" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-20">
          {FEATURED_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentSlide === i ? "w-6 bg-accent" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Hero