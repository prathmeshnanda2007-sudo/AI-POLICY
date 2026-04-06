import { useEffect } from 'react'
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { SimulatorPage } from './pages/SimulatorPage'
import { ResultsPage } from './pages/ResultsPage'
import { ComparisonPage } from './pages/ComparisonPage'
import { blink } from './lib/blink'

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

// Helper: check auth before loading protected routes
async function requireAuth() {
  const isAuth = blink.auth.isAuthenticated()
  if (!isAuth) {
    throw redirect({ to: '/login' })
  }
}

// Helper: redirect authenticated users away from auth pages
async function redirectIfAuth() {
  const isAuth = blink.auth.isAuthenticated()
  if (isAuth) {
    throw redirect({ to: '/dashboard' })
  }
}

// Public routes
const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: redirectIfAuth,
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  beforeLoad: redirectIfAuth,
  component: RegisterPage,
})

// Protected routes
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: requireAuth,
  component: DashboardPage,
})

const simulatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/simulator',
  beforeLoad: requireAuth,
  component: SimulatorPage,
})

const resultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/results',
  beforeLoad: requireAuth,
  component: ResultsPage,
})

const comparisonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/comparison',
  beforeLoad: requireAuth,
  component: ComparisonPage,
})

const routeTree = rootRoute.addChildren([
  landingRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
  simulatorRoute,
  resultsRoute,
  comparisonRoute,
])

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Listen to auth state changes and redirect accordingly
function AuthListener() {
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      if (!state.isLoading) {
        const path = window.location.pathname
        const isAuthPage = path === '/login' || path === '/register'
        const isProtected = ['/dashboard', '/simulator', '/results', '/comparison'].includes(path)

        if (!state.isAuthenticated && isProtected) {
          router.navigate({ to: '/login' })
        } else if (state.isAuthenticated && isAuthPage) {
          router.navigate({ to: '/dashboard' })
        }
      }
    })
    return unsubscribe
  }, [])
  return null
}

export default function App() {
  return (
    <>
      <AuthListener />
      <RouterProvider router={router} />
    </>
  )
}
