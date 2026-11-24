import { useState, useEffect } from 'react'
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Cell,
} from 'recharts'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const PRESETS = {
  'Tech US': ['AAPL', 'MSFT', 'GOOGL', 'NVDA'],
  'Suisse': ['NESN.SW', 'NOVN.SW', 'ROG.SW', 'UBSG.SW'],
  'Diversifié': ['AAPL', 'JNJ', 'XOM', 'JPM', 'PG'],
}

const COLORS = ['#7c5cff', '#22d3ee', '#f472b6', '#34d399', '#fbbf24', '#fb7185', '#60a5fa', '#a3e635']

const tooltipStyle = {
  background: 'rgba(15, 15, 30, 0.95)',
  border: '1px solid rgba(167, 139, 250, 0.4)',
  borderRadius: 12,
  color: '#e6e8ff',
}

export default function App() {
  const [tickers, setTickers] = useState(PRESETS['Tech US'])
  const [input, setInput] = useState('')
  const [period, setPeriod] = useState('1y')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const loadSuggestions = async () => {
    setLoadingSuggestions(true)
    try {
      const res = await fetch(`${API}/api/suggestions`)
      const json = await res.json()
      setSuggestions(json.stocks)
    } catch {
      setSuggestions([])
    } finally {
      setLoadingSuggestions(false)
    }
  }

  useEffect(() => {
    loadSuggestions()
  }, [])

  const addTicker = async (raw) => {
    const t = raw.trim().toUpperCase()
    if (!t) return
    if (tickers.includes(t)) {
      setInput('')
      return
    }

    setChecking(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/validate/${encodeURIComponent(t)}`)
      const json = await res.json()
      if (!json.valid) {
        setError(`« ${t} » n'existe pas ou n'a pas de cotation disponible.`)
        return
      }
      setTickers((prev) => [...prev, t])
      setInput('')
    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setChecking(false)
    }
  }

  const removeTicker = (t) => setTickers(tickers.filter((x) => x !== t))

  const optimize = async () => {
    if (tickers.length < 2) {
      setError('Ajoute au moins 2 actions 🙏')
      return
    }
    setLoading(true)
    setError('')
    setData(null)
    try {
      const res = await fetch(`${API}/api/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers, period }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || 'Erreur inconnue')
      setData(json)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const weightData = data
    ? Object.entries(data.optimal_weights)
        .map(([name, w]) => ({ name, weight: +(w * 100).toFixed(2) }))
        .sort((a, b) => b.weight - a.weight)
    : []

  const frontier = data
    ? data.frontier_volatilities.map((v, i) => ({ x: v, y: data.frontier_returns[i] }))
    : []

  const optimalPoint = data ? [{ x: data.volatility, y: data.expected_return }] : []

  return (
    <div className="app">
      <header className="hero">
        <h1>Portfolio Optimizer</h1>
        <p>Frontière efficiente de Markowitz · Données Yahoo Finance</p>
      </header>

      <section className="card">
        <h2 className="section-title">Tes actions</h2>

        <div className="presets">
          {Object.entries(PRESETS).map(([name, list]) => (
            <button key={name} className="preset" onClick={() => setTickers(list)}>
              {name}
            </button>
          ))}
        </div>

        <div className="chips">
          {tickers.map((t) => (
            <span key={t} className="chip">
              {t}
              <button onClick={() => removeTicker(t)}>×</button>
            </span>
          ))}
        </div>

        <div className="input-row">
          <input
            placeholder="Ajoute un ticker (AAPL, NESN.SW...) puis Entrée"
            value={input}
            disabled={checking}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTicker(input)}
          />
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="6mo">6 mois</option>
            <option value="1y">1 an</option>
            <option value="2y">2 ans</option>
            <option value="5y">5 ans</option>
          </select>
        </div>
        {checking && <p className="hint">Vérification du ticker...</p>}

        <button className="btn-primary" onClick={optimize} disabled={loading || checking}>
          {loading ? 'Optimisation en cours...' : '🚀 Optimiser le portefeuille'}
        </button>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <div className="suggest-header">
          <h2 className="section-title" style={{ margin: 0 }}>Idées de tickers</h2>
          <button className="refresh-btn" onClick={loadSuggestions} disabled={loadingSuggestions}>
            {loadingSuggestions ? '...' : '🔄 Actualiser'}
          </button>
        </div>
        <div className="suggest-grid">
          {suggestions.map((s) => (
            <button
              key={s.ticker}
              className="suggest-item"
              onClick={() => addTicker(s.ticker)}
              disabled={tickers.includes(s.ticker)}
            >
              <strong>{s.ticker}</strong>
              <span>{s.price}</span>
              <span className={s.change_pct >= 0 ? 'up' : 'down'}>
                {s.change_pct >= 0 ? '+' : ''}{s.change_pct}%
              </span>
            </button>
          ))}
        </div>
      </section>

      {loading && <div className="card loader">Téléchargement des données et calcul...</div>}

      {data && (
        <>
          <div className="metrics">
            <div className="card metric ret">
              <div className="value">{data.expected_return.toFixed(2)}%</div>
              <div className="label">Rendement attendu</div>
            </div>
            <div className="card metric vol">
              <div className="value">{data.volatility.toFixed(2)}%</div>
              <div className="label">Volatilité</div>
            </div>
            <div className="card metric sharpe">
              <div className="value">{data.sharpe_ratio.toFixed(2)}</div>
              <div className="label">Ratio de Sharpe</div>
            </div>
          </div>

          <div className="grid-2">
            <section className="card">
              <h2 className="section-title">Allocation optimale</h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={weightData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" unit="%" stroke="#8b93c9" />
                  <YAxis type="category" dataKey="name" stroke="#8b93c9" width={80} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                  <Bar dataKey="weight" radius={[0, 8, 8, 0]}>
                    {weightData.map((d, i) => (
                      <Cell key={d.name} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>

            <section className="card">
              <h2 className="section-title">Frontière efficiente</h2>
              <ResponsiveContainer width="100%" height={320}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" dataKey="x" name="Volatilité" unit="%" stroke="#8b93c9" />
                  <YAxis type="number" dataKey="y" name="Rendement" unit="%" stroke="#8b93c9" />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter data={frontier} line={{ stroke: '#a78bfa', strokeWidth: 3 }} fill="#a78bfa" />
                  <Scatter data={optimalPoint} fill="#34d399" shape="star" />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="footer-note" style={{ margin: '8px 0 0' }}>
                ⭐ = portefeuille au Sharpe maximal
              </p>
            </section>
          </div>

          <section className="card" style={{ marginTop: 24 }}>
            <h2 className="section-title">Détail des poids</h2>
            <div className="chips">
              {weightData.map((d, i) => (
                <span key={d.name} className="chip" style={{ borderColor: COLORS[i % COLORS.length] }}>
                  {d.name} · {d.weight}%
                </span>
              ))}
            </div>
          </section>
        </>
      )}

      <p className="footer-note">Projet MFE · Les résultats passés ne garantissent pas les performances futures</p>
    </div>
  )
}