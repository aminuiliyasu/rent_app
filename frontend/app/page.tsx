import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import CategoryGrid from '@/components/CategoryGrid'
import FeaturedListings from '@/components/FeaturedListings'
import HowItWorks from '@/components/HowItWorks'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-gray-950">
      <Navbar />
      <main>
        <Hero />
        <CategoryGrid />
        <FeaturedListings />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
