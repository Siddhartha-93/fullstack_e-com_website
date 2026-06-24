import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card } from '@heroui/react'
import { getCategories } from '../../api/categoryApi.js'

export default function CategorySection() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    getCategories()
      .then((res) => {
        if (!mounted) return
        const data = res?.data
        const cats = Array.isArray(data) ? data : data?.categories || []
        setCategories(cats)
      })
      .catch((err) => {
        console.error('Failed to fetch categories:', err)
      })
      .finally(() => mounted && setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Shop by Category
        </h2>
        <p className="mt-2 text-foreground/70">
          Farm-fresh chicken, delivered chilled to your door
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-3 text-center text-foreground/70">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="col-span-3 text-center text-foreground/70">No categories found.</div>
        ) : 
          categories.map((cat) => (
          <Card
            key={cat._id}
            role="button"
            tabIndex={0}
            className="group cursor-pointer overflow-hidden border border-default-200 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            onClick={() => navigate(`/shop?category=${cat._id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigate(`/shop?category=${cat._id}`)
              }
            }}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={
                  (Array.isArray(cat.images) ? cat.images[0]?.url : cat.images?.url) || '/placeholder-category.png'
                }
                alt={
                  (Array.isArray(cat.images) ? cat.images[0]?.alt : cat.images?.alt) || cat.name
                }
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <Card.Title className="text-xl text-white">{cat.name}</Card.Title>
                <Card.Description className="text-white/85">
                  {cat.description}
                </Card.Description>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
