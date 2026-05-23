import { Command } from 'cmdk'
import { useEffect, useState } from 'react'

const PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'USD/CHF',
  'AUD/USD',
  'NZD/USD',
  'USD/CAD',
  'EUR/GBP',
  'EUR/JPY',
  'XAU/USD',
]

const ACTIONS = ['Analyze Signal', 'Open Trade Journal', 'Export CSV', 'Toggle Theme', 'Reset Layout']

export default function CommandPalette({ onSelectPair, onAction }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface border border-border-2 rounded-xl shadow-2xl overflow-hidden"
      >
        <Command>
          <div className="flex items-center px-4 border-b border-border">
            <span className="text-muted mr-3">Ctrl+K</span>
            <Command.Input
              placeholder="Search pairs, actions..."
              className="flex-1 py-4 bg-transparent outline-none text-sm"
            />
          </div>
          <Command.List className="max-h-64 overflow-y-auto p-2">
            <Command.Group heading="Pairs">
              {PAIRS.map((p) => (
                <Command.Item
                  key={p}
                  onSelect={() => {
                    onSelectPair(p)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-surface-2 data-[selected]:bg-surface-2"
                >
                  <span className="font-mono text-xs w-16">{p}</span>
                  <span className="text-muted text-xs">Switch to {p}</span>
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Group heading="Actions">
              {ACTIONS.map((a) => (
                <Command.Item
                  key={a}
                  onSelect={() => {
                    onAction(a)
                    setOpen(false)
                  }}
                  className="px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-surface-2 data-[selected]:bg-surface-2"
                >
                  {a}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
        <div className="px-4 py-2 border-t border-border flex gap-4 text-xs text-muted">
          <span>Up/Down navigate</span>
          <span>Enter select</span>
          <span>Esc close</span>
          <span className="ml-auto">Ctrl+K to open</span>
        </div>
      </div>
    </div>
  )
}
