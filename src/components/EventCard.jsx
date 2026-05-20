const EventCard = () => {
  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:scale-105 transition duration-300">
      
      <img
        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
        alt="event"
        className="h-52 w-full object-cover"
      />

      <div className="p-5">
        <h2 className="text-2xl font-bold text-white">
          AI Tech Conference
        </h2>

        <p className="text-zinc-400 mt-3">
          Explore the future of AI, startups, and innovation.
        </p>

        <div className="flex justify-between items-center mt-6">
          <span className="text-blue-400 font-semibold">
            ₹999
          </span>

          <button className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600">
            Book Now
          </button>
        </div>
      </div>

    </div>
  )
}

export default EventCard