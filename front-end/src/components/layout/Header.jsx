import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Badge,
  Button,
  Drawer,
  Header,
  SearchField,
  Separator,
  useOverlayState,
} from '@heroui/react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useCart } from '../../context/CartContext.jsx'
import { fbLogo } from '../../assets/index.js'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  // { label: 'Offers', to: '/offers' },
  { label: 'Contact Us', to: '/contact' },
]

const navLinkClass =
  'rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 no-underline transition hover:bg-default-100 hover:text-foreground'

export default function SiteHeader() {
  const navigate = useNavigate()
  const { cartCount } = useCart()
  const { user, logout, isAuthenticated } = useAuth()
  const [search, setSearch] = useState('')
  const drawerState = useOverlayState()

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/shop?q=${encodeURIComponent(search.trim())}`)
      drawerState.close()
    }
  }

  return (
    <Header className="sticky top-0 z-50 border-b border-default-200 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <RouterLink to="/" className="flex shrink-0 items-center gap-2 no-underline">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
              <img src={fbLogo} alt="Fresh Bite Logo" />
            </span>
            <span className="text-xl font-bold tracking-tight text-foreground sm:inline">
              Fresh Bite
            </span>
          </RouterLink>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {navLinks.map(({ label, to }) => (
              <RouterLink key={to} to={to} className={navLinkClass}>
                {label}
              </RouterLink>
            ))}
            {isAuthenticated && (
              <RouterLink to="/orders" className={navLinkClass}>
                Orders
              </RouterLink>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <RouterLink to="/admin" className={navLinkClass}>
                Admin
              </RouterLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="hidden md:block">
              <SearchField
                aria-label="Search products"
                className="w-48 lg:w-64"
                value={search}
                onChange={setSearch}
              >
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder="Search chicken cuts..." />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>
            </form>

              {isAuthenticated ? (
                <>
                  <span className="hidden sm:inline-flex text-sm font-medium tracking-tight text-foreground/80">
                    Hello, {user?.name || 'Customer'}
                  </span>
                  {user?.role === 'admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:inline-flex"
                      onPress={() => navigate('/admin')}
                    >
                    Admin
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="hidden sm:inline-flex"
                    onPress={() => {
                      logout()
                      navigate('/')
                    }}
                  >
                    Log out
                  </Button>
                </>
              ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onPress={() => navigate('/login')}
                >
                  Log in
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onPress={() => navigate('/signup')}
                >
                  Sign up
                </Button>
              </>
            )}

            <Badge.Anchor>
              <Button
                variant="ghost"
                isIconOnly
                aria-label="Cart"
                onPress={() => navigate('/cart')}
              >
                <CartIcon />
              </Button>
              {cartCount > 0 && (
                <Badge color="danger" placement="top-right">
                  <Badge.Label>{cartCount > 99 ? '99+' : cartCount}</Badge.Label>
                </Badge>
              )}
            </Badge.Anchor>

            <Button
              variant="ghost"
              isIconOnly
              className="lg:hidden"
              aria-label="Open menu"
              onPress={drawerState.open}
            >
              <MenuIcon />
            </Button>
          </div>
        </div>
      </div>

      <Drawer state={drawerState}>
        <Drawer.Backdrop />
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>Menu</Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body className="flex flex-col gap-4">
              <form onSubmit={handleSearch}>
                <SearchField
                  aria-label="Search products"
                  fullWidth
                  value={search}
                  onChange={setSearch}
                >
                  <SearchField.Group>
                    <SearchField.SearchIcon />
                    <SearchField.Input placeholder="Search..." />
                  </SearchField.Group>
                </SearchField>
              </form>
              <Separator />
              {navLinks.map(({ label, to }) => (
                <RouterLink
                  key={to}
                  to={to}
                  className="text-base font-medium text-foreground no-underline hover:text-kpa-600"
                  onClick={drawerState.close}
                >
                  {label}
                </RouterLink>
              ))}
              {isAuthenticated && (
                <RouterLink
                  to="/orders"
                  className="text-base font-medium text-foreground no-underline hover:text-kpa-600"
                  onClick={drawerState.close}
                >
                  Orders
                </RouterLink>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <RouterLink
                  to="/admin"
                  className="text-base font-medium text-foreground no-underline hover:text-kpa-600"
                  onClick={drawerState.close}
                >
                  Admin
                </RouterLink>
              )}
              <Separator />
              {isAuthenticated ? (
                <Button
                  variant="secondary"
                  fullWidth
                  onPress={() => {
                    drawerState.close()
                    logout()
                    navigate('/')
                  }}
                >
                  Log out
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    fullWidth
                    onPress={() => {
                      drawerState.close()
                      navigate('/login')
                    }}
                  >
                    Log in
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onPress={() => {
                      drawerState.close()
                      navigate('/signup')
                    }}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer>
    </Header>
  )
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  )
}
