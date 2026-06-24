import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, SearchField } from '@heroui/react'
import SiteHeader from '../components/layout/Header.jsx'
import SiteFooter from '../components/layout/Footer.jsx'
import ProductCard from '../components/product/ProductCard.jsx'
import { fetchCategories, fetchProducts } from '../api/productApi.js'

const sortOptions = [
  { value: 'relevance', label: 'Recommended' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
]

export default function ShopPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const selectedCategory = searchParams.get('category') ?? 'all'
  const selectedWeight = searchParams.get('weight') ?? 'all'
  const selectedSort = searchParams.get('sort') ?? 'relevance'
  const query = searchParams.get('q') ?? ''

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetchProducts({ limit: 100 }),
          fetchCategories(),
        ])
        setProducts(productResponse.data.products ?? [])
        setCategories(categoryResponse.data.categories ?? [])
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Unable to load shop data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getWeightRatio = (label) => {
    if (label === '250g') return 0.25
    if (label === '500g') return 0.5
    if (label === '1kg') return 1
    return 1
  }

  const getWeightPrice = (product, weightLabel) => {
    if (!weightLabel || weightLabel === 'all') {
      if (Array.isArray(product.weights) && product.weights.length > 0) {
        return product.weights[0].price ?? product.price ?? 0
      }
      return product.price ?? 0
    }

    if (Array.isArray(product.weights)) {
      const matched = product.weights.find((item) => item.label === weightLabel)
      if (matched) return matched.price ?? 0
    }

    const basePrice = product.price ?? product.weights?.[0]?.price ?? 0
    return Math.round(basePrice * getWeightRatio(weightLabel))
  }

  const availableWeights = useMemo(() => {
    const labels = new Set(
      products.flatMap((product) => product.weights?.map((weight) => weight.label) ?? []),
    )
    const defaultSlots = ['250g', '500g', '1kg']
    return defaultSlots.filter((weight) => labels.size === 0 || labels.has(weight))
  }, [products])

  const getCategoryId = (product) => {
    if (!product.category) return null
    if (typeof product.category === 'string') return product.category
    return product.category._id ?? product.category.id ?? null
  }

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const productCategory = getCategoryId(product)
        if (selectedCategory !== 'all' && productCategory !== selectedCategory) {
          return false
        }

        if (!query.trim()) {
          return true
        }

        const text = query.trim().toLowerCase()
        const categoryName = product.category?.name ?? ''
        return [product.name, product.description, categoryName].some((value) =>
          value?.toLowerCase().includes(text),
        )
      })
      .map((product) => ({
        ...product,
        displayPrice: getWeightPrice(product, selectedWeight),
        weightLabel: selectedWeight !== 'all' ? selectedWeight : undefined,
      }))
      .sort((a, b) => {
        if (selectedSort === 'price-low') {
          return (a.displayPrice ?? 0) - (b.displayPrice ?? 0)
        }

        if (selectedSort === 'price-high') {
          return (b.displayPrice ?? 0) - (a.displayPrice ?? 0)
        }

        return a.name.localeCompare(b.name)
      })
  }, [products, query, selectedCategory, selectedSort, selectedWeight])

  const updateQueryParams = (key, value) => {
    const nextParams = new URLSearchParams(searchParams)

    if (value === 'all' || !value) {
      nextParams.delete(key)
    } else {
      nextParams.set(key, value)
    }

    if (key !== 'q' && searchInput.trim()) {
      nextParams.set('q', searchInput.trim())
    }

    setSearchParams(nextParams)
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const nextParams = new URLSearchParams(searchParams)
    if (searchInput.trim()) {
      nextParams.set('q', searchInput.trim())
    } else {
      nextParams.delete('q')
    }
    setSearchParams(nextParams)
  }

  const handleClearFilters = () => {
    const nextParams = new URLSearchParams()
    if (searchInput.trim()) {
      nextParams.set('q', searchInput.trim())
    }
    setSearchParams(nextParams)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-kpa-600">Shop</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Fresh chicken, ready-to-cook meals, and more.
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-foreground/70 sm:text-base">
              Browse our range of products with fast filters, category search, and easy add-to-cart options.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex w-full gap-2 sm:w-auto sm:items-center">
            <SearchField
              aria-label="Search shop"
              className="min-w-[18rem]"
              value={searchInput}
              onChange={setSearchInput}
            >
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Search products, categories..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>
            <Button
              variant="ghost"
              className="sm:hidden"
              onPress={() => setShowFilters(true)}
              aria-label="Open filters"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 5a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 13.414V17a1 1 0 01-1.447.894L8 16.118l-2.553 1.776A1 1 0 014 17v-3.586L3.293 7.707A1 1 0 013 7V5z" />
              </svg>
            </Button>
            <Button type="submit" variant="primary" className="whitespace-nowrap">
              Search
            </Button>
          </form>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="hidden sm:block space-y-6 rounded-3xl border border-default-200 bg-background p-5 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Filters</p>
                  <p className="text-sm text-foreground/70">Refine your product selection.</p>
                </div>
                <Button variant="ghost" size="sm" onPress={handleClearFilters}>
                  Clear
                </Button>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl bg-default-100 p-4">
              <p className="text-sm font-semibold text-foreground">Category</p>
              <div className="grid gap-2">
                <button
                  type="button"
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    selectedCategory === 'all'
                      ? 'border-kpa-600 bg-kpa-50 text-kpa-800'
                      : 'border-default-200 bg-background text-foreground hover:border-kpa-300'
                  }`}
                  onClick={() => updateQueryParams('category', 'all')}
                >
                  All categories
                </button>
                {categories.map((categoryItem) => {
                  const categoryId = categoryItem._id ?? categoryItem.id
                  return (
                    <button
                      key={categoryId}
                      type="button"
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                        selectedCategory === categoryId
                          ? 'border-kpa-600 bg-kpa-50 text-kpa-800'
                          : 'border-default-200 bg-background text-foreground hover:border-kpa-300'
                      }`}
                      onClick={() => updateQueryParams('category', categoryId)}
                    >
                      {categoryItem.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-3 rounded-3xl bg-default-100 p-4">
              <p className="text-sm font-semibold text-foreground">Weight</p>
              <div className="grid gap-2">
                <button
                  type="button"
                  className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                    selectedWeight === 'all'
                      ? 'border-kpa-600 bg-kpa-50 text-kpa-800'
                      : 'border-default-200 bg-background text-foreground hover:border-kpa-300'
                  }`}
                  onClick={() => updateQueryParams('weight', 'all')}
                >
                  Any weight
                </button>
                {availableWeights.map((weight) => (
                  <button
                    key={weight}
                    type="button"
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                      selectedWeight === weight
                        ? 'border-kpa-600 bg-kpa-50 text-kpa-800'
                        : 'border-default-200 bg-background text-foreground hover:border-kpa-300'
                    }`}
                    onClick={() => updateQueryParams('weight', weight)}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-3xl bg-default-100 p-4">
              <p className="text-sm font-semibold text-foreground">Sort by</p>
              <div className="grid gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                      selectedSort === option.value
                        ? 'border-kpa-600 bg-kpa-50 text-kpa-800'
                        : 'border-default-200 bg-background text-foreground hover:border-kpa-300'
                    }`}
                    onClick={() => updateQueryParams('sort', option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile filter drawer */}
          {showFilters && (
            <div className="fixed inset-0 z-50 flex sm:hidden">
              <div className="fixed inset-0 bg-black/30" onClick={() => setShowFilters(false)} />
              <div className="ml-auto w-[80%] max-w-xs h-full bg-background p-5 overflow-auto shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Filters</p>
                    <p className="text-sm text-foreground/70">Refine your product selection.</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close filters"
                    className="rounded-full p-2 hover:bg-default-200"
                    onClick={() => setShowFilters(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-foreground/70" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 space-y-6">
                  <div className="space-y-4 rounded-3xl bg-default-100 p-4">
                    <p className="text-sm font-semibold text-foreground">Category</p>
                    <div className="grid gap-2">
                      <button
                        type="button"
                        className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                          selectedCategory === 'all'
                            ? 'border-kpa-600 bg-kpa-50 text-kpa-800'
                            : 'border-default-200 bg-background text-foreground hover:border-kpa-300'
                        }`}
                        onClick={() => { updateQueryParams('category', 'all'); setShowFilters(false); }}
                      >
                        All categories
                      </button>
                      {categories.map((categoryItem) => {
                        const categoryId = categoryItem._id ?? categoryItem.id
                        return (
                          <button
                            key={categoryId}
                            type="button"
                            className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                              selectedCategory === categoryId
                                ? 'border-kpa-600 bg-kpa-50 text-kpa-800'
                                : 'border-default-200 bg-background text-foreground hover:border-kpa-300'
                            }`}
                            onClick={() => { updateQueryParams('category', categoryId); setShowFilters(false); }}
                          >
                            {categoryItem.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="space-y-3 rounded-3xl bg-default-100 p-4">
                    <p className="text-sm font-semibold text-foreground">Weight</p>
                    <div className="grid gap-2">
                      <button
                        type="button"
                        className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                          selectedWeight === 'all'
                            ? 'border-kpa-600 bg-kpa-50 text-kpa-800'
                            : 'border-default-200 bg-background text-foreground hover:border-kpa-300'
                        }`}
                        onClick={() => { updateQueryParams('weight', 'all'); setShowFilters(false); }}
                      >
                        Any weight
                      </button>
                      {availableWeights.map((weight) => (
                        <button
                          key={weight}
                          type="button"
                          className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                            selectedWeight === weight
                              ? 'border-kpa-600 bg-kpa-50 text-kpa-800'
                              : 'border-default-200 bg-background text-foreground hover:border-kpa-300'
                          }`}
                          onClick={() => { updateQueryParams('weight', weight); setShowFilters(false); }}
                        >
                          {weight}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 rounded-3xl bg-default-100 p-4">
                    <p className="text-sm font-semibold text-foreground">Sort by</p>
                    <div className="grid gap-2">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                            selectedSort === option.value
                              ? 'border-kpa-600 bg-kpa-50 text-kpa-800'
                              : 'border-default-200 bg-background text-foreground hover:border-kpa-300'
                          }`}
                          onClick={() => { updateQueryParams('sort', option.value); setShowFilters(false); }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <section className="space-y-4">
            <div className="flex flex-col gap-3 rounded-3xl border border-default-200 bg-background p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-foreground/70">
                  {filteredProducts.length} product{filteredProducts.length === 1 ? '' : 's'} found
                </p>
                <p className="mt-1 text-sm text-foreground/70">
                  {selectedCategory !== 'all'
                    ? `Filtered by ${categories.find((item) => (item._id ?? item.id) === selectedCategory)?.name}`
                    : 'Showing all categories'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/70">
                <span>Sort:</span>
                <span className="font-medium text-foreground">{sortOptions.find((item) => item.value === selectedSort)?.label}</span>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <Card className="rounded-3xl border border-default-200 bg-background p-8 text-center">
                <p className="text-lg font-semibold text-foreground">No products matched your filters.</p>
                <p className="mt-2 text-sm text-foreground/70">Try removing a filter or searching for a different item.</p>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id ?? product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
