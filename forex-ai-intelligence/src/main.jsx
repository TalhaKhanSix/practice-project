import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary'

const rawClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const CLERK_KEY = typeof rawClerkKey === 'string' ? rawClerkKey.trim() : ''
const hasClerkKey = CLERK_KEY.length > 0
const hasValidClerkKey = /^pk_(test|live)_/i.test(CLERK_KEY)

if (!hasClerkKey) {
  console.warn('[Auth] VITE_CLERK_PUBLISHABLE_KEY is missing. Clerk auth is disabled.')
} else if (!hasValidClerkKey) {
  console.warn(
    '[Auth] VITE_CLERK_PUBLISHABLE_KEY does not look like a Clerk publishable key. Clerk auth is disabled.'
  )
}

const appTree = hasValidClerkKey ? (
  <ClerkProvider publishableKey={CLERK_KEY}>
    <App enableAuth />
  </ClerkProvider>
) : (
  <App enableAuth={false} />
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>{appTree}</ErrorBoundary>
  </StrictMode>,
)
