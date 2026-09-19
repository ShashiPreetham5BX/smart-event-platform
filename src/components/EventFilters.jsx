import { useState, useEffect } from "react"
import { EVENT_CATEGORIES } from "../hooks/useEvents"

const EventFilters = ({ onFilterChange }) => {
    const [searchInput, setSearchInput] = useState("")
    const [category, setCategory] = useState("")
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")

    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange({ search: searchInput, category, minPrice, maxPrice })
        }, 400)
        return () => clearTimeout(timer)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput, category, minPrice, maxPrice])

    return (
        <div className="flex flex-wrap gap-4 mb-10">
            <input
                type="text"
                placeholder="Search by title or venue..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 min-w-[240px] p-3 rounded-xl bg-zinc-900 border border-zinc-800 outline-none"
            />
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 outline-none text-zinc-300"
            >
                <option value="">All Categories</option>
                {EVENT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                ))}
            </select>
            <input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-32 p-3 rounded-xl bg-zinc-900 border border-zinc-800 outline-none"
            />
            <input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-32 p-3 rounded-xl bg-zinc-900 border border-zinc-800 outline-none"
            />
        </div>
    )
}

export default EventFilters