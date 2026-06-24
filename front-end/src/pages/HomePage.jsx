import SiteHeader from '../components/layout/Header.jsx'
import SiteFooter from '../components/layout/Footer.jsx'
import BannerCarousel from '../components/home/BannerCarousel.jsx'
import HeroBanner from '../components/home/HeroBanner.jsx'
import CategorySection from '../components/home/CategorySection.jsx'
import FeaturedProducts from '../components/home/FeaturedProducts.jsx'
import SubscribePromo from '../components/home/SubscribePromo.jsx'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main>
        {/* <BannerCarousel /> */}
        <HeroBanner />
        <CategorySection />
        <FeaturedProducts />
        <SubscribePromo />
      </main>
      <SiteFooter />
    </div>
  )
}
