import { useMemo } from 'react'
import { runMTFAnalysis } from '../utils/mtfAnalysis'

const TF_ORDER = ['M5', 'M15', 'H1', 'H4', 'D1']
const BIAS_COLOR = { BULLISH: 'text-bull', BEARISH: 'text-bear', NEUTRAL: 'text-neutral' }

export default function MTFPanel({ history }) {
  const mtf = useMemo(() => runMTFAnalysis(history || []), [history])

  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-widest text-muted mb-3">
        Multi-Timeframe Confluence
      </div>
      <div className="grid grid-cols-5 gap-1 mb-4">
        {TF_ORDER.map((tf) => {
          const d = mtf.timeframes[tf]
          const bias = d?.bias || 'NEUTRAL'
          return (
            <div key={tf} className="flex flex-col items-center gap-1 bg-background rounded-lg p-2">
              <span className="text-xs text-muted font-mono">{tf}</span>
              <span className={`text-xs font-medium ${BIAS_COLOR[bias] || 'text-neutral'}`}>
                {bias}
              </span>
              <div className="w-full bg-surface rounded-full h-1 mt-1">
                <div
                  className={`h-1 rounded-full transition-all ${
                    bias === 'BULLISH' ? 'bg-bull' : bias === 'BEARISH' ? 'bg-bear' : 'bg-neutral'
                  }`}
                  style={{ width: `${d?.score ?? 50}%` }}
                />
              </div>
              <span className="text-xs font-mono text-muted">RSI {d?.rsi ?? 'NA'}</span>
            </div>
          )
        })}
      </div>
      <div
        className={`flex items-center justify-between rounded-lg p-3 border ${
          mtf.overallBias.includes('BULL')
            ? 'border-bull/30 bg-bull/5'
            : mtf.overallBias.includes('BEAR')
              ? 'border-bear/30 bg-bear/5'
              : 'border-neutral/30 bg-neutral/5'
        }`}
      >
        <div>
          <div className="text-xs text-muted mb-0.5">Overall Bias</div>
          <div
            className={`text-sm font-medium ${
              mtf.overallBias.includes('BULL')
                ? 'text-bull'
                : mtf.overallBias.includes('BEAR')
                  ? 'text-bear'
                  : 'text-neutral'
            }`}
          >
            {mtf.overallBias}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted mb-0.5">TF Agreement</div>
          <div className="text-sm font-mono">
            {Math.max(mtf.bullCount, mtf.bearCount)}/5 aligned
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted mb-0.5">Signal Grade</div>
          <div
            className={`text-sm font-medium ${
              mtf.confidence === 'HIGH'
                ? 'text-bull'
                : mtf.confidence === 'LOW'
                  ? 'text-bear'
                  : 'text-neutral'
            }`}
          >
            {mtf.confidence}
          </div>
        </div>
      </div>
    </div>
  )
}
