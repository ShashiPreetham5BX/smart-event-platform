import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import EventCard from "../components/EventCard"
import Footer from "../components/Footer"

const Home = () => {
  return (
    <div className="bg-black min-h-screen text-white">

      <Navbar />

      <Hero />

      <section className="px-10 pb-20">
        
        <h2 className="text-4xl font-bold mb-10">
          Trending Events
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <EventCard />
          <EventCard />
          <EventCard />
        </div>

      </section>

      <Footer />

    </div>
  )
}

export default Home