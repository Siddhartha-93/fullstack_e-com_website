import { Button, Card } from '@heroui/react'

const subscriptionBenefits = [
  'Weekly fresh delivery on your schedule',
  'Up to 15% off every order',
  'Priority slots during peak hours',
  'Pause or skip anytime',
]

const appBenefits = [
  'Track orders in real time',
  'Exclusive app-only deals',
  'One-tap reorder favourites',
  'Push alerts for flash sales',
]

export default function SubscribePromo() {
  return (
    <section id="subscribe" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="overflow-hidden border border-kpa-200 bg-gradient-to-br from-kpa-50 to-white p-8 shadow-card">
          <Card.Header className="flex-col items-start gap-2 p-0">
            <span className="rounded-full bg-kpa-500 px-3 py-1 text-xs font-semibold text-white">
              Subscribe & Save
            </span>
            <Card.Title className="text-2xl">Weekly chicken plans</Card.Title>
            <Card.Description>
              Never run out of fresh protein. Plans start at ₹499/week.
            </Card.Description>
          </Card.Header>
          <Card.Content className="p-0 pt-4">
            <ul className="space-y-2">
              {subscriptionBenefits.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="mt-0.5 text-fresh-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card.Content>
          <Card.Footer className="p-0 pt-6">
            <Button variant="primary" className="bg-kpa-500 hover:bg-kpa-600">
              Start subscription
            </Button>
          </Card.Footer>
        </Card>

        <Card className="overflow-hidden border border-fresh-200 bg-gradient-to-br from-fresh-50 to-white p-8 shadow-card">
          <Card.Header className="flex-col items-start gap-2 p-0">
            <span className="rounded-full bg-fresh-600 px-3 py-1 text-xs font-semibold text-white">
              Mobile App
            </span>
            <Card.Title className="text-2xl">Download the Fresh bite app</Card.Title>
            <Card.Description>
              Order faster, track deliveries, and unlock member-only offers.
            </Card.Description>
          </Card.Header>
          <Card.Content className="p-0 pt-4">
            <ul className="space-y-2">
              {appBenefits.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="mt-0.5 text-fresh-600">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card.Content>
          <Card.Footer className="flex flex-wrap gap-3 p-0 pt-6">
            <Button variant="primary" className="bg-fresh-600 hover:bg-fresh-700">
              App Store
            </Button>
            <Button variant="secondary">Google Play</Button>
          </Card.Footer>
        </Card>
      </div>
    </section>
  )
}
