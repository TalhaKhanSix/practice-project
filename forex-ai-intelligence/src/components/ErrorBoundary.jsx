import { Component } from 'react'

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(err, info) {
    console.error('[ErrorBoundary]', err, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="panel border-bear/30 text-center py-8">
        <div className="text-bear text-sm font-mono mb-2">COMPONENT ERROR</div>
        <div className="text-xs text-muted mb-4">{this.state.error?.message}</div>
        <button
          onClick={() => this.setState({ hasError: false, error: null })}
          className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-surface-2"
        >
          Retry
        </button>
      </div>
    )
  }
}
