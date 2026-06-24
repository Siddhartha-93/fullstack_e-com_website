import { Link as RouterLink } from 'react-router-dom'
import { Button, Card, Chip } from '@heroui/react'
import { toast } from '@heroui/react'
import { formatPrice } from '../../data/products.js'
import { useCart } from '../../context/CartContext.jsx'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const price = product.displayPrice ?? product.price ?? 0
  const imageUrl = product.images?.[0]?.url || product.image || ''
  const productId = product._id || product.id

  const handleAddToCart = () => {
    addToCart(product)
    toast.success('Added to cart', {
      description: `${product.name}`,
    })
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden border border-default-200 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="relative aspect-square overflow-hidden bg-default-100">
        <RouterLink to={`/product/${productId}`} aria-label={`View details for ${product.name}`} className="absolute inset-0 z-10" />
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover"
        />
        {product.bestseller && (
          <Chip
            color="warning"
            size="sm"
            className="absolute left-3 top-3"
          >
            <Chip.Label>Bestseller</Chip.Label>
          </Chip>
        )}
      </div>

      <Card.Header className="flex-1 flex-col items-start gap-1">
        <Card.Title className="line-clamp-2 text-base">
          <RouterLink to={`/product/${productId}`} className="text-inherit no-underline hover:text-kpa-600">
            {product.name}
          </RouterLink>
        </Card.Title>
        <Card.Description className="line-clamp-2 text-sm">
          {product.description}
        </Card.Description>
        {product.weightLabel ? (
          <p className="text-sm font-medium text-foreground/70">{product.weightLabel}</p>
        ) : null}
        <p className="mt-1 flex items-center gap-1 text-sm text-foreground/70">
          <span className="text-kpa-500">★</span>
          {product.rating ?? 4.5}
          <span className="text-foreground/50">({product.reviewCount ?? 0})</span>
        </p>
      </Card.Header>

      <Card.Content className="pt-0">
        <p className="text-xl font-bold text-foreground">{formatPrice(price)}</p>
      </Card.Content>

      <Card.Footer className="pt-0">
        <Button variant="primary" fullWidth onPress={handleAddToCart}>
          Add to cart
        </Button>
      </Card.Footer>
    </Card>
  )
}
