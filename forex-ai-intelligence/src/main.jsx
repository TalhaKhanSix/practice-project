import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary'

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const appTree = CLERK_KEY ? (
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
