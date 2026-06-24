import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@heroui/react'
import { products } from '../../data/products.js'
import ProductCard from '../product/ProductCard.jsx'
import { fetchTopSelling } from '../../api/productApi.js'

export default function FeaturedProducts() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState(() =>
    products.filter((p) => p.featured && p.bestseller)
  )

  useEffect(() => {
    let mounted = true
    fetchTopSelling(6)
      .then((res) => {
        if (!mounted) return
        if (res?.data?.success && Array.isArray(res.data.products)) {
          setFeatured(res.data.products)
        }
      })
      .catch(() => {
        // keep local fallback
      })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="bg-default-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Featured Products
            </h2>
            <p className="mt-2 text-foreground/70">Top-selling picks loved by our customers</p>
          </div>
          <Button variant="secondary" onPress={() => navigate('/shop')}>
            View all
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
