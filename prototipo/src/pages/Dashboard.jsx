import { Link, useNavigate } from 'react-router-dom'
import * as api from '../mock/api.js'
import { brl, competenciaLabel } from '../lib/format.js'
import { Kpi, StatusBadge } from '../components/ui.jsx'

const modulos = [
  { ico: '➕', t: 'Novo cronograma', d: 'Inicie um plano do zero ou a partir de um modelo.', to: '/novo' },
  { ico: '🗓️', t: 'Planos em andamento', d: 'Continue planos em construção.', to: '/planos' },
  { ico: '✅', t: 'Planos validados', d: 'Prontos para apuração e cronograma.', to: '/planos' },
  { ico: '🗂️', t: 'Cadastros e bases', d: 'Unidades, setores, perfis, salários, rubricas.', to: '/cadastros' },
  { ico: '📜', t: 'Normativas / RDCs', d: 'Regras aplicáveis ao dimensionamento.', to: '/cadastros/normativas' },
  { ico: '🧩', t: 'Modelos / Presets', d: 'Modelos por setor e especialidade.', to: '/cadastros/presets' },
]

export default function Dashboard() {
  const nav = useNavigate()
  const d = api.getDashboard()
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Painel</h1>
          <div className="sub">Visão geral dos planos de trabalho e cronogramas da SUBHUE.</div>
        </div>
        <div className="actions">
          <Link to="/novo" className="btn primary">＋ Novo cronograma</Link>
        </div>
      </div>

      <div className="grid cols-4 mb-2">
        <Kpi valor={d.total} label="Planos no sistema" />
        <Kpi valor={d.em_andamento} label="Em construção" />
        <Kpi valor={d.validados} label="Validados" />
        <Kpi valor={d.com_pendencia} label="Com pendências" />
      </div>

      <div className="grid cols-3 mb-2">
        <div className="card kpi" style={{ gridColumn: 'span 1' }}>
          <span className="l">Valor anual em análise (SEI)</span>
          <span className="v">{brl(d.valor_em_analise)}</span>
          <span className="t up">{d.enviados_sei} planos vinculados a processo SEI</span>
        </div>
        <div className="card card-pad" style={{ gridColumn: 'span 2' }}>
          <div className="spread mb-2">
            <h3 style={{ fontSize: 15 }}>Acesso rápido</h3>
          </div>
          <div className="grid cols-3">
            {modulos.map((m) => (
              <Link key={m.t} to={m.to} className="module-card" style={{ minHeight: 0, padding: 14 }}>
                <div className="m-ico" style={{ width: 36, height: 36, fontSize: 17 }}>{m.ico}</div>
                <div>
                  <h3 style={{ fontSize: 13.5 }}>{m.t}</h3>
                  <p style={{ fontSize: 11.5 }}>{m.d}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-pad spread">
          <h3 style={{ fontSize: 15 }}>Atualizações recentes</h3>
          <Link to="/planos">Ver todos os planos →</Link>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Plano</th><th>Unidade</th><th>Competência</th><th>Status</th>
                <th className="num">Valor anual</th><th>Atualizado</th>
              </tr>
            </thead>
            <tbody>
              {d.recentes.map((p) => (
                <tr key={p.id} className="row-link" onClick={() => nav(`/plano/${p.id}/construcao`)}>
                  <td><b>{p.nome}</b><div className="muted" style={{ fontSize: 11.5 }}>{p.codigo}</div></td>
                  <td>{p.objeto?.nome}</td>
                  <td>{competenciaLabel(p.competencia_inicial)} · {p.meses_projecao}m</td>
                  <td><StatusBadge status={p.status} map={api.statusLabels} /></td>
                  <td className="num tnum">{brl(p.valor_anual)}</td>
                  <td className="muted">{p.atualizado_em}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
