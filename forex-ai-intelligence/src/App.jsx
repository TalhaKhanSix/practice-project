import { AuthGuard, UserMenu } from './components/AuthGuard'
import CommandPalette from './components/CommandPalette'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import { MarketProvider, useMarket } from './context/MarketContext'
import Dashboard from './pages/Dashboard'

function AppShell({ enableAuth }) {
  const { setPair } = useMarket()

  const handleAction = (action) => {
    if (action === 'Analyze Signal') {
      window.dispatchEvent(new Event('fx-analyze-signal'))
      return
    }
    if (action === 'Open Trade Journal') {
      document.getElementById('trade-journal')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (action === 'Toggle Theme') {
      document.documentElement.classList.toggle('theme-light')
      return
    }
    if (action === 'Reset Layout') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    console.info(`[CommandPalette] ${action}`)
  }

  const content = (
    <div className="min-h-screen bg-background text-foreground">
      <CommandPalette onSelectPair={setPair} onAction={handleAction} />
      <TopBar rightSlot={enableAuth ? <UserMenu /> : null} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4">
          <Dashboard />
        </main>
      </div>
    </div>
  )

  if (!enableAuth) return content

  return <AuthGuard>{content}</AuthGuard>
}

export default function App({ enableAuth = true }) {
  return (
    <MarketProvider>
      <AppShell enableAuth={enableAuth} />
    </MarketProvider>
  )
}
