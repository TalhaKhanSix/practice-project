export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Space Grotesk', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        bull: 'var(--color-bull)',
        bear: 'var(--color-bear)',
        neutral: 'var(--color-neutral)',
        info: 'var(--color-info)',
        background: 'var(--color-bg)',
        foreground: 'var(--color-text)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        border: 'var(--color-border)',
        'border-2': 'var(--color-border-2)',
        muted: 'var(--color-muted)',
        dimmed: 'var(--color-dimmed)',
      },
    },
  },
  plugins: [],
}
