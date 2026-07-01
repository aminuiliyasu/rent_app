import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HowItWorks from '@/components/HowItWorks'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-slate-950">
      <Navbar />
      <div className="pt-20">
        <HowItWorks />
      </div>
      <Footer />
    </div>
  )
}
