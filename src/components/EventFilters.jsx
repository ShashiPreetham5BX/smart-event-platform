import { useState, useEffect } from "react"
import { EVENT_CATEGORIES } from "../hooks/useEvents"
import { FaSearch, FaTimes, FaFilter } from "react-icons/fa"

const PRICE_PRESETS = [
  { label: "All Prices", min: "", max: "" },
  { label: "Free Only", min: "0", max: "0" },
  { label: "Under ₹500", min: "1", max: "500" },
  { label: "₹500 - ₹1000", min: "500", max: "1000" },
  { label: "₹1000+", min: "1000", max: "" }
]

const EventFilters = ({ onFilterChange, initialCategory = "" }) => {
  const [searchInput, setSearchInput] = useState("")
  const [category, setCategory] = useState(initialCategory)
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [selectedPricePreset, setSelectedPricePreset] = useState("All Prices")

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory)
    }
  }, [initialCategory])

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search: searchInput, category, minPrice, maxPrice })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, category, minPrice, maxPrice, onFilterChange])

  const handlePricePreset = (preset) => {
    setSelectedPricePreset(preset.label)
    setMinPrice(preset.min)
    setMaxPrice(preset.max)
  }

  const handleClearAll = () => {
    setSearchInput("")
    setCategory("")
    setMinPrice("")
    setMaxPrice("")
    setSelectedPricePreset("All Prices")
  }

  const hasActiveFilters = searchInput || category || minPrice || maxPrice

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 mb-8 shadow-sm space-y-4">
      {/* Search & Category Row */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
          <input
            type="text"
            placeholder="Search by title, artist, or venue..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-surface-hover/60 border border-border text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent transition-colors"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary text-xs"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="w-full md:w-56">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-surface-hover/60 border border-border text-sm text-text-primary outline-none focus:border-accent transition-colors cursor-pointer"
          >
            <option value="">All Categories</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2.5 rounded-xl border border-border hover:bg-surface-hover text-xs font-semibold text-danger flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <FaTimes /> Reset Filters
          </button>
        )}
      </div>

      {/* Quick Price Range Chips (BookMyShow Style) */}
      <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none text-xs">
        <span className="text-text-muted text-[11px] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <FaFilter className="text-[10px]" /> Price:
        </span>
        {PRICE_PRESETS.map((p) => {
          const isSelected = selectedPricePreset === p.label
          return (
            <button
              key={p.label}
              onClick={() => handlePricePreset(p)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? "bg-accent text-white border-accent shadow-sm"
                  : "bg-surface-hover/40 border-border text-text-secondary hover:text-text-primary hover:border-zinc-700"
              }`}
            >
              {p.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default EventFilters