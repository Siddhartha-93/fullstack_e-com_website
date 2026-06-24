import {
  catCuts,
  catReady,
  catWhole,
  heroChicken,
  pBreast,
  pDrums,
  pMince,
  pTandoori,
  pWings,
} from '../assets/index.js'

export const categories = [
  {
    id: 'chicken-cuts',
    name: 'Chicken Cuts',
    description: 'Boneless, wings, drumsticks & more',
    image: catCuts,
  },
  {
    id: 'whole-chicken',
    name: 'Whole Chicken',
    description: 'Farm-fresh whole birds',
    image: catWhole,
  },
  {
    id: 'ready-to-cook',
    name: 'Ready-to-Cook',
    description: 'Marinated & meal-ready packs',
    image: catReady,
  },
]

export const banners = [
  {
    id: 1,
    title: 'Weekend Fresh Sale',
    subtitle: 'Up to 25% off on boneless cuts',
    cta: 'Shop Now',
    image: heroChicken,
    link: '/shop',
  },
  {
    id: 2,
    title: 'Subscribe & Save',
    subtitle: 'Weekly delivery plans from ₹499',
    cta: 'View Plans',
    image: pDrums,
    link: '/#subscribe',
  },
  {
    id: 3,
    title: 'Ready-to-Cook Fiesta',
    subtitle: 'Marinated packs delivered in 90 mins',
    cta: 'Explore',
    image: pTandoori,
    link: '/shop?category=ready-to-cook',
  },
]

export const products = [
  {
    id: 'boneless-breast',
    name: 'Boneless Chicken Breast',
    category: 'chicken-cuts',
    image: pBreast,
    description:
      'Skinless, antibiotic-free breast fillets. Perfect for grills, curries, and salads.',
    nutrition: {
      protein: '31g per 100g',
      fat: '3.6g',
      calories: '165 kcal',
      sodium: '74mg',
    },
    weights: [
      { label: '500g', price: 199, freshness: 'today' },
      { label: '1kg', price: 379, freshness: 'today' },
    ],
    rating: 4.8,
    reviewCount: 124,
    featured: true,
    bestseller: true,
    reviews: [
      {
        id: 1,
        author: 'Priya S.',
        rating: 5,
        text: 'Always fresh and perfectly trimmed. My go-to for meal prep.',
        date: '2026-04-12',
      },
      {
        id: 2,
        author: 'Rahul M.',
        rating: 4,
        text: 'Great quality. Delivery was on time and well packed.',
        date: '2026-04-08',
      },
    ],
  },
  {
    id: 'chicken-wings',
    name: 'Chicken Wings',
    category: 'chicken-cuts',
    image: pWings,
    description: 'Juicy mid-joint wings, ideal for frying or air-frying.',
    nutrition: {
      protein: '27g per 100g',
      fat: '16g',
      calories: '203 kcal',
      sodium: '82mg',
    },
    weights: [
      { label: '500g', price: 149, freshness: 'today' },
      { label: '1kg', price: 279, freshness: 'today' },
    ],
    rating: 4.6,
    reviewCount: 89,
    featured: true,
    bestseller: true,
    reviews: [
      {
        id: 1,
        author: 'Anita K.',
        rating: 5,
        text: 'Perfect size wings for parties. No freezer burn smell.',
        date: '2026-04-10',
      },
    ],
  },
  {
    id: 'whole-bird',
    name: 'Whole Farm Chicken',
    category: 'whole-chicken',
    image: catWhole,
    description:
      'Whole bird with giblets removed. Raised without hormones, chilled for peak freshness.',
    nutrition: {
      protein: '27g per 100g',
      fat: '14g',
      calories: '239 kcal',
      sodium: '70mg',
    },
    weights: [
      { label: '1kg', price: 189, freshness: 'today' },
      { label: '1.5kg', price: 269, freshness: 'today' },
    ],
    rating: 4.7,
    reviewCount: 56,
    featured: true,
    bestseller: false,
    reviews: [],
  },
  {
    id: 'tandoori-marinated',
    name: 'Tandoori Marinated Chicken',
    category: 'ready-to-cook',
    image: pTandoori,
    description:
      'Chef-crafted tandoori marinade. Just pan-fry or oven-bake and serve.',
    nutrition: {
      protein: '25g per 100g',
      fat: '12g',
      calories: '220 kcal',
      sodium: '480mg',
    },
    weights: [
      { label: '500g', price: 249, freshness: 'today' },
      { label: '750g', price: 349, freshness: 'today' },
    ],
    rating: 4.9,
    reviewCount: 201,
    featured: true,
    bestseller: true,
    reviews: [
      {
        id: 1,
        author: 'Vikram D.',
        rating: 5,
        text: 'Tastes like restaurant quality. Kids loved it!',
        date: '2026-04-14',
      },
    ],
  },
  {
    id: 'drumsticks',
    name: 'Chicken Drumsticks',
    category: 'chicken-cuts',
    image: pDrums,
    description: 'Meaty drumsticks with skin on. Great for biryani and roasts.',
    nutrition: {
      protein: '26g per 100g',
      fat: '11g',
      calories: '195 kcal',
      sodium: '76mg',
    },
    weights: [
      { label: '500g', price: 129, freshness: 'yesterday' },
      { label: '1kg', price: 239, freshness: 'today' },
    ],
    rating: 4.4,
    reviewCount: 67,
    featured: false,
    bestseller: false,
    reviews: [],
  },
  {
    id: 'butter-chicken-kit',
    name: 'Butter Chicken Meal Kit',
    category: 'ready-to-cook',
    image: pMince,
    description:
      'Pre-cut chicken with rich butter masala gravy. Cooks in under 20 minutes.',
    nutrition: {
      protein: '22g per 100g',
      fat: '15g',
      calories: '245 kcal',
      sodium: '520mg',
    },
    weights: [
      { label: '450g', price: 299, freshness: 'today' },
      { label: '900g', price: 549, freshness: 'today' },
    ],
    rating: 4.5,
    reviewCount: 43,
    featured: false,
    bestseller: false,
    reviews: [],
  },
]

export const coupons = {
  FRESH10: { discount: 0.1, label: '10% off fresh orders' },
  KPA50: { discount: 50, label: '₹50 off (min ₹499)' },
}

export function getProductById(id) {
  return products.find((p) => p.id === id)
}

export function formatPrice(amount) {
  return `₹${amount.toLocaleString('en-IN')}`
}
