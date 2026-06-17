import { NavLink, useLocation } from 'react-router-dom'

const nav = [
  { grupo: 'Principal', itens: [
    { to: '/', ico: '▤', label: 'Painel', end: true },
    { to: '/planos', ico: '🗓️', label: 'Planos / Cronogramas' },
    { to: '/novo', ico: '＋', label: 'Novo cronograma' },
  ]},
  { grupo: 'Cadastros e Bases', itens: [
    { to: '/cadastros', ico: '🗂️', label: 'Cadastros' },
    { to: '/cadastros/normativas', ico: '📜', label: 'Normativas / RDCs' },
    { to: '/cadastros/regras', ico: 'R', label: 'Regras normativas' },
    { to: '/cadastros/presets', ico: '🧩', label: 'Modelos / Presets' },
  ]},
]

const crumbsMap = [
  { re: /^\/$/, c: ['Painel'] },
  { re: /^\/planos$/, c: ['Planos / Cronogramas'] },
  { re: /^\/novo/, c: ['Planos', 'Novo cronograma'] },
  { re: /^\/plano\/\d+\/construcao/, c: ['Planos', 'Construção'] },
  { re: /^\/plano\/\d+\/lancamentos/, c: ['Planos', 'Lancamentos'] },
  { re: /^\/plano\/\d+\/cronograma/, c: ['Planos', 'Cronograma financeiro'] },
  { re: /^\/plano\/\d+\/completude/, c: ['Planos', 'Checklist de completude'] },
  { re: /^\/plano\/\d+\/simulacao/, c: ['Planos', 'Simulação de cenários'] },
  { re: /^\/plano\/\d+\/acompanhamento/, c: ['Planos', 'Acompanhamento'] },
  { re: /^\/plano\/\d+/, c: ['Planos', 'Plano'] },
  { re: /^\/cadastros\/normativas/, c: ['Cadastros', 'Normativas / RDCs'] },
  { re: /^\/cadastros\/regras/, c: ['Cadastros', 'Regras normativas'] },
  { re: /^\/cadastros\/presets/, c: ['Cadastros', 'Modelos / Presets'] },
  { re: /^\/cadastros/, c: ['Cadastros'] },
]

export default function AppShell({ children }) {
  const loc = useLocation()
  const crumbs = (crumbsMap.find((m) => m.re.test(loc.pathname)) || { c: [''] }).c
  return (
    <div className="app">
      <div className="logo-area">
        <div className="logo-mark">CS</div>
        <div className="logo-text">
          <strong>Construtor de Cronogramas</strong>
          <span>SUBHUE · SMS-Rio</span>
        </div>
      </div>

      <header className="topbar">
        <div className="crumbs">
          {crumbs.map((c, i) => (
            <span key={i} className="flex" style={{ gap: 7 }}>
              {i > 0 && <span className="sep">/</span>}
              {i === crumbs.length - 1 ? <b>{c}</b> : <span>{c}</span>}
            </span>
          ))}
        </div>
        <div className="search">
          <span className="ico">🔍</span>
          <input placeholder="Buscar planos, unidades, setores, normativas…" />
        </div>
        <div className="user-chip">
          <div className="avatar">CM</div>
          <div>
            <strong>Carlos M.</strong>
            <small>Analista · SUBHUE</small>
          </div>
        </div>
      </header>

      <aside className="sidebar">
        {nav.map((g) => (
          <div key={g.grupo}>
            <div className="nav-group-label">{g.grupo}</div>
            {g.itens.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.end}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="ico">{it.ico}</span>
                <span>{it.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
        <div style={{ marginTop: 'auto', padding: '18px 12px 4px', fontSize: 11, color: '#6f9bc9' }}>
          Protótipo · dados simulados
        </div>
      </aside>

      <main className={loc.pathname.includes('/construcao') || loc.pathname.includes('/cronograma') ? 'main no-pad' : 'main'}>
        {children}
      </main>
    </div>
  )
}
