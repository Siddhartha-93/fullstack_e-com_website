import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@heroui/react'
import { useCart } from '../context/CartContext.jsx'
import SiteHeader from '../components/layout/Header.jsx'
import SiteFooter from '../components/layout/Footer.jsx'
import ProductCard from '../components/product/ProductCard.jsx'
import { formatPrice } from '../data/products.js'

import { fetchProductById } from '../api/productApi.js'
export default function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await fetchProductById(id)
      setProduct(response.data?.product ?? response.data ?? response)
    }

    fetchProduct()
  }, [id])

  const [weightIndex, setWeightIndex] = useState(0)
  const [reviewer, setReviewer] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviews, setReviews] = useState([])

  const selectedWeight = product?.weights?.[weightIndex]
  const price = selectedWeight?.price ?? product?.price ?? 0

  useEffect(() => {
    if (product) {
      setReviews(product.reviews ?? [])
    }
  }, [product])

  const selectedProduct = useMemo(() => {
    if (!product) return null
    return {
      ...product,
      displayPrice: price,
      weightLabel: selectedWeight?.label,
      price,
    }
  }, [product, price, selectedWeight?.label])

  const averageRating = useMemo(() => {
    if (!reviews.length) return product?.rating ?? 0
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0)
    return Number((sum / reviews.length).toFixed(1))
  }, [product?.rating, reviews])

  const reviewCount = reviews.length || product?.reviewCount || 0

  const handleAddToCart = () => {
    if (!selectedProduct) return
    addToCart(selectedProduct)
  }

  const handleSubmitReview = (event) => {
    event.preventDefault()
    if (!reviewer.trim() || !comment.trim() || rating < 1) return

    const newReview = {
      id: reviews.length + 1,
      author: reviewer.trim(),
      rating,
      text: comment.trim(),
      date: new Date().toISOString().slice(0, 10),
    }

    setReviews([newReview, ...reviews])
    setReviewer('')
    setRating(5)
    setComment('')
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
          <p className="text-2xl font-semibold text-foreground">Product not found</p>
          <p className="mt-3 text-sm text-foreground/70">The item you are looking for may no longer be available.</p>
          <Button variant="primary" className="mt-6" onPress={() => navigate('/shop')}>
            Back to Shop
          </Button>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <ProductCard product={selectedProduct ?? product} />

          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-kpa-600">
                {product.category?.name ?? 'Shop'}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {product.name}
              </h1>
              <p className="text-sm text-foreground/70">{product.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
              <div className="flex items-center gap-3 rounded-3xl border border-default-200 bg-background px-4 py-3">
                <div className="rounded-2xl bg-kpa-50 px-3 py-2 text-kpa-700">★</div>
                <div>
                  <p className="text-base font-semibold text-foreground">{averageRating}</p>
                  <p className="text-sm text-foreground/70">{reviewCount} reviews</p>
                </div>
              </div>
              <div className="rounded-3xl border border-default-200 bg-background p-4 text-sm text-foreground/70">
                Freshness may vary by weight option. Choose your preferred pack before adding to cart.
              </div>
            </div>

            <div className="space-y-4 rounded-[2rem] border border-default-200 bg-default-100 p-5 shadow-sm">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Select weight</p>
                <div className="flex flex-wrap gap-2">
                  {product.weights?.map((weight, index) => (
                    <button
                      key={weight.label}
                      type="button"
                      onClick={() => setWeightIndex(index)}
                      className={`rounded-2xl border px-4 py-2 text-sm font-medium transition ${
                        index === weightIndex
                          ? 'border-kpa-600 bg-kpa-50 text-kpa-800'
                          : 'border-default-200 bg-background text-foreground hover:border-kpa-300'
                      }`}
                    >
                      {weight.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-foreground/70">Price</p>
                  <p className="text-3xl font-semibold text-foreground">{formatPrice(price)}</p>
                </div>
                <Button variant="primary" size="lg" onPress={handleAddToCart}>
                  Add to cart
                </Button>
              </div>
            </div>

            <div className="grid gap-4 rounded-[2rem] border border-default-200 bg-default-100 p-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Product details</h2>
                <p className="mt-3 text-sm leading-7 text-foreground/70">{product.description}</p>
              </div>

              <div>
                <h3 className="text-base font-semibold text-foreground">Nutritional information</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {Object.entries(product.nutrition || {}).map(([label, value]) => (
                    <div key={label} className="rounded-3xl border border-default-200 bg-background p-4">
                      <p className="text-sm text-foreground/70 capitalize">{label.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="space-y-6 rounded-[2rem] border border-default-200 bg-background p-6 shadow-sm">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Customer reviews</h2>
              <p className="text-sm text-foreground/70">Read what shoppers are saying and leave your own review.</p>
            </div>

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-3xl border border-default-200 bg-default-100 p-5 text-center text-sm text-foreground/70">
                  No reviews yet. Be the first to share your experience.
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="rounded-3xl border border-default-200 bg-default-100 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-foreground">{review.author}</p>
                      <span className="rounded-full bg-kpa-50 px-3 py-1 text-sm font-semibold text-kpa-700">
                        {review.rating} ★
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-foreground/75">{review.text}</p>
                    <p className="mt-3 text-xs text-foreground/50">{review.date}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="space-y-6 rounded-[2rem] border border-default-200 bg-default-100 p-6 shadow-sm">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground">Leave a review</h2>
              <p className="text-sm text-foreground/70">Share your feedback and help other shoppers choose.</p>
            </div>
            <form className="space-y-4" onSubmit={handleSubmitReview}>
              <label className="block text-sm font-medium text-foreground">Name</label>
              <input
                type="text"
                value={reviewer}
                onChange={(event) => setReviewer(event.target.value)}
                className="w-full rounded-3xl border border-default-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-kpa-500"
                placeholder="Your name"
              />

              <label className="block text-sm font-medium text-foreground">Rating</label>
              <input
                type="number"
                min="1"
                max="5"
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="w-24 rounded-3xl border border-default-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-kpa-500"
              />

              <label className="block text-sm font-medium text-foreground">Review</label>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows="4"
                className="w-full rounded-3xl border border-default-200 bg-white px-4 py-3 text-sm text-foreground outline-none transition focus:border-kpa-500"
                placeholder="What did you like about this product?"
              />

              <Button variant="primary" fullWidth type="submit">
                Submit review
              </Button>
            </form>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
