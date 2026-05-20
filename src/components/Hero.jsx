const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-32 px-6">
      
      <h1 className="text-6xl font-bold text-white max-w-4xl leading-tight">
        Smart AI Event Management Platform
      </h1>

      <p className="text-zinc-400 text-xl mt-6 max-w-2xl">
        Discover events, manage bookings, generate AI-powered event content,
        and experience next-generation event management.
      </p>

      <button className="mt-10 bg-blue-500 hover:bg-blue-600 transition px-8 py-4 rounded-xl text-lg font-semibold">
        Explore Events
      </button>

    </div>
  )
}

export default Hero