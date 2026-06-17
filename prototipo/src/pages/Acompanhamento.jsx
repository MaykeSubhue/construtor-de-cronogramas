import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import * as api from '../mock/api.js'
import { brl, competenciaLabel } from '../lib/format.js'
import { StatusBadge, Badge, Note } from '../components/ui.jsx'

// Ciclo de vida institucional do plano (Etapas 11–14 do briefing).
const FLUXO = [
  { s: 'rascunho', t: 'Rascunho' },
  { s: 'em_andamento', t: 'Em construção' },
  { s: 'validado', t: 'Validado' },
  { s: 'apurado', t: 'Apurado' },
  { s: 'cronograma_gerado', t: 'Cronograma' },
  { s: 'enviado_sei', t: 'Enviado ao SEI' },
  { s: 'aprovado', t: 'Aprovado' },
  { s: 'fechado', t: 'Fechado' },
]

export default function Acompanhamento() {
  const { id } = useParams()
  const planoId = Number(id)
  const nav = useNavigate()
  const [, force] = useState(0)
  const refresh = () => force((n) => n + 1)
  const plano = api.getPlano(planoId)
  const idx = FLUXO.findIndex((f) => f.s === plano.status)

  const go = (status) => { api.setStatusPlano(planoId, status); refresh() }

  // ações contextuais conforme o estado atual
  const acoes = []
  if (['rascunho', 'em_andamento'].includes(plano.status)) acoes.push({ t: 'Validar tecnicamente', to: 'validado', primary: true })
  if (plano.status === 'validado') acoes.push({ t: 'Apurar', to: 'apurado', primary: true })
  if (plano.status === 'apurado') acoes.push({ t: 'Gerar cronograma', to: 'cronograma_gerado', primary: true })
  if (plano.status === 'cronograma_gerado') acoes.push({ t: 'Enviar ao SEI', to: 'enviado_sei', primary: true })
  if (plano.status === 'enviado_sei') {
    acoes.push({ t: 'Registrar aprovação', to: 'aprovado', primary: true })
    acoes.push({ t: 'Registrar devolução', to: 'em_andamento' })
  }
  if (plano.status === 'aprovado') acoes.push({ t: 'Fechar plano', to: 'fechado', primary: true })
  if (plano.status === 'arquivado') acoes.push({ t: 'Reabrir', to: 'em_andamento', primary: true })
  else acoes.push({ t: 'Arquivar', to: 'arquivado' })

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div className="page-head">
        <div>
          <Link to={`/plano/${planoId}/construcao`} className="muted" style={{ fontSize: 12.5 }}>← {plano.nome}</Link>
          <h1 style={{ marginTop: 4 }}>Acompanhamento</h1>
          <div className="sub">{plano.objeto?.nome} · {plano.codigo} · {brl(plano.valor_anual)}/ano</div>
        </div>
        <div className="actions">
          <StatusBadge status={plano.status} map={api.statusLabels} />
        </div>
      </div>

      {/* ciclo de vida */}
      <div className="card card-pad mb-2">
        <div className="section-title">Ciclo de vida</div>
        <div className="wizard-steps" style={{ flexWrap: 'wrap', rowGap: 10 }}>
          {FLUXO.map((f, i) => (
            <div key={f.s} className={`wstep ${i === idx ? 'active' : ''} ${i < idx ? 'done' : ''}`}>
              <span className="n">{i < idx ? '✓' : i + 1}</span>
              <span>{f.t}</span>
              {i < FLUXO.length - 1 && <span className="wstep-sep" style={{ minWidth: 14 }} />}
            </div>
          ))}
        </div>
        {plano.status === 'arquivado' && <Note icon="📦">Plano arquivado — fora do fluxo ativo. Pode ser reaberto.</Note>}
        <div className="flex wrap mt-2" style={{ gap: 10 }}>
          {acoes.map((a) => (
            <button key={a.t} className={`btn ${a.primary ? 'primary' : ''}`} onClick={() => go(a.to)}>{a.t}</button>
          ))}
        </div>
      </div>

      <div className="grid cols-2 mb-2">
        {/* SEI */}
        <SeiCard plano={plano} planoId={planoId} refresh={refresh} />

        {/* exportações + versões */}
        <div className="card card-pad">
          <div className="section-title">Exportações e versões</div>
          <div className="flex wrap" style={{ gap: 10, marginBottom: 14 }}>
            <button className="btn">📊 Excel consolidado</button>
            <button className="btn">📄 PDF resumo executivo</button>
            <button className="btn">🧮 Memória de cálculo</button>
            <button className="btn">📎 Relatório p/ SEI</button>
          </div>
          <div className="section-title">Versões salvas</div>
          <div className="stat-line"><span className="k">v3 · cronograma gerado</span><span className="muted">28/05/2026</span></div>
          <div className="stat-line"><span className="k">v2 · após redimensionamento</span><span className="muted">15/05/2026</span></div>
          <div className="stat-line"><span className="k">v1 · estrutura inicial</span><span className="muted">10/02/2026</span></div>
          <button className="btn sm mt-2" onClick={() => nav(`/plano/${planoId}/cronograma`)}>Abrir cronograma →</button>
        </div>
      </div>

      <Note icon="ℹ️">As transições de status são ilustrativas no protótipo (no produto, cada uma dispara as regras de negócio: validação de completude, apuração persistida, geração de cronograma, etc.).</Note>
    </div>
  )
}

