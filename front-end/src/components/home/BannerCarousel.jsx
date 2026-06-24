import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@heroui/react'
import { banners } from '../../data/products.js'

const INTERVAL_MS = 5000

export default function BannerCarousel() {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)

  const goTo = useCallback((index) => {
    setActive((index + banners.length) % banners.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => goTo(active + 1), INTERVAL_MS)
    return () => clearInterval(timer)
  }, [active, goTo])

  return (
    <section className="relative overflow-hidden bg-default-100" aria-label="Promotional offers">
      <div className="relative mx-auto aspect-[21/9] max-h-[520px] w-full max-w-7xl sm:aspect-[2.4/1]">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              i === active ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            aria-hidden={i !== active}
          >
            <img src={banner.image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-16">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-kpa-300">
                Fresh bite
              </p>
              <h2 className="max-w-xl text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {banner.title}
              </h2>
              <p className="mt-3 max-w-md text-base text-white/90 sm:text-lg">
                {banner.subtitle}
              </p>
              <Button
                variant="primary"
                size="lg"
                className="mt-6 w-fit bg-kpa-500 hover:bg-kpa-600"
                onPress={() => navigate(banner.link)}
              >
                {banner.cta}
              </Button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => goTo(active - 1)}
          className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 sm:left-6"
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 sm:right-6"
          aria-label="Next slide"
        >
          ›
        </button>

        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === active ? 'w-8 bg-kpa-500' : 'w-2 bg-white/60 hover:bg-white'
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
