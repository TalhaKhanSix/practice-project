import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const hasClerkKey = typeof CLERK_KEY === 'string' && CLERK_KEY.trim().length > 0

if (!hasClerkKey) {
  console.warn('[Auth] VITE_CLERK_PUBLISHABLE_KEY is missing. Clerk auth is disabled.')
}

const appTree = hasClerkKey ? (
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
