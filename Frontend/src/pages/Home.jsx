import Hero from "../components/Hero"
import EventHighlights from "../components/EventHighlights"
import Stats from "../components/Stats"
import QuickLinks from "../components/QuickLinks"
import Footer from "../components/Footer"

export default function Home() {
  return (
    <>
      <Hero />
      {/* <EventHighlights /> */}
      <Stats />
      <QuickLinks />
      <Footer/>
    </>
  )
}
