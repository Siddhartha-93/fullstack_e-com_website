import { useNavigate } from 'react-router-dom'
import { Button } from '@heroui/react'
import SiteHeader from '../components/layout/Header.jsx'
import SiteFooter from '../components/layout/Footer.jsx'

export default function PlaceholderPage({ title }) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="max-w-md text-foreground/70">
          This page is coming soon. Browse our fresh chicken selection on the homepage.
        </p>
        <Button variant="primary" onPress={() => navigate('/')}>
          Back to Home
        </Button>
      </main>
      <SiteFooter />
    </div>
  )
}
