import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../mock/api.js'
import { brl, competenciaLabel } from '../lib/format.js'
import { StatusBadge, Badge } from '../components/ui.jsx'

export default function Planos() {
  const nav = useNavigate()
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  let planos = api.listPlanos()
  if (busca) planos = planos.filter((p) => (p.nome + p.objeto?.nome + p.codigo).toLowerCase().includes(busca.toLowerCase()))
  if (status) planos = planos.filter((p) => p.status === status)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Planos / Cronogramas</h1>
          <div className="sub">{planos.length} planos · clique para abrir a construção.</div>
        </div>
        <div className="actions">
          <Link to="/novo" className="btn primary">＋ Novo cronograma</Link>
        </div>
      </div>

      <div className="card card-pad mb-2 flex wrap" style={{ gap: 12 }}>
        <input className="cell-input" style={{ width: 280, textAlign: 'left', border: '1px solid var(--cinza-borda-forte)' }}
          placeholder="Buscar por nome, unidade ou código…" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          style={{ padding: '8px 11px', border: '1px solid var(--cinza-borda-forte)', borderRadius: 7 }}>
          <option value="">Todos os status</option>
          {Object.entries(api.statusLabels).map(([k, v]) => <option key={k} value={k}>{v.txt}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Plano</th><th>Unidade</th><th>Competência</th><th>Status</th>
                <th>Processo SEI</th><th className="num">Valor mensal</th><th className="num">Valor anual</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {planos.map((p) => (
                <tr key={p.id}>
                  <td className="row-link" onClick={() => nav(`/plano/${p.id}/construcao`)}>
                    <b>{p.nome}</b>
                    <div className="muted" style={{ fontSize: 11.5 }}>{p.codigo} · {p.responsavel}</div>
                  </td>
                  <td>{p.objeto?.nome}<div className="muted" style={{ fontSize: 11.5 }}>{p.objeto?.tipo}</div></td>
                  <td>{competenciaLabel(p.competencia_inicial)}<div className="muted" style={{ fontSize: 11.5 }}>{p.meses_projecao} meses</div></td>
                  <td><StatusBadge status={p.status} map={api.statusLabels} /></td>
                  <td>{p.sei ? <span style={{ fontSize: 12 }}>{p.sei.numero}<div><StatusBadge status={p.sei.status} map={api.seiStatusLabels} /></div></span> : <Badge>Sem SEI</Badge>}</td>
                  <td className="num tnum">{brl(p.valor_mensal)}</td>
                  <td className="num tnum"><b>{brl(p.valor_anual)}</b></td>
                  <td>
                    <div className="flex wrap" style={{ gap: 6 }}>
                      <Link className="btn sm" to={`/plano/${p.id}/construcao`}>Abrir</Link>
                      <Link className="btn sm ghost" to={`/plano/${p.id}/cronograma`}>Cronograma</Link>
                      <Link className="btn sm ghost" to={`/plano/${p.id}/acompanhamento`}>Acompanhamento</Link>
                      <button className="btn sm ghost" title="Duplicar plano" onClick={() => { const c = api.duplicarPlano(p.id); if (c) nav(`/plano/${c.id}/construcao`) }}>⧉ Duplicar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
