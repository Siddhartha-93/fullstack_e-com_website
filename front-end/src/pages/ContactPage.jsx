import { Button } from '@heroui/react'
import SiteHeader from '../components/layout/Header.jsx'
import SiteFooter from '../components/layout/Footer.jsx'

const whatsappNumber = '919535103545'
const whatsappMessage = encodeURIComponent('Hi FreshBite, I need help with my order.')
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
const emailLink = 'mailto:freshbite541@gmail.com?subject=Customer%20Support%20Request&body=Hello%20FreshBite%2C%0A%0AI%20would%20like%20help%20with%20my%20order.'

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-default-200 bg-background p-8 shadow-sm sm:p-12">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Contact Us
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Speak with our support team
            </h1>
            <p className="mt-4 max-w-2xl text-base text-foreground/75 sm:text-lg">
              Have a question about products, orders, delivery, or freshness? Reach out instantly on WhatsApp or send us an email and we&apos;ll respond as soon as possible.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-default-200 bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span className="text-xl">💬</span>
              </div>
              <h2 className="mt-6 text-xl font-semibold text-foreground">WhatsApp</h2>
              <p className="mt-3 text-sm leading-6 text-foreground/75">
                Chat instantly with our support team for fast order updates, product help, or delivery questions.
              </p>
              <Button
                variant="primary"
                className="mt-8"
                onPress={() => window.open(whatsappLink, '_blank')}
              >
                Message on WhatsApp
              </Button>
            </div>

            <div className="rounded-[1.5rem] border border-default-200 bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <span className="text-xl">✉️</span>
              </div>
              <h2 className="mt-6 text-xl font-semibold text-foreground">Email</h2>
              <p className="mt-3 text-sm leading-6 text-foreground/75">
                Send us an email and we will reply with the information you need, including order support and delivery details.
              </p>
              <Button
                variant="secondary"
                className="mt-8"
                onPress={() => window.location.assign(emailLink)}
              >
                Send an Email
              </Button>
            </div>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-[1.5rem] bg-default-100 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/75">
                Phone
              </p>
              <p className="mt-4 text-base font-medium text-foreground">+91 95351 03545</p>
            </div>
            <div className="rounded-[1.5rem] bg-default-100 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/75">
                Email
              </p>
              <p className="mt-4 text-base font-medium text-foreground">freshbite541@gmail.com</p>
            </div>
            <div className="rounded-[1.5rem] bg-default-100 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/75">
                Hours
              </p>
              <p className="mt-4 text-base font-medium text-foreground">Mon–Sun: 7am – 10pm</p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