function SeiCard({ plano, planoId, refresh }) {
  const [edit, setEdit] = useState(false)
  const [f, setF] = useState(plano.sei || { numero: '', etapa: '', responsavel: '', status: 'em_analise' })
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const salvar = () => { api.vincularSei(planoId, f); setEdit(false); refresh() }

  return (
    <div className="card card-pad">
      <div className="spread"><div className="section-title" style={{ margin: 0 }}>Processo SEI</div>
        {!edit && <button className="btn sm" onClick={() => setEdit(true)}>{plano.sei ? 'Editar' : 'Vincular'}</button>}
      </div>
      {!edit && !plano.sei && <Note icon="📎">Nenhum processo SEI vinculado.</Note>}
      {!edit && plano.sei && (
        <div className="mt-1">
          <div className="stat-line"><span className="k">Número</span><span className="v">{plano.sei.numero}</span></div>
          <div className="stat-line"><span className="k">Etapa</span><span className="v">{plano.sei.etapa}</span></div>
          <div className="stat-line"><span className="k">Responsável</span><span className="v">{plano.sei.responsavel}</span></div>
          <div className="stat-line"><span className="k">Situação</span><span className="v"><StatusBadge status={plano.sei.status} map={api.seiStatusLabels} /></span></div>
          <div className="stat-line"><span className="k">Abertura</span><span className="v">{plano.sei.abertura}</span></div>
        </div>
      )}
      {edit && (
        <div className="mt-1">
          <div className="field"><label>Número do processo SEI</label><input value={f.numero} onChange={(e) => set('numero', e.target.value)} placeholder="SEI-080001/000000/2026" /></div>
          <div className="field"><label>Etapa interna</label><input value={f.etapa} onChange={(e) => set('etapa', e.target.value)} /></div>
          <div className="form-row">
            <div className="field"><label>Responsável</label><input value={f.responsavel} onChange={(e) => set('responsavel', e.target.value)} /></div>
            <div className="field"><label>Situação</label>
              <select value={f.status} onChange={(e) => set('status', e.target.value)}>
                {Object.entries(api.seiStatusLabels).map(([k, v]) => <option key={k} value={k}>{v.txt}</option>)}
              </select>
            </div>
          </div>
          <div className="flex" style={{ gap: 8 }}>
            <button className="btn primary" onClick={salvar}>Salvar</button>
            <button className="btn ghost" onClick={() => setEdit(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}
