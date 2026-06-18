import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as api from '../mock/api.js'
import { brl, competenciaLabel } from '../lib/format.js'
import { Kpi, Modal, Note, StatusBadge } from '../components/ui.jsx'

const modulos = [
  { ico: '➕', t: 'Novo cronograma', d: 'Inicie um plano do zero ou a partir de um modelo.', to: '/novo' },
  { ico: '🗓️', t: 'Planos em andamento', d: 'Continue planos em construção.', to: '/planos' },
  { ico: '✅', t: 'Planos finalizados', d: 'Referências revisadas e disponíveis como modelos.', to: '/planos' },
  { ico: '🗂️', t: 'Cadastros e bases', d: 'Unidades, setores, perfis, salários, rubricas.', to: '/cadastros' },
  { ico: '📜', t: 'Normativas / RDCs', d: 'Regras aplicáveis ao dimensionamento.', to: '/cadastros/normativas' },
  { ico: '🧩', t: 'Modelos / Presets', d: 'Modelos por setor e especialidade.', to: '/cadastros/presets' },
]

export default function Dashboard() {
  const nav = useNavigate()
  const [, setVersao] = useState(0)
  const [rascunhoExcluir, setRascunhoExcluir] = useState(null)
  const d = api.getDashboard()

  const excluirRascunho = () => {
    if (!rascunhoExcluir) return
    const resultado = api.excluirPlanoRascunho(rascunhoExcluir.id)
    if (!resultado.ok) return
    setRascunhoExcluir(null)
    setVersao((atual) => atual + 1)
  }
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
        <Kpi valor={d.finalizados} label="Finalizados" />
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
          <div>
            <h3 style={{ fontSize: 15 }}>Todos os planos cadastrados</h3>
            <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>{d.planos.length} planos salvos neste navegador</div>
          </div>
          <Link to="/planos">Gerenciar planos →</Link>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Plano</th><th>Unidade</th><th>Competência</th><th>Status</th>
                <th className="num">Valor anual</th><th>Atualizado</th><th className="num">Ações</th>
              </tr>
            </thead>
            <tbody>
              {d.planos.map((p) => (
                <tr key={p.id} className="row-link" onClick={() => nav(`/plano/${p.id}/construcao`)}>
                  <td><b>{p.nome}</b><div className="muted" style={{ fontSize: 11.5 }}>{p.codigo}{p.planoReferencia ? ' · Modelo de referência' : ''}</div></td>
                  <td>{p.objeto?.nome}</td>
                  <td>{competenciaLabel(p.competencia_inicial)} · {p.meses_projecao}m</td>
                  <td><StatusBadge status={p.status} map={api.statusLabels} /></td>
                  <td className="num tnum">{brl(p.valor_anual)}</td>
                  <td className="muted">{p.atualizado_em}</td>
                  <td className="num">
                    {p.status === 'rascunho'
                      ? <button
                          className="btn sm ghost danger"
                          title="Excluir rascunho"
                          aria-label={`Excluir rascunho ${p.nome}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            setRascunhoExcluir(p)
                          }}
                        >🗑</button>
                      : <span className="muted">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rascunhoExcluir && (
        <Modal title="Excluir rascunho" icon="🗑" onClose={() => setRascunhoExcluir(null)}
          footer={<>
            <button className="btn ghost" onClick={() => setRascunhoExcluir(null)}>Cancelar</button>
            <button className="btn danger" onClick={excluirRascunho}>Excluir rascunho</button>
          </>}>
          <p>Tem certeza de que deseja excluir <b>{rascunhoExcluir.nome}</b>?</p>
          <div className="muted mt-1">{rascunhoExcluir.codigo} · {rascunhoExcluir.objeto?.nome}</div>
          <Note icon="!">A exclusão remove o plano, sua estrutura e os lançamentos salvos. Esta ação não pode ser desfeita.</Note>
        </Modal>
      )}
    </>
  )
}
