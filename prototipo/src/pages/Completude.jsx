import { useParams, useNavigate, Link } from 'react-router-dom'
import * as api from '../mock/api.js'
import { Progress, Badge, Note } from '../components/ui.jsx'

export default function Completude() {
  const { id } = useParams()
  const planoId = Number(id)
  const nav = useNavigate()
  const plano = api.getPlano(planoId)
  const c = api.getCompletude(planoId)
  const pronto = c.resumo.total_faltantes === 0 && c.resumo.escopos_completos === c.resumo.escopos_total

  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <div className="page-head">
        <div>
          <Link to={`/plano/${planoId}/construcao`} className="muted" style={{ fontSize: 12.5 }}>← {plano.nome}</Link>
          <h1 style={{ marginTop: 4 }}>Checklist de completude</h1>
          <div className="sub">Validação antes de apurar e gerar o cronograma.</div>
        </div>
      </div>

      <div className="card card-pad mb-2">
        <div className="spread mb-2">
          <div>
            <div style={{ fontSize: 30, fontWeight: 750, color: 'var(--azul-900)' }}>{c.resumo.percentual}%</div>
            <div className="muted">{c.resumo.total_preenchidas} de {c.resumo.total_exigidas} variáveis obrigatórias preenchidas · {c.resumo.escopos_completos}/{c.resumo.escopos_total} setores completos</div>
          </div>
          <button className="btn primary" disabled={!pronto} onClick={() => nav(`/plano/${planoId}/cronograma`)}>
            {pronto ? 'Apurar e gerar cronograma →' : 'Resolva as pendências'}
          </button>
        </div>
        <Progress value={c.resumo.percentual} warn={!pronto} />
      </div>

      {pronto && <Note icon="✅">Tudo certo! O plano está pronto para apuração.</Note>}

      <div className="card mt-2">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Setor</th><th className="num">Obrigatórias</th><th className="num">Preenchidas</th><th>Equipe</th><th>Situação</th><th></th></tr></thead>
            <tbody>
              {c.linhas.map((l) => {
                const ok = l.faltantes === 0 && !l.semEquipe
                return (
                  <tr key={l.no.id}>
                    <td><b>{l.no.icone} {l.no.nome}</b></td>
                    <td className="num">{l.exigidas}</td>
                    <td className="num">{l.preenchidas}</td>
                    <td>{l.semEquipe ? <Badge cls="vermelho" dot>Sem equipe</Badge> : <Badge cls="verde" dot>OK</Badge>}</td>
                    <td>{ok ? <Badge cls="verde" dot>Completo</Badge> : <Badge cls="ambar" dot>{l.faltantes} pendência(s)</Badge>}</td>
                    <td>{!ok && <Link className="btn sm" to={`/plano/${planoId}/construcao`}>Corrigir →</Link>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
