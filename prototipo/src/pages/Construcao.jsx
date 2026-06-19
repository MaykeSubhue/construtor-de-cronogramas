import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import * as api from '../mock/api.js'
import { brl, num, pct, competenciaLabel } from '../lib/format.js'
import { Modal, Badge, OrigemTag, Progress, StatusBadge, Note, Empty } from '../components/ui.jsx'

const TABS = ['Resumo', 'Parâmetros', 'Equipe / RH', 'Custeio', 'Produção', 'Regras', 'Histórico']

export default function Construcao() {
  const { id } = useParams()
  const planoId = Number(id)
  const nav = useNavigate()
  const plano = api.getPlano(planoId)
  const [, force] = useState(0)
  const refresh = () => force((n) => n + 1)

  const escopos = plano ? api.listEscopos(planoId) : []
  const servicoInicial = escopos.find((e) => e.rdcId === 6) || escopos[0]
  const [selId, setSelId] = useState(servicoInicial?.id)
  const [grupoEquipeId, setGrupoEquipeId] = useState(servicoInicial?.gruposEquipe?.[0]?.id || null)
  const [tab, setTab] = useState('Equipe / RH')
  const [presetOpen, setPresetOpen] = useState(false)
  const [memo, setMemo] = useState(null)
  const [cebas, setCebas] = useState(false) // cenário ativo (Sem/Com CEBAS)
  const [modelo, setModelo] = useState('grupos') // modelo de custo: grupos A–E ou motor SUBHUE
  const [addNodeOpen, setAddNodeOpen] = useState(false)
  const [addProfOpen, setAddProfOpen] = useState(false)
  const [addGrupoOpen, setAddGrupoOpen] = useState(false)
  const [addCusteioOpen, setAddCusteioOpen] = useState(false)
  const [regraOpen, setRegraOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [justif, setJustif] = useState(null) // desvio pendente de justificativa

  if (!plano) {
    return (
      <div style={{ padding: 24 }}>
        <Empty icon="⚠️">
          <p><b>Plano {planoId} não encontrado neste navegador.</b></p>
          <p className="muted" style={{ maxWidth: 640 }}>
            No protótipo, planos criados ficam salvos no localStorage do navegador usado na criação.
            Se você abrir o mesmo endereço em outro navegador, esse plano pode ainda não existir ali.
          </p>
          <div className="flex mt-2" style={{ gap: 8, justifyContent: 'center' }}>
            <Link className="btn primary" to="/novo">Criar novo cronograma</Link>
            <Link className="btn" to="/planos">Ver planos deste navegador</Link>
          </div>
        </Empty>
      </div>
    )
  }

  const no = api.findNo(planoId, selId)
  const grupoEquipe = (no?.gruposEquipe || []).find((grupo) => grupo.id === grupoEquipeId) || null
  const calc = no ? api.calcEscopo(no, { cebas, modelo }) : null
  const completude = api.getCompletude(planoId)
  const totalPlano = escopos.reduce((a, n) => a + api.calcEscopo(n, { cebas, modelo }).total_mensal, 0)
  const excluirNo = (node) => {
    const concluir = (motivo = '') => {
      if (node.origemTemplate) {
        api.registrarJustificativa(planoId, { tipo: 'setor_template_removido', noId: node.id, setorSlug: node.matrizSetorSlug }, {
          motivo,
          tipo: 'setor_template_removido',
          observacao: `Serviço "${node.nome}" removido da estrutura criada automaticamente.`,
        })
      }
      api.removeNo(planoId, node.id)
      setSelId(api.listEscopos(planoId)[0]?.id)
      setGrupoEquipeId(null)
      refresh()
    }
    if (node.origemTemplate) {
      setJustif({
        generico: true,
        titulo: 'Remover serviço criado pelo modelo',
        label: node.nome,
        texto: 'Este serviço veio da criação automática. Para remover, registre a justificativa técnica.',
        onConfirm: concluir,
        onCancel: () => {},
      })
      return
    }
    if (confirm(`Excluir "${node.nome}"?`)) concluir()
  }

  return (
    <div className={`builder ${tab === 'Equipe / RH' ? 'team-layout' : ''}`}>
      {/* ---------------------------------------------------- árvore */}
      <aside className="builder-col builder-tree">
        <div className="tree-head">
          <h4>Serviços da unidade</h4>
          <button className="btn sm ghost" title="Adicionar serviço" onClick={() => setAddNodeOpen(true)}>＋</button>
        </div>
        {escopos.length === 0 && api.getEstrutura(planoId).length === 0 ? (
          <div className="empty" style={{ padding: '24px 8px' }}>
            <div className="e-ico" style={{ fontSize: 30 }}>🏗️</div>
            <p style={{ fontSize: 12.5 }}>Nenhum serviço cadastrado nesta unidade.</p>
          </div>
        ) : (
          <Tree
            nodes={api.getEstrutura(planoId)}
            selId={selId}
            grupoEquipeId={grupoEquipeId}
            onSelect={(n) => {
              setSelId(n.id)
              setGrupoEquipeId(null)
              setTab('Equipe / RH')
            }}
            onSelectGrupo={(n, grupo) => { setSelId(n.id); setGrupoEquipeId(grupo.id); setTab('Equipe / RH') }}
            planoId={planoId}
          />
        )}
        <div className="divider" />
        <button className="btn sm" style={{ width: '100%' }} onClick={() => setAddNodeOpen(true)}>＋ Adicionar serviço</button>
      </aside>

      {/* ---------------------------------------------------- centro */}
      <section className="builder-col builder-center">
        <div className="spread mb-2">
          <div>
            <div className="muted" style={{ fontSize: 12 }}>{plano.nome} · {plano.objeto?.nome}</div>
            <h1 style={{ fontSize: 20, marginTop: 2 }}>{no?.nome || 'Selecione um serviço'}</h1>
            <div className="flex" style={{ gap: 8, marginTop: 4 }}>
              {no && (
                <div className="flex" style={{ gap: 2 }}>
                  <button className="btn sm ghost" onClick={() => setRenameOpen(true)}>✏️ Renomear</button>
                  <button className="btn sm ghost" onClick={() => { const c = api.duplicarNo(planoId, no.id); if (c) { setSelId(c.id); setGrupoEquipeId(null); refresh() } }}>⧉ Duplicar</button>
                  <button className="btn sm ghost danger" onClick={() => excluirNo(no)}>🗑 Excluir</button>
                </div>
              )}
            </div>
          </div>
          <div className="flex" style={{ gap: 12 }}>
            <div title="Modelo de cálculo de encargos e benefícios">
              <div className="muted" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 3 }}>Modelo de custo</div>
              <div className="pill-toggle">
                <button className={modelo === 'grupos' ? 'active' : ''} onClick={() => setModelo('grupos')}>Grupos A–E</button>
                <button className={modelo === 'subhue' ? 'active' : ''} onClick={() => setModelo('subhue')}>Motor SUBHUE</button>
              </div>
            </div>
            <div title={modelo === 'subhue' ? 'O motor SUBHUE usa alíquota única — CEBAS não se aplica' : 'Cenário tributário (overlay do plano)'} style={modelo === 'subhue' ? { opacity: .4, pointerEvents: 'none' } : null}>
              <div className="muted" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 3 }}>Cenário</div>
              <div className="pill-toggle">
                <button className={!cebas ? 'active' : ''} onClick={() => setCebas(false)}>Sem CEBAS</button>
                <button className={cebas ? 'active' : ''} onClick={() => setCebas(true)}>Com CEBAS</button>
              </div>
            </div>
            {no?.escopo && (
              <button className="btn primary" onClick={() => setPresetOpen(true)}>📜 Aplicar RDC / normativa</button>
            )}
          </div>
        </div>

        <div className="plan-flow mb-2">
          <span className="active"><b>1</b> Serviços e equipes</span>
          <Link to={`/plano/${planoId}/cronograma`}><b>2</b> Cronograma calculado</Link>
        </div>

        {!no && (
          <Empty icon="🏗️">
            <p>Nenhum serviço selecionado.</p>
            <button className="btn primary mt-2" onClick={() => setAddNodeOpen(true)}>＋ Adicionar serviço</button>
          </Empty>
        )}

        {no && !no.escopo && (
          <Note>Selecione um serviço na árvore, ou <a onClick={() => setAddNodeOpen(true)} style={{ cursor: 'pointer' }}>adicione um serviço à unidade</a>.</Note>
        )}

        {no?.escopo && (
          <>
            <div className="tabs">
              {TABS.map((t) => <div key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</div>)}
            </div>

            {tab === 'Resumo' && <TabResumo no={no} calc={calc} completude={completude} />}
            {tab === 'Parâmetros' && <TabParametros no={no} planoId={planoId} refresh={refresh} />}
            {tab === 'Equipe / RH' && <TabEquipe no={no} planoId={planoId} calc={calc} cebas={cebas} modelo={modelo} grupoEquipe={grupoEquipe} onClearGrupo={() => setGrupoEquipeId(null)} refresh={refresh} onMemo={setMemo} onAdd={() => setAddProfOpen(true)} onAddGrupo={() => setAddGrupoOpen(true)} onRemoveGrupo={(grupo) => { api.removeGrupoEquipe(planoId, no.id, grupo.id); setGrupoEquipeId(no.gruposEquipe?.[0]?.id || null); refresh() }} onRegra={() => setRegraOpen(true)} onJustif={setJustif} />}
            {tab === 'Custeio' && <TabCusteio no={no} planoId={planoId} calc={calc} refresh={refresh} onAdd={() => setAddCusteioOpen(true)} />}
            {tab === 'Produção' && <TabProducao no={no} planoId={planoId} refresh={refresh} />}
            {tab === 'Regras' && <TabRegras plano={plano} no={no} />}
            {tab === 'Histórico' && <TabHistorico plano={plano} no={no} />}
          </>
        )}
      </section>

      {/* ---------------------------------------------------- painel direito */}
      <aside className="builder-col builder-side">
        <div className="side-block">
          <h4>Plano</h4>
          <div className="flex" style={{ justifyContent: 'space-between' }}>
            <StatusBadge status={plano.status} map={api.statusLabels} />
            <span className="muted" style={{ fontSize: 12 }}>{plano.meses_projecao} meses</span>
          </div>
          <div className="stat-line mt-1"><span className="k">Modelo de custo</span><span className="v"><Badge cls={modelo === 'subhue' ? 'roxo' : 'cinza'} dot>{modelo === 'subhue' ? 'Motor SUBHUE' : 'Grupos A–E'}</Badge></span></div>
          <div className="stat-line"><span className="k">Cenário</span><span className="v"><Badge cls={modelo === 'subhue' ? 'cinza' : (cebas ? 'verde' : 'cinza')} dot>{modelo === 'subhue' ? 'n/a' : (cebas ? 'Com CEBAS' : 'Sem CEBAS')}</Badge></span></div>
          <div className="stat-line"><span className="k">Competência</span><span className="v">{competenciaLabel(plano.competencia_inicial)}</span></div>
          <div className="stat-line"><span className="k">Custo mensal (plano)</span><span className="v">{brl(totalPlano)}</span></div>
          <div className="stat-line"><span className="k">Custo anual (plano)</span><span className="v big">{brl(totalPlano * 12)}</span></div>
        </div>

        <div className="side-block">
          <h4>Completude</h4>
          <Progress value={completude.resumo.percentual} warn={completude.resumo.percentual < 100} />
          <div className="flex" style={{ justifyContent: 'space-between', marginTop: 6, fontSize: 12 }}>
            <span className="muted">{completude.resumo.percentual}% preenchido</span>
            <span className="muted">{completude.resumo.escopos_completos}/{completude.resumo.escopos_total} serviços ok</span>
          </div>
        </div>

        <div className="side-block">
          <h4>Pendências</h4>
          {completude.linhas.flatMap((l) => l.pendencias.map((p) => ({ ...p, no: l.no }))).length === 0 && (
            <div className="muted" style={{ fontSize: 12.5 }}>Nenhuma pendência. ✅</div>
          )}
          {completude.linhas.flatMap((l) => l.pendencias.map((p) => ({ ...p, no: l.no }))).slice(0, 6).map((p, i) => (
            <div key={i} className={`pend-item ${p.tipo === 'equipe' ? 'erro' : ''}`} onClick={() => { setSelId(p.no.id); setGrupoEquipeId(null); setTab(p.tipo === 'equipe' ? 'Equipe / RH' : 'Parâmetros') }}>
              <span className="ic">⚠️</span>
              <div><b>{p.no.nome}</b><div>{p.msg}</div></div>
            </div>
          ))}
        </div>

        <div className="divider" />
        <div className="flex" style={{ flexDirection: 'column', gap: 8 }}>
          <Link className="btn" style={{ width: '100%', justifyContent: 'center' }} to={`/plano/${planoId}/completude`}>✓ Checklist de completude</Link>
          <Link className="btn" style={{ width: '100%', justifyContent: 'center' }} to={`/plano/${planoId}/simulacao`}>⚖️ Simular cenários</Link>
          <Link className="btn" style={{ width: '100%', justifyContent: 'center' }} to={`/plano/${planoId}/acompanhamento`}>📋 Acompanhamento / SEI</Link>
          <Link className="btn primary" style={{ width: '100%', justifyContent: 'center' }} to={`/plano/${planoId}/cronograma?${new URLSearchParams({ ...(cebas && modelo !== 'subhue' ? { cebas: '1' } : {}) }).toString()}`}>Abrir cronograma calculado</Link>
        </div>
      </aside>

      {presetOpen && <RDCModal no={no} planoId={planoId} onClose={() => setPresetOpen(false)} onApply={() => { setPresetOpen(false); setGrupoEquipeId(null); refresh() }} />}
      {memo && <MemoModal data={memo} onClose={() => setMemo(null)} />}
      {addNodeOpen && <AddNodeModal planoId={planoId} onClose={() => setAddNodeOpen(false)} onCreate={(novo) => { setAddNodeOpen(false); setSelId(novo.id); setGrupoEquipeId(novo.gruposEquipe?.[0]?.id || null); setTab('Equipe / RH'); refresh() }} />}
      {addGrupoOpen && no && <AddGrupoModal onClose={() => setAddGrupoOpen(false)} onAdd={(nome) => { const grupo = api.addGrupoEquipe(planoId, no.id, nome); setAddGrupoOpen(false); setGrupoEquipeId(grupo?.id || null); setTab('Equipe / RH'); refresh() }} />}
      {addProfOpen && no && <AddProfModal onClose={() => setAddProfOpen(false)} onAdd={(dados) => {
        const { perfilId, qtd, chs, quantidadeTurno } = dados
        const item = api.addProfissional(planoId, no.id, perfilId, qtd, grupoEquipe, { chs, quantidadeTurno })
        setAddProfOpen(false)
        // Se o perfil não é previsto pela RDC do setor, exige justificativa.
        const previsto = api.prescricaoRDC(no).some((p) => p.perfilId === Number(perfilId))
        if (no.rdcId != null && !previsto) {
          const perfil = api.getPerfil(perfilId)
          setJustif({
            perfil, previsto: 0, novo: Math.round(qtd), texto: 'Profissional não previsto pela referência normativa deste serviço.',
            onConfirm: (motivo) => { api.registrarDesvio(planoId, no.id, Number(perfilId), { de: 0, para: Math.round(qtd), motivo, tipo: 'adicionado' }); refresh() },
            onCancel: () => { if (item) api.removeProfissional(planoId, no.id, item.id); refresh() },
          })
        } else refresh()
      }} />}
      {addCusteioOpen && no && <AddCusteioModal onClose={() => setAddCusteioOpen(false)} onAdd={(nome, valor) => { api.addCusteio(planoId, no.id, nome, valor); setAddCusteioOpen(false); refresh() }} />}
      {regraOpen && no && <RegraQuadroModal planoId={planoId} no={no} onClose={() => setRegraOpen(false)} onApply={(sugs) => { api.materializarQuadro(planoId, no.id, sugs); setRegraOpen(false); setGrupoEquipeId(null); setTab('Equipe / RH'); refresh() }} />}
      {renameOpen && no && <RenomearModal nome={no.nome} onClose={() => setRenameOpen(false)} onSave={(nome) => { api.renomearNo(planoId, no.id, nome); setRenameOpen(false); refresh() }} />}
      {justif && <JustificativaModal data={justif} onClose={() => setJustif(null)} />}
    </div>
  )
}

/* ----------------------------------------------------------- modal: justificativa de desvio da RDC */
function JustificativaModal({ data, onClose }) {
  const [motivo, setMotivo] = useState('')
  const cancelar = () => { data.onCancel && data.onCancel(); onClose() }
  const confirmar = () => { data.onConfirm(motivo.trim()); onClose() }
  return (
    <Modal title={data.titulo || 'Alteração à revelia da RDC'} icon="⚠️" onClose={cancelar}
      footer={<>
        <button className="btn ghost" onClick={cancelar}>{data.cancelLabel || 'Cancelar (manter RDC)'}</button>
        <button className="btn primary" disabled={!motivo.trim()} onClick={confirmar}>{data.confirmLabel || 'Confirmar alteração'}</button>
      </>}>
      <div className="note" style={{ borderColor: 'var(--ambar-borda, #f0c36d)' }}>
        <span>📜</span>
        <div>
          <b>{data.generico ? data.label : data.perfil?.label}</b><br />
          {data.generico
            ? <span>Alteração estrutural fora da criação automática.</span>
            : <>{data.referenciaLabel || 'RDC preconiza'}: <b>{num(data.previsto)}</b> · você está definindo: <b>{num(data.novo)}</b></>}
          {data.texto && <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{data.texto}</div>}
        </div>
      </div>
      <div className="field mt-2">
        <label>Justificativa (obrigatória)</label>
        <textarea rows={3} autoFocus value={motivo} onChange={(e) => setMotivo(e.target.value)}
          placeholder="Ex.: escopo não contratado nesta etapa; ajuste temporário autorizado; demanda sazonal..."
          style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--cinza-borda-forte)', borderRadius: 6, resize: 'vertical', font: 'inherit' }} />
        <div className="hint">A alteração só é registrada com a justificativa. Ela fica visível na conformidade e no histórico.</div>
      </div>
    </Modal>
  )
}

/* ----------------------------------------------------------- árvore */
function Tree({ nodes, selId, grupoEquipeId, onSelect, onSelectGrupo, planoId }) {
  return (
    <div>
      {nodes.map((n) => {
        const pend = n.escopo ? api.pendenciasDoNo(n).length : 0
        return (
          <div key={n.id}>
            <div className={`tree-node ${selId === n.id && !grupoEquipeId ? 'active' : ''}`} onClick={() => onSelect(n)}>
              <span className="ico">{n.icone}</span>
              <span title={n.nome} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.nome}</span>
              {n.escopo && (pend > 0 ? <span className="pend" title={`${pend} pendência(s)`} /> : <span className="ok">✓</span>)}
            </div>
            {n.escopo && (n.gruposEquipe || []).length > 0 && (
              <div className="tree-children tree-team-groups">
                {n.gruposEquipe.map((grupo) => (
                  <div
                    key={grupo.id}
                    className={`tree-node tree-team-group ${selId === n.id && grupoEquipeId === grupo.id ? 'active' : ''}`}
                    onClick={() => onSelectGrupo(n, grupo)}
                  >
                    <span className="ico">•</span>
                    <span title={grupo.nome} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{grupo.nome}</span>
                  </div>
                ))}
              </div>
            )}
            {n.children && <div className="tree-children"><Tree nodes={n.children} selId={selId} grupoEquipeId={grupoEquipeId} onSelect={onSelect} onSelectGrupo={onSelectGrupo} planoId={planoId} /></div>}
          </div>
        )
      })}
    </div>
  )
}

/* ----------------------------------------------------------- aba Resumo */
function TabResumo({ no, calc, completude }) {
  const linha = completude.linhas.find((l) => l.no.id === no.id)
  return (
    <>
      {no.origemTemplate && <Note icon="🏥">Serviço criado automaticamente pelo modelo hospitalar. Remoção exige justificativa técnica.</Note>}
      {no.foraMatriz && <Note icon="⚠️">Serviço sem regra estruturada correspondente na matriz. A equipe pode ser preenchida manualmente e revisada antes do uso oficial.</Note>}
      <div className="grid cols-3 mb-2">
        <Mini t="Equipe total" v={`${num(calc.equipe_total)} prof.`} />
        <Mini t="Custo mensal" v={brl(calc.total_mensal)} dest />
        <Mini t="Custo anual" v={brl(calc.total_anual)} />
      </div>
      <div className="card card-pad mb-2">
        <div className="section-title">Composição do custo mensal</div>
        <BarLine label="RH (salários + encargos + benefícios)" valor={calc.rh_total} total={calc.total_mensal} cor="var(--azul-600)" />
        <BarLine label="Custeio operacional" valor={calc.custeio_total} total={calc.total_mensal} cor="var(--roxo)" />
      </div>
      <div className="card card-pad">
        <div className="section-title">Situação deste serviço</div>
        {linha && linha.faltantes === 0 && !linha.semEquipe
          ? <Note icon="✅">Serviço completo: parâmetros obrigatórios preenchidos e equipe definida.</Note>
          : <Note icon="⚠️">{linha?.faltantes || 0} parâmetro(s) pendente(s){linha?.semEquipe ? ' · sem equipe' : ''}. Veja as abas Parâmetros e Equipe / RH.</Note>}
      </div>
    </>
  )
}

function Mini({ t, v, dest }) {
  return <div className="card kpi"><span className="l">{t}</span><span className="v" style={{ fontSize: dest ? 24 : 20, color: dest ? 'var(--azul-900)' : undefined }}>{v}</span></div>
}

function BarLine({ label, valor, total, cor }) {
  const p = total ? (valor / total) * 100 : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div className="spread" style={{ fontSize: 12.5, marginBottom: 4 }}><span>{label}</span><b className="tnum">{brl(valor)} · {pct(p)}</b></div>
      <div className="progress"><span style={{ width: `${p}%`, background: cor }} /></div>
    </div>
  )
}

/* ----------------------------------------------------------- aba Parâmetros */
function TabParametros({ no, planoId, refresh }) {
  if (!no.parametros?.length) return <Note>Este serviço não possui parâmetros dimensionadores vinculados.</Note>
  return (
    <div className="card">
      <div className="card-pad"><div className="section-title">Parâmetros do serviço</div>
        <p className="muted" style={{ fontSize: 12.5, marginTop: -6 }}>Quando houver regra vinculada, alterar capacidade, leitos ou salas recalcula a equipe pela matriz e registra o histórico.</p>
      </div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Parâmetro</th><th>Unidade</th><th className="num" style={{ width: 160 }}>Valor</th><th style={{ width: 100 }}>Exigido</th></tr></thead>
          <tbody>
            {no.parametros.map((p) => (
              <tr key={p.id}>
                <td><b>{p.nome}</b></td>
                <td className="muted">{p.unidade}</td>
                <td className="num">
                  <input className="cell-input" defaultValue={p.valor ?? ''} type="number"
                    onBlur={(e) => { api.setParametro(planoId, no.id, p.id, e.target.value); refresh() }} />
                </td>
                <td>{p.obrigatorio ? <Badge cls={p.valor != null ? 'verde' : 'ambar'}>{p.valor != null ? 'OK' : 'Pendente'}</Badge> : <Badge>Opcional</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- aba Equipe / RH */
function TabEquipe({ no, planoId, calc, cebas, modelo, grupoEquipe, onClearGrupo, refresh, onMemo, onAdd, onAddGrupo, onRemoveGrupo, onRegra, onJustif }) {
  const [nonce, setNonce] = useState(0)
  const rdc = no.rdcId != null ? api.getRDC(no.rdcId) : null
  const conf = api.conformidadeRDC(planoId, no)
  const previstoMap = {}
  conf.previsto.forEach((p) => { previstoMap[p.perfilId] = p })
  const rascunho = rdc ? api.temRascunho(no) : false
  const itensVisiveis = grupoEquipe
    ? calc.itens.filter((item) => item.categoriaGeralId === grupoEquipe.id)
    : calc.itens
  const equipeVisivel = itensVisiveis.reduce((total, item) => total + item.quantidade, 0)
  const salarioVisivel = itensVisiveis.reduce((total, item) => total + item.salario_total_linha, 0)

  // Edição de quantitativo: desvios da norma ou do modelo de origem exigem justificativa.
  const editar = (it, raw) => {
    const novo = Math.max(0, Math.round(Number(raw) || 0))
    if (novo === it.quantidade) return
    const prev = previstoMap[it.perfil.id]
    const referencia = prev?.qtd ?? it.quantidade_referencia
    if (referencia == null) { api.setQuantidade(planoId, no.id, it.id, novo); refresh(); return }
    if (novo === referencia) { api.setQuantidade(planoId, no.id, it.id, novo); api.limparDesvio(planoId, no.id, it.perfil.id); refresh(); return }
    onJustif({
      perfil: it.perfil, previsto: referencia, novo, texto: prev?.texto || 'Quantidade registrada no cronograma de origem.',
      referenciaLabel: prev ? 'Norma prevê' : 'Modelo de origem',
      onConfirm: (motivo) => { api.setQuantidade(planoId, no.id, it.id, novo); api.registrarDesvio(planoId, no.id, it.perfil.id, { de: referencia, para: novo, motivo }); refresh() },
      onCancel: () => setNonce((n) => n + 1), // reverte o input
    })
  }
  const remover = (it) => {
    const prev = previstoMap[it.perfil.id]
    const referencia = prev?.qtd ?? it.quantidade_referencia
    if (referencia != null) {
      onJustif({
        perfil: it.perfil, previsto: referencia, novo: 0, texto: prev?.texto || 'Linha existente no cronograma de origem.',
        referenciaLabel: prev ? 'Norma prevê' : 'Modelo de origem',
        onConfirm: (motivo) => { api.removeProfissional(planoId, no.id, it.id); api.registrarDesvio(planoId, no.id, it.perfil.id, { de: referencia, para: 0, motivo, tipo: 'removido' }); refresh() },
        onCancel: () => {},
      })
    } else { api.removeProfissional(planoId, no.id, it.id); refresh() }
  }

  return (
    <>
      {grupoEquipe && (
        <div className="team-group-filter mb-2">
          <div>
            <span className="muted">Categoria geral</span>
            <b>{grupoEquipe.nome}</b>
          </div>
          <div className="flex" style={{ gap: 4 }}>
            <button className="btn sm ghost danger" title="Excluir categoria geral" onClick={() => { if (confirm(`Excluir a categoria geral "${grupoEquipe.nome}"? Os profissionais serão movidos para outra categoria.`)) onRemoveGrupo(grupoEquipe) }}>🗑</button>
            <button className="btn sm ghost" title="Mostrar equipe completa" aria-label="Mostrar equipe completa" onClick={onClearGrupo}>✕</button>
          </div>
        </div>
      )}
      {!grupoEquipe && (
        <div className="team-category-guide mb-2">
          <div><b>Categorias gerais do serviço</b><span>Selecione uma categoria na árvore para preencher seus profissionais.</span></div>
          <button className="btn sm primary" onClick={onAddGrupo}>＋ Nova categoria geral</button>
        </div>
      )}
      {rdc && (
        <div className="card card-pad mb-2" style={{ borderLeft: `3px solid ${conf.desvios.length ? 'var(--ambar-600, #b8860b)' : 'var(--verde-600, #2e7d32)'}` }}>
          <div className="spread">
            <div style={{ fontSize: 13 }}>
              <span className="muted">Referência normativa</span> <Badge cls="azul">{rdc.codigo}</Badge> <b>{rdc.nome}</b>
              {rdc.referencia && <span className="muted"> · {rdc.referencia}</span>}
            </div>
            {conf.desvios.length === 0
              ? <Badge cls="verde" dot>Conforme norma</Badge>
              : <Badge cls="ambar" dot>{conf.desvios.length} desvio(s) da norma</Badge>}
          </div>
          {conf.desvios.length > 0 && (
            <div className="mt-1" style={{ fontSize: 12.5 }}>
              {conf.desvios.map((d) => (
                <div key={d.perfilId} className="flex" style={{ gap: 6, padding: '3px 0', alignItems: 'flex-start' }}>
                  <span>{d.justificativa ? '📝' : '⚠️'}</span>
                  <span>
                    <b>{d.perfil?.label}</b>: norma prevê <b>{num(d.previsto)}</b>, definido <b>{num(d.atual)}</b>
                    {d.justificativa
                      ? <span className="muted"> — {d.justificativa}</span>
                      : <span style={{ color: 'var(--vermelho-600, #c0392b)' }}> — sem justificativa</span>}
                  </span>
                </div>
              ))}
            </div>
          )}
          {rascunho && <div className="mt-1" style={{ fontSize: 12.5, color: 'var(--ambar-600, #b35900)' }}>⚠️ Esta RDC tem parâmetros em <b>RASCUNHO</b> — valide antes do uso oficial.</div>}
        </div>
      )}

      <div className="card mb-2">
        <div className="table-wrap">
          <table className="tbl team-grid">
            <thead>
              <tr>
                <th>Categoria profissional</th>
                <th className="num">Carga horária</th>
                <th className="num">Quantitativo</th>
                <th className="num">Qtd. por turno 12h</th>
                <th className="num">Salário base</th>
                <th className="num">Insalubridade</th>
                <th className="num">Gratificação RT / chefia</th>
                <th className="num">Titulação</th>
                <th className="num">Adic. noturno</th>
                <th className="num">Remuneração bruta</th>
                <th className="num">Salário total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itensVisiveis.map((it) => {
                const prev = previstoMap[it.perfil.id]
                const referencia = prev?.qtd ?? it.quantidade_referencia
                const desvio = referencia != null && it.quantidade !== referencia
                const justif = (no.desvios || {})[it.perfil.id]?.motivo
                return (
                  <tr key={it.id}>
                    <td>
                      <b>{it.perfil.label}</b>
                    </td>
                    <td className="num">
                      {it.matrizRegraId
                        ? (
                          <select className="cell-input team-input" value={it.chs || 30} onChange={(e) => { api.setLancamentoEquipe(planoId, no.id, it.id, { chs: e.target.value }); refresh() }}>
                            <option value={30}>30h</option>
                            <option value={40}>40h</option>
                          </select>
                        )
                        : <input className="cell-input team-input" type="number" min="0" step="1" defaultValue={it.chs || 40} onBlur={(e) => { api.setLancamentoEquipe(planoId, no.id, it.id, { chs: e.target.value }); refresh() }} />}
                    </td>
                    <td className="num">
                      <input key={`${it.id}-${it.quantidade}-${nonce}`} className="cell-input team-input"
                        style={desvio ? { borderColor: justif ? 'var(--ambar-600, #b8860b)' : 'var(--vermelho-600, #c0392b)' } : null}
                        defaultValue={it.quantidade} type="number" step="1" min="0"
                        onBlur={(e) => editar(it, e.target.value)} />
                    </td>
                    <td className="num"><input className="cell-input team-input" type="number" min="0" step="1" defaultValue={it.quantidade_turno_12h || 0} onBlur={(e) => { api.setLancamentoEquipe(planoId, no.id, it.id, { quantidadeTurno: e.target.value }); refresh() }} /></td>
                    <td className="num tnum">{brl(it.base)}</td>
                    <td className="num tnum">{it.insalubridade ? brl(it.insalubridade) : '-'}</td>
                    <td className="num tnum">{it.gratificacao ? brl(it.gratificacao) : '-'}</td>
                    <td className="num tnum">{it.titulacao ? brl(it.titulacao) : '-'}</td>
                    <td className="num tnum">{it.adicional_noturno ? brl(it.adicional_noturno) : '-'}</td>
                    <td className="num tnum">{brl(it.remuneracao_bruta)}</td>
                    <td className="num tnum"><b>{brl(it.salario_total_linha)}</b></td>
                    <td>
                      <div className="flex" style={{ gap: 2 }}>
                        <button className="btn sm ghost" title="Memória de cálculo" onClick={() => onMemo({ tipo: 'item', it })}>🧮</button>
                        <button className="btn sm ghost danger" title="Remover" onClick={() => remover(it)}>✕</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {itensVisiveis.length === 0 && (
                <tr><td colSpan={12} className="muted" style={{ padding: 24, textAlign: 'center' }}>{grupoEquipe ? 'Nenhum profissional vinculado a esta categoria geral.' : 'Nenhum profissional. Aplique uma RDC/normativa, adicione manualmente ou use uma regra de quadro.'}</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--azul-050)', fontWeight: 700 }}>
                <td>{grupoEquipe ? 'Total da categoria geral' : 'Total da equipe'}</td>
                <td></td>
                <td className="num tnum">{num(equipeVisivel)}</td>
                <td colSpan={7}></td>
                <td className="num tnum">{brl(salarioVisivel)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div className="flex" style={{ gap: 10 }}>
        <button className="btn primary" disabled={!grupoEquipe} title={!grupoEquipe ? 'Selecione uma categoria geral' : ''} onClick={onAdd}>＋ Adicionar profissional</button>
        <button className="btn" onClick={onAddGrupo}>＋ Categoria geral</button>
        {rdc && <button className="btn" onClick={() => { api.aplicarRDC(planoId, no.id, rdc.id); refresh() }}>↺ Restaurar quadro normativo</button>}
        <button className="btn" onClick={onRegra}>⚙️ Aplicar regra de quadro</button>
        <button className="btn ghost" onClick={() => onMemo({ tipo: 'encargos', cebas, modelo })}>Ver encargos e benefícios</button>
      </div>
      <Note icon="💡"><b>Campos destacados</b> são preenchidos pela equipe. Salários e adicionais vêm da planilha de origem ou da tabela salarial do plano. QP normativo, origem, fonte e justificativas permanecem na memória de cálculo e no histórico.</Note>
    </>
  )
}

/* ----------------------------------------------------------- aba Custeio */
function TabCusteio({ no, planoId, calc, refresh, onAdd }) {
  if (!no.custeio?.length) return (
    <Note>Nenhum componente de custeio cadastrado para este serviço. <button className="btn sm primary" style={{ marginLeft: 8 }} onClick={onAdd}>＋ Adicionar custeio</button></Note>
  )
  return (
    <>
      <div className="card mb-2">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Componente</th><th>Tipo</th><th>Estratégia</th><th className="num">Valor mensal</th><th></th></tr></thead>
            <tbody>
              {no.custeio.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.nome}</b></td><td className="muted">{c.tipo_componente}</td><td className="muted">Fixo mensal</td>
                  <td className="num tnum">{brl(c.valor_mensal)}</td>
                  <td><button className="btn sm ghost danger" title="Remover" onClick={() => { api.removeCusteio(planoId, no.id, c.id); refresh() }}>✕</button></td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr style={{ background: 'var(--azul-050)', fontWeight: 700 }}><td colSpan={3}>Total de custeio</td><td className="num tnum">{brl(calc.custeio_total)}</td><td></td></tr></tfoot>
          </table>
        </div>
      </div>
      <button className="btn primary" onClick={onAdd}>＋ Adicionar custeio</button>
    </>
  )
}

function TabProducao({ no, planoId, refresh }) {
  const [nome, setNome] = useState('')
  const [meta, setMeta] = useState('')
  const [unidade, setUnidade] = useState('atendimentos/mês')
  const itens = no.producao || []
  const add = () => { if (!nome.trim() || !meta) return; api.addProducao(planoId, no.id, nome.trim(), meta, unidade); setNome(''); setMeta(''); refresh() }
  return (
    <>
      <div className="card mb-2">
        <div className="card-pad"><div className="section-title" style={{ margin: 0 }}>Metas físicas e produção</div>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>Consultas, procedimentos, exames, cirurgias, partos, diárias…</p>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Indicador</th><th className="num">Meta</th><th>Unidade</th><th></th></tr></thead>
            <tbody>
              {itens.map((p) => (
                <tr key={p.id}><td><b>{p.nome}</b></td><td className="num tnum">{num(p.meta)}</td><td className="muted">{p.unidade}</td>
                  <td><button className="btn sm ghost danger" title="Remover" onClick={() => { api.removeProducao(planoId, no.id, p.id); refresh() }}>✕</button></td></tr>
              ))}
              {itens.length === 0 && <tr><td colSpan={4} className="muted" style={{ padding: 20, textAlign: 'center' }}>Nenhuma meta cadastrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card card-pad">
        <div className="section-title">Adicionar indicador</div>
        <div className="flex wrap" style={{ gap: 10, alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: 2, marginBottom: 0 }}><label>Indicador</label><input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Consultas médicas" /></div>
          <div className="field" style={{ width: 120, marginBottom: 0 }}><label>Meta</label><input type="number" value={meta} onChange={(e) => setMeta(e.target.value)} /></div>
          <div className="field" style={{ width: 180, marginBottom: 0 }}><label>Unidade</label>
            <select value={unidade} onChange={(e) => setUnidade(e.target.value)}>
              <option>atendimentos/mês</option><option>consultas/mês</option><option>procedimentos/mês</option>
              <option>exames/mês</option><option>cirurgias/mês</option><option>partos/mês</option><option>diárias/mês</option>
            </select>
          </div>
          <button className="btn primary" onClick={add}>＋ Adicionar</button>
        </div>
      </div>
    </>
  )
}

function regraBadge(status) {
  const mapa = {
    calculavel: { label: 'Calculavel', cls: 'verde' },
    referencial: { label: 'Referencial', cls: 'azul' },
    revisar: { label: 'Revisar', cls: 'ambar' },
  }
  return mapa[status] || { label: status || 'Sem status', cls: 'cinza' }
}

function tipoRegra(regra) {
  return String(regra.tipoRegra || 'regra').replace(/_/g, ' ')
}

function TabRegras({ plano, no }) {
  const bases = api.getBasesPlano(plano)
  const regras = api.regrasAplicaveisAoSetor(no)
  const calculaveis = regras.filter((regra) => regra.status === 'calculavel')
  const complementares = regras.filter((regra) => regra.status !== 'calculavel')
  return (
    <>
      <div className="card card-pad mb-2">
        <div className="section-title">
          Base normativa do plano {bases.modo === 'composicao' && <Badge cls="roxo">Composição · {bases.conjuntos.length} normativas</Badge>}
        </div>
        {bases.modo === 'composicao' && <p className="muted" style={{ fontSize: 12.5, marginTop: -6, marginBottom: 10 }}>{bases.nome} — aplicadas em ordem de precedência:</p>}
        {bases.conjuntos.filter((item) => item.conjunto).map(({ ordem, conjunto }) => (
          <div key={conjunto.id} className="flex" style={{ padding: '6px 0', borderBottom: '1px dashed var(--cinza-borda)' }}>
            {bases.modo === 'composicao' && <span className="origem-tag">{ordem}º</span>}
            <Badge cls="azul">{conjunto.codigo}</Badge>
            <span>{conjunto.nome}</span>
            <span className="muted" style={{ marginLeft: 'auto' }}>{conjunto.orgao}</span>
          </div>
        ))}
      </div>
      <Note icon="📜">Regras calculaveis da matriz alimentam o motor de RH. Regras referenciais, checklists e itens em revisao aparecem como exigencias ou alertas, mas nao geram quantitativo sozinhos.</Note>
      <div className="grid cols-3 mb-2">
        <Mini t="Regras calculaveis" v={num(calculaveis.length, 0)} />
        <Mini t="Alertas e checklists" v={num(complementares.length, 0)} />
        <Mini t="Fonte canonica" v="Matriz v4" />
      </div>
      <div className="card mb-2">
        <div className="card-pad">
          <div className="section-title">Regras aplicáveis a este serviço</div>
          {!regras.length && <Note icon="⚠️">Nenhuma regra encontrada para este serviço. Revise o preenchimento manual antes do uso oficial.</Note>}
        </div>
        {regras.length > 0 && (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Regra</th><th>Status</th><th>Parametro</th><th>Formula / metodo</th><th>Fonte</th></tr></thead>
              <tbody>
                {regras.map((regra) => {
                  const st = regraBadge(regra.status)
                  return (
                    <tr key={regra.id}>
                      <td>
                        <b>{regra.titulo}</b>
                        <div className="muted" style={{ fontSize: 11.5 }}>{tipoRegra(regra)} · {regra.origem === 'matriz' ? 'motor normativo' : 'biblioteca complementar'}</div>
                      </td>
                      <td><Badge cls={st.cls} dot>{st.label}</Badge></td>
                      <td>{regra.parametroDimensionador || '-'}</td>
                      <td className="muted">{regra.formula || '-'}</td>
                      <td>
                        <b>{regra.fonte?.orgao || regra.fonteNormativaTexto || '-'}</b>
                        <div className="muted" style={{ fontSize: 11.5 }}>{regra.fonte?.arquivo || regra.fonte?.titulo || '-'}</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {complementares.length > 0 && (
        <div className="card card-pad">
          <div className="section-title">Exigencias, metodologias e pontos de revisao</div>
          {complementares.map((regra) => {
            const st = regraBadge(regra.status)
            return (
              <div key={regra.id} style={{ padding: '10px 0', borderBottom: '1px dashed var(--cinza-borda)' }}>
                <div className="spread">
                  <div><b>{regra.titulo}</b><div className="muted" style={{ fontSize: 12 }}>{regra.validadeTerritorial}</div></div>
                  <Badge cls={st.cls} dot>{st.label}</Badge>
                </div>
                {regra.checklist?.length > 0 && (
                  <div className="mt-1">
                    {regra.checklist.map((item) => <div key={item} className="muted" style={{ fontSize: 12.5 }}>- {item}</div>)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      <div className="card card-pad mt-2">
        <div className="section-title">Memoria do motor normativo</div>
        <Note icon="📜">A RDC/matriz vinculada ao serviço{no.rdcId != null ? <> (<b>{api.getRDC(no.rdcId)?.nome}</b>)</> : ''} continua sendo a referência que recalcula a equipe. Cada número gerado em Equipe / RH guarda memória de cálculo, fonte e validação territorial.</Note>
      </div>
    </>
  )
}

function TabHistorico({ plano, no }) {
  const eventos = [
    ...(no.historicoParametros || []).map((e) => ({
      q: e.quem || 'Usuário',
      a: `Alterou parâmetro "${e.parametro}": ${e.de ?? 'vazio'} → ${e.para ?? 'vazio'}`,
      d: e.quando,
      tag: 'matriz',
      obs: e.observacao,
    })),
    ...(no.justificativas || []).map((e) => ({
      q: e.quem || 'Usuário',
      a: e.tipo === 'setor_template_removido' ? 'Justificou remoção de setor do template' : `Justificou ajuste: ${e.tipo}`,
      d: e.quando,
      tag: 'manual',
      obs: e.motivo,
    })),
    ...(plano.justificativas || []).filter((e) => e.alvo?.noId == null && e.alvo?.setorSlug === no.matrizSetorSlug).map((e) => ({
      q: e.quem || 'Usuário',
      a: `Justificativa do plano: ${e.tipo}`,
      d: e.quando,
      tag: 'manual',
      obs: e.motivo,
    })),
  ].sort((a, b) => String(b.d).localeCompare(String(a.d)))

  if (!eventos.length) return <Note>Nenhum evento registrado para este serviço ainda.</Note>
  return (
    <div className="card">
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Observação</th><th>Origem</th></tr></thead>
          <tbody>{eventos.map((e, i) => <tr key={i}><td className="muted">{e.d ? new Date(e.d).toLocaleString('pt-BR') : '—'}</td><td>{e.q}</td><td>{e.a}</td><td className="muted">{e.obs || '—'}</td><td><OrigemTag origem={e.tag} /></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------- modal de RDC / normativa */
function RDCModal({ no, planoId, onClose, onApply }) {
  const compativeis = api.modelosParaSetor(no.tipoSetor).slice().sort((a, b) => (a.relevancia || 9) - (b.relevancia || 9))
  const [sel, setSel] = useState(no.rdcId || compativeis[0]?.id)
  return (
    <Modal title="Aplicar RDC / normativa" icon="📜" onClose={onClose} lg
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn primary" disabled={!sel} onClick={() => { api.aplicarRDC(planoId, no.id, sel); onApply() }}>Aplicar RDC</button>
      </>}>
      <p className="muted" style={{ marginTop: -6, marginBottom: 14 }}>A RDC carrega parâmetros e o <b>quadro preconizado</b> para este serviço. Você pode ajustar depois; qualquer desvio exigirá justificativa.</p>
      {compativeis.length === 0 && <Note icon="⚠️">Nenhuma RDC compatível cadastrada. Consulte Cadastros › Normativas / RDCs.</Note>}
      {compativeis.map((p) => (
        <div key={p.id} className={`preset-opt ${sel === p.id ? 'sel' : ''}`} onClick={() => setSel(p.id)}>
          <div className="p-ico">{p.icone}</div>
          <div style={{ flex: 1 }}>
            <div className="spread"><h4>{p.nome}</h4><div className="flex" style={{ gap: 4 }}><Badge cls="azul">{p.codigo}</Badge><Badge cls="cinza">{p.tipo}</Badge></div></div>
            <p>{p.descricao}</p>
            <p style={{ marginTop: 4 }}><span className="muted">Órgão: </span>{p.orgao} · <span className="muted">relevância {p.relevancia || '—'} · {p.quadro.length} perfis · {p.parametros.length} parâmetros</span></p>
          </div>
        </div>
      ))}
    </Modal>
  )
}

/* ----------------------------------------------------------- modal de memória de cálculo */
function MemoModal({ data, onClose }) {
  if (data.tipo === 'encargos' && data.modelo === 'subhue') {
    const ms = api.configGlobal.modeloSubhue
    return (
      <Modal title="Encargos e benefícios — Motor SUBHUE" icon="🧮" onClose={onClose} lg>
        <div className="spread mb-2">
          <div className="section-title" style={{ margin: 0 }}>Alíquota única — {pct(ms.aliquotaEncargos * 100)} sobre o salário total</div>
          <Badge cls="roxo" dot>Motor SUBHUE</Badge>
        </div>
        {ms.breakdown.map((g, i) => (
          <div key={i} className="memo-line"><span className="k">{g.nome}</span><span className="v">{pct(g.pct)}</span></div>
        ))}
        <div className="memo-line" style={{ fontWeight: 700, borderTop: '1px solid var(--cinza-borda)' }}><span className="k">Total de encargos</span><span className="v">{pct(ms.aliquotaEncargos * 100)}</span></div>
        <div className="divider" />
        <div className="section-title">Benefício (por funcionário/mês)</div>
        <div className="memo-line"><span className="k">Benefício consolidado (VT/VR)</span><span className="v">{brl(ms.beneficioFunc)}</span></div>
        <Note icon="🐍">Espelha o script Python: <code>encargos = salário_total × {pct(ms.aliquotaEncargos * 100)}</code> e <code>benefícios = nº_funcionários × {brl(ms.beneficioFunc)}</code>. O adicional noturno (20% do base) já está embutido no salário dos perfis noturnos.</Note>
      </Modal>
    )
  }
  if (data.tipo === 'encargos') {
    const cebas = !!data.cebas
    const pctEfetivo = api.encargosPercentual(cebas) * 100
    return (
      <Modal title="Encargos e benefícios" icon="🧮" onClose={onClose} lg>
        <div className="spread mb-2">
          <div className="section-title" style={{ margin: 0 }}>Encargos por grupo — {pct(pctEfetivo)} sobre o salário total</div>
          <Badge cls={cebas ? 'verde' : 'cinza'} dot>{cebas ? 'Com CEBAS' : 'Sem CEBAS'}</Badge>
        </div>
        {api.encargosGrupos.map((g, i) => {
          const isento = cebas && g.cebasIsenta
          return (
            <div key={i} className="memo-line" style={isento ? { opacity: .5 } : null}>
              <span className="k"><span className="origem-tag" style={{ marginRight: 6 }}>{g.grupo}</span>{g.nome}{isento && ' — isento (CEBAS)'}</span>
              <span className="v">{isento ? '0,00%' : pct(g.pct)}</span>
            </div>
          )
        })}
        <div className="divider" />
        <div className="section-title">Benefícios (por profissional/mês)</div>
        <div className="memo-line"><span className="k">Vale-transporte</span><span className="v">{brl(api.configGlobal.beneficios.vale_transporte)}</span></div>
        <div className="memo-line"><span className="k">Vale-refeição / alimentação</span><span className="v">{brl(api.configGlobal.beneficios.vale_refeicao)}</span></div>
        {cebas && <Note icon="🏛️">Com CEBAS, o Grupo A (INSS patronal e terceiros) e os encargos patronais ficam isentos.</Note>}
      </Modal>
    )
  }
  const it = data.it
  return (
    <Modal title="Memória de cálculo" icon="🧮" onClose={onClose}>
      <div className="mb-2"><b>{it.perfil.label}</b> · quantitativo {num(it.quantidade)} · origem <OrigemTag origem={it.origem} /> · <Badge cls={it.cebas ? 'verde' : 'cinza'}>{it.cebas ? 'Com CEBAS' : 'Sem CEBAS'}</Badge></div>
      <div className="memo-formula">{`salário_total = base + insalubridade + gratificação + titulação + ad. noturno
             = ${fmt(it.base)} + ${fmt(it.insalubridade)} + ${fmt(it.gratificacao || 0)} + ${fmt(it.titulacao)} + ${fmt(it.adicional_noturno)}
             = ${fmt(it.salario_total)}

encargos     = salário_total × ${pct(it.encargos_pct * 100)}   = ${fmt(it.encargos)}
benefícios   = VT + VR                  = ${fmt(it.beneficios)}

custo_unit.  = salário_total + encargos + benefícios
             = ${fmt(it.custo_unitario)}

custo_total  = custo_unit. × ${num(it.quantidade)}  = ${fmt(it.custo_total)}`}</div>
      <div className="mt-2">
        {it.memoriaCalculo && (
          <>
            <div className="section-title">Memória normativa</div>
            <div className="memo-line"><span className="k">Fórmula</span><span className="v">{it.memoriaCalculo.formula}</span></div>
            <div className="memo-line"><span className="k">Quantidade normativa</span><span className="v">{num(it.quantidade_normativa ?? it.memoriaCalculo.quantidadeNormativa)}</span></div>
            <div className="memo-line"><span className="k">Quantidade escolhida</span><span className="v">{num(it.memoriaCalculo.quantidadeEscolhida ?? it.quantidade)}</span></div>
            <div className="memo-line"><span className="k">QP 40h / QP 30h</span><span className="v">{num(it.qp40 ?? 0)} / {num(it.qp30 ?? 0)}</span></div>
            <div className="memo-line"><span className="k">Fonte</span><span className="v">{it.memoriaCalculo.fonte || 'Matriz técnica v4'}</span></div>
            {it.memoriaCalculo.observacaoTerritorial && <div className="memo-line"><span className="k">Validação Rio</span><span className="v">{it.memoriaCalculo.observacaoTerritorial}</span></div>}
            {it.memoriaCalculo.url && <div className="memo-line"><span className="k">URL</span><span className="v"><a href={it.memoriaCalculo.url} target="_blank" rel="noreferrer">{it.memoriaCalculo.url}</a></span></div>}
            <div className="divider" />
          </>
        )}
        <div className="memo-line"><span className="k">Salário total</span><span className="v">{brl(it.salario_total)}</span></div>
        {it.referenciaSalarial && (
          <>
            <div className="memo-line"><span className="k">Categoria salarial</span><span className="v">{it.referenciaSalarial.categoria}</span></div>
            <div className="memo-line"><span className="k">CH referência salarial</span><span className="v">{num(it.referenciaSalarial.chReferencia, 0)}h</span></div>
            <div className="memo-line"><span className="k">Fonte salarial</span><span className="v">{it.referenciaSalarial.fonte}</span></div>
          </>
        )}
        <div className="memo-line"><span className="k">Encargos (unit.)</span><span className="v">{brl(it.encargos)}</span></div>
        <div className="memo-line"><span className="k">Benefícios (unit.)</span><span className="v">{brl(it.beneficios)}</span></div>
        <div className="memo-line"><span className="k">Custo unitário</span><span className="v">{brl(it.custo_unitario)}</span></div>
        <div className="memo-line"><span className="k"><b>Custo total ({num(it.quantidade)} prof.)</b></span><span className="v">{brl(it.custo_total)}</span></div>
      </div>
      {it.origemFinanceira === 'planilha_sem_valor'
        ? <Note icon="⚠️">A planilha de origem não informa remuneração para esta linha. Revise a categoria salarial antes do uso oficial.</Note>
        : it.salarioProvisorio
          ? <Note icon="📜">Correspondência salarial aproximada: a função normativa não encontrou categoria exata na base e usou a referência mais próxima para não travar o cronograma.</Note>
          : it.origemFinanceira === 'planilha'
            ? <Note icon="📜">Fonte salarial: planilha de origem. Encargos e benefícios são calculados pelo aplicativo.</Note>
            : <Note icon="📜">Fonte salarial: Base Salarial RH.xlsx. A categoria profissional é única para todos os serviços; a referência assistencial aparece apenas na memória normativa.</Note>}
    </Modal>
  )
}

const fmt = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

/* ----------------------------------------------------------- modal: adicionar serviço */
function AddNodeModal({ planoId, onClose, onCreate }) {
  const catalogo = api.listServicosCronograma()
  const [catalogoKey, setCatalogoKey] = useState(catalogo[0]?.key || 'personalizada')
  const inicial = catalogo[0]
  const [nome, setNome] = useState(inicial?.nome || '')
  const [categorias, setCategorias] = useState(() => inicial?.categoriasSugeridas?.length
    ? inicial.categoriasSugeridas.map((grupo, index) => ({ ...grupo, ativo: index === 0 }))
    : [{ id: 'categoria-equipe-geral', nome: 'Equipe do serviço', ativo: true }])
  const [novaCategoria, setNovaCategoria] = useState('')
  const selecionada = catalogo.find((item) => item.key === catalogoKey)
  const preview = api.previewServicoCronograma({
    key: catalogoKey,
    nome,
    nomeServico: selecionada?.nomeServico,
    matrizSetorSlug: selecionada?.matrizSetorSlug,
    categoriasGerais: categorias,
  })
  const trocar = (key) => {
    setCatalogoKey(key)
    const item = catalogo.find((registro) => registro.key === key)
    if (!item) { setNome(''); setCategorias([]); return }
    setNome(item.nome)
    setCategorias(item.categoriasSugeridas?.length
      ? item.categoriasSugeridas.map((grupo, index) => ({ ...grupo, ativo: index === 0 }))
      : [{ id: `categoria-${item.key.replace(/[^a-z0-9]+/gi, '-')}`, nome: 'Equipe do serviço', ativo: true }])
  }
  const adicionarCategoria = () => {
    const valor = novaCategoria.trim()
    if (!valor) return
    setCategorias((atuais) => [...atuais, { id: `categoria-manual-${atuais.length + 1}-${Date.now()}`, nome: valor, ativo: true }])
    setNovaCategoria('')
  }
  const criar = () => onCreate(api.addServicoPlano(planoId, {
    key: catalogoKey,
    nome: nome.trim(),
    nomeServico: selecionada?.nomeServico,
    matrizSetorSlug: selecionada?.matrizSetorSlug,
    categoriasGerais: categorias.filter((grupo) => grupo.ativo !== false),
  }))

  return (
    <Modal title="Adicionar serviço" icon="📑" onClose={onClose} lg
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn primary" disabled={!nome.trim() || !categorias.some((grupo) => grupo.ativo !== false)} onClick={criar}>Criar serviço</button>
      </>}>
      <div className="field">
        <label>Serviço / aba do cronograma</label>
        <select value={catalogoKey} onChange={(e) => trocar(e.target.value)}>
          {catalogo.map((item) => <option key={item.key} value={item.key}>{item.nome} · {item.tipo}</option>)}
          <option value="personalizada">Outro serviço</option>
        </select>
      </div>
      <div className="field">
        <label>Nome exibido no cronograma</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: B2 - Serviço de Anestesiologia" />
      </div>
      <div className="field">
        <label>Categorias gerais</label>
        <div className="general-category-options bordered">
          {categorias.map((grupo) => (
            <label key={grupo.id} className="general-category-option">
              <input type="checkbox" checked={grupo.ativo !== false} onChange={(e) => setCategorias((atuais) => atuais.map((item) => item.id === grupo.id ? { ...item, ativo: e.target.checked } : item))} />
              <span>{grupo.nome}</span>
            </label>
          ))}
        </div>
        <div className="specialty-add-category">
          <input value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarCategoria() } }} placeholder="Adicionar outra categoria geral" />
          <button className="btn sm" disabled={!novaCategoria.trim()} onClick={adicionarCategoria}>Adicionar</button>
        </div>
      </div>
      <Note icon={preview.matrizSetorSlug ? '📜' : '✍️'}>
        {preview.matrizSetorSlug
          ? <>Referência encontrada: <b>{preview.referenciaNormativa}</b>. Parâmetros e equipe normativa serão carregados automaticamente.</>
          : 'Sem correspondência automática na matriz. O serviço será criado para preenchimento manual das categorias e profissionais.'}
      </Note>
    </Modal>
  )
}

function LegacyAddNodeModal({ planoId, selId, onClose, onCreate }) {
  const nos = api.listNos(planoId)
  const selNode = nos.find((n) => n.id === selId)
  // pai padrão: o nó estrutural selecionado, ou o pai do escopo selecionado, ou raiz
  const paiDefault = selNode ? (selNode.escopo ? selNode.paiId : selNode.id) : null
  const tiposDisponiveis = api.tiposSetor
    .filter((tipo) => tipo.ativo !== false)
    .slice()
    .sort((a, b) =>
      Number(a.usoMotor === false || a.calculavel === false) - Number(b.usoMotor === false || b.calculavel === false) ||
      String(a.nome).localeCompare(String(b.nome), 'pt-BR')
    )
  const tipo0 = tiposDisponiveis[0]?.id
  const tipo0Obj = tiposDisponiveis.find((tipo) => Number(tipo.id) === Number(tipo0))
  const rdc0 = tipo0Obj && tipo0Obj.usoMotor !== false && tipo0Obj.calculavel !== false
    ? api.modelosParaSetor(tipo0).sort((a, b) => (a.relevancia || 9) - (b.relevancia || 9))[0]?.id || ''
    : ''
  const [nome, setNome] = useState('')
  const [calculavel, setCalculavel] = useState(true)
  const [tipoSetorId, setTipoSetorId] = useState(tipo0)
  const [especialidadeId, setEspecialidadeId] = useState('')
  const [rdcId, setRdcId] = useState(rdc0)
  const [paiId, setPaiId] = useState(paiDefault ?? '')
  const [descricao, setDescricao] = useState('')
  const sugestaoTexto = descricao.trim() ? api.sugerirCriacaoPorTexto(descricao) : null

  // RDCs compatíveis com o tipo de setor escolhido (ordenadas por relevância).
  const tipoSelecionado = tiposDisponiveis.find((tipo) => Number(tipo.id) === Number(tipoSetorId))
  const tipoTemMotor = tipoSelecionado && tipoSelecionado.usoMotor !== false && tipoSelecionado.calculavel !== false
  const rdcs = tipoTemMotor
    ? api.modelosParaSetor(tipoSetorId).slice().sort((a, b) => (a.relevancia || 9) - (b.relevancia || 9))
    : []
  const trocarTipo = (id) => {
    setTipoSetorId(id)
    const tipo = tiposDisponiveis.find((item) => Number(item.id) === Number(id))
    const recomendada = tipo && tipo.usoMotor !== false && tipo.calculavel !== false
      ? api.modelosParaSetor(id).sort((a, b) => (a.relevancia || 9) - (b.relevancia || 9))[0]
      : null
    setRdcId(recomendada?.id || '')
    if (recomendada?.especialidadeId) setEspecialidadeId(String(recomendada.especialidadeId))
  }
  const rdcSel = rdcId ? api.getRDC(rdcId) : null

  const criar = () => {
    if (descricao.trim() && sugestaoTexto?.setorSlug) {
      return onCreate(api.addNoPorTexto(planoId, descricao.trim(), {
        nome: nome.trim() || sugestaoTexto.setor?.setor,
        paiId: paiId === '' ? null : Number(paiId),
      }))
    }
    return onCreate(api.addNo(planoId, {
      nome: nome.trim(),
      paiId: paiId === '' ? null : Number(paiId),
      tipoSetorId: calculavel ? Number(tipoSetorId) : null,
      calculavel,
      rdcId: calculavel && rdcId ? Number(rdcId) : null,
      especialidadeId: especialidadeId === '' ? null : Number(especialidadeId),
    }))
  }

  return (
    <Modal title="Adicionar setor / serviço" icon="🏗️" onClose={onClose} lg
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn primary" disabled={!nome.trim() && !sugestaoTexto?.setorSlug} onClick={criar}>Criar setor</button>
      </>}>
      <div className="field">
        <label>Descrever setor / hospital</label>
        <input value={descricao} onChange={(e) => {
          const valor = e.target.value
          setDescricao(valor)
          const sugestao = api.sugerirCriacaoPorTexto(valor)
          if (sugestao?.setor?.setor && !nome.trim()) setNome(sugestao.setor.setor)
        }} placeholder="Ex.: UTI Adulto 20 leitos, centro cirúrgico 6 salas..." />
        <div className="hint">A descrição sugere setor, parâmetros e equipe pela matriz técnica v4 validada para Rio.</div>
      </div>
      {sugestaoTexto && (
        <div className="card card-pad mb-2" style={{ boxShadow: 'none', border: '1px solid var(--azul-200, #bfdbfe)' }}>
          <div className="spread">
            <div>
              <div className="muted" style={{ fontSize: 12 }}>Sugestão pela matriz técnica v4</div>
              <b>{sugestaoTexto.setor?.setor || 'Setor não encontrado'}</b>
            </div>
            <Badge cls={sugestaoTexto.regras.length ? 'verde' : 'ambar'}>{sugestaoTexto.regras.length} regra(s)</Badge>
          </div>
          <div className="memo-line"><span className="k">Entrada detectada</span><span className="v">{sugestaoTexto.quantidade} {sugestaoTexto.unidade}</span></div>
          <div className="memo-line"><span className="k">Fontes</span><span className="v">{sugestaoTexto.fontes.slice(0, 3).join(' · ') || 'Sem fonte vinculada'}</span></div>
          {sugestaoTexto.aviso && <Note icon="⚠️">{sugestaoTexto.aviso}</Note>}
        </div>
      )}
      <div className="field">
        <label>Nome do setor / serviço</label>
        <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: UTI Adulto, Sala Vermelha, Leitos de Observação…" />
      </div>
      <div className="form-row">
        <div className="field">
          <label>Tipo de nó</label>
          <div className="pill-toggle">
            <button className={calculavel ? 'active' : ''} onClick={() => setCalculavel(true)}>Calculável (recebe equipe)</button>
            <button className={!calculavel ? 'active' : ''} onClick={() => setCalculavel(false)}>Agrupador</button>
          </div>
          <div className="hint">Calculável recebe parâmetros, equipe e custos. Agrupador só organiza a árvore.</div>
        </div>
        <div className="field">
          <label>Dentro de</label>
          <select value={paiId} onChange={(e) => setPaiId(e.target.value)}>
            <option value="">Raiz da unidade (topo)</option>
            {nos.filter((n) => !n.escopo).map((n) => <option key={n.id} value={n.id}>{n.nome}</option>)}
          </select>
        </div>
      </div>
      {calculavel && (
        <>
          <div className="form-row">
            <div className="field">
              <label>Tipo de setor</label>
              <select value={tipoSetorId} onChange={(e) => trocarTipo(Number(e.target.value))}>
                {tiposDisponiveis.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome} {t.usoMotor === false || t.calculavel === false ? '— macroárea / sem motor direto' : '— dimensionador'}
                  </option>
                ))}
              </select>
              <div className="hint">
                {tipoTemMotor
                  ? 'Tipo com motor: pode carregar parâmetros, normativa e equipe automaticamente.'
                  : 'Tipo cadastrado como macroárea: pode organizar ou receber equipe manual, mas não sugere RDC automaticamente.'}
              </div>
            </div>
            <div className="field">
              <label>Especialidade</label>
              <select value={especialidadeId} onChange={(e) => setEspecialidadeId(e.target.value)}>
                <option value="">— (sem especialidade)</option>
                {api.especialidades.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>RDC / normativa do setor</label>
            <select value={rdcId} onChange={(e) => setRdcId(e.target.value)}>
              <option value="">Nenhuma (criar em branco)</option>
              {rdcs.map((r) => <option key={r.id} value={r.id}>{r.codigo} — {r.nome} (relevância {r.relevancia || '—'})</option>)}
            </select>
            <div className="hint">
              {rdcSel
                ? <>O setor já nasce com os parâmetros e o quadro preconizado por <b>{rdcSel.codigo}</b>. {rdcSel.referencia}</>
                : 'Sem RDC, o setor entra vazio (você pode aplicar uma RDC depois).'}
            </div>
          </div>
        </>
      )}
      <Note icon="💡">
        {tipoTemMotor
          ? 'Ao criar, o setor carrega a RDC selecionada quando houver uma normativa compatível. Qualquer alteração que fuja da norma pedirá justificativa.'
          : 'Tipos sem motor direto entram como estrutura operacional: você pode organizar o cronograma e adicionar equipe manualmente com justificativa quando necessário.'}
      </Note>
    </Modal>
  )
}

function AddGrupoModal({ onClose, onAdd }) {
  const [nome, setNome] = useState('')
  return (
    <Modal title="Adicionar categoria geral" icon="📂" onClose={onClose}
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn primary" disabled={!nome.trim()} onClick={() => onAdd(nome.trim())}>Adicionar categoria</button>
      </>}>
      <div className="field">
        <label>Nome da categoria geral</label>
        <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && nome.trim()) onAdd(nome.trim()) }} placeholder="Ex.: Equipe multidisciplinar, Apoio à gestão hospitalar" />
        <div className="hint">Os profissionais adicionados nesta categoria ficarão agrupados como nas abas da planilha.</div>
      </div>
    </Modal>
  )
}

/* ----------------------------------------------------------- modal: adicionar profissional */
function AddProfModal({ onClose, onAdd }) {
  const [perfilId, setPerfilId] = useState(api.perfis[0]?.id)
  const [qtd, setQtd] = useState(1)
  const [chs, setChs] = useState(40)
  const [quantidadeTurno, setQuantidadeTurno] = useState(1)
  const c = api.calcPerfil(Number(perfilId))
  return (
    <Modal title="Adicionar profissional" icon="🧑‍⚕️" onClose={onClose}
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn primary" disabled={!qtd} onClick={() => onAdd({ perfilId: Number(perfilId), qtd: Number(qtd), chs: Number(chs), quantidadeTurno: Number(quantidadeTurno) })}>Adicionar</button>
      </>}>
      <div className="field">
        <label>Perfil de alocação</label>
        <select value={perfilId} onChange={(e) => setPerfilId(e.target.value)}>
          {api.perfis.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <div className="hint">Categoria + regime + turno. Cadastre novos perfis em Cadastros › Perfis de alocação.</div>
      </div>
      <div className="form-row three">
        <div className="field">
          <label>Carga horária</label>
          <input type="number" step="1" min="0" value={chs} onChange={(e) => setChs(e.target.value)} />
        </div>
        <div className="field">
          <label>Quantitativo</label>
          <input type="number" step="1" min="0" value={qtd} onChange={(e) => setQtd(e.target.value)} />
        </div>
        <div className="field">
          <label>Qtd. por turno 12h</label>
          <input type="number" step="1" min="0" value={quantidadeTurno} onChange={(e) => setQuantidadeTurno(e.target.value)} />
        </div>
      </div>
      <div className="memo-line"><span className="k">Remuneração bruta (unit.)</span><span className="v">{brl(c.salario_total)}</span></div>
      <div className="memo-line"><span className="k">Salário total da linha</span><span className="v">{brl(c.salario_total * (Number(qtd) || 0))}</span></div>
      <div className="memo-line"><span className="k">Custo total (unit. c/ encargos+benef.)</span><span className="v">{brl(c.custo_unitario)}</span></div>
      <div className="memo-line"><span className="k"><b>Custo do item ({num(qtd)} prof.)</b></span><span className="v">{brl(c.custo_unitario * (Number(qtd) || 0))}</span></div>
    </Modal>
  )
}

/* ----------------------------------------------------------- modal: aplicar regra de quadro */
function RegraQuadroModal({ planoId, no, onClose, onApply }) {
  const sugestoes = api.sugestoesQuadro(planoId, no.id)
  const [sel, setSel] = useState(() => Object.fromEntries(sugestoes.map((_, i) => [i, true])))
  const escolhidas = sugestoes.filter((_, i) => sel[i])
  const totalQtd = escolhidas.reduce((a, s) => a + s.qtd, 0)

  return (
    <Modal title="Aplicar regra de quadro" icon="⚙️" onClose={onClose} lg
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn primary" disabled={!escolhidas.length} onClick={() => onApply(escolhidas)}>Aplicar {escolhidas.length} regra(s)</button>
      </>}>
      <p className="muted" style={{ marginTop: -6, marginBottom: 12 }}>
        O motor dimensiona a equipe a partir dos parâmetros do setor (leitos) e das regras das normativas. Revise antes de materializar.
      </p>
      {sugestoes.length === 0 && <Note icon="⚠️">Nenhuma sugestão. Preencha os parâmetros (ex.: leitos operacionais) na aba Parâmetros para o motor dimensionar.</Note>}
      {sugestoes.map((s, i) => (
        <label key={i} className="preset-opt" style={{ alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={!!sel[i]} onChange={(e) => setSel((m) => ({ ...m, [i]: e.target.checked }))} style={{ width: 'auto' }} />
          <div style={{ flex: 1 }}>
            <div className="spread"><h4>{s.perfil.label}</h4><Badge cls="azul">{s.regra.normativa}</Badge></div>
            <p>{s.regra.nome} · estratégia <b>{s.regra.estrategia.replace(/_/g, ' ')}</b></p>
          </div>
          <div className="right"><div style={{ fontSize: 18, fontWeight: 750 }}>{num(s.qtd)}</div><div className="muted" style={{ fontSize: 11 }}>profissionais</div></div>
        </label>
      ))}
      {sugestoes.length > 0 && <div className="memo-line mt-2"><span className="k">Total a materializar</span><span className="v">{num(totalQtd)} profissionais · origem <OrigemTag origem="regra" /></span></div>}
    </Modal>
  )
}

/* ----------------------------------------------------------- modal: renomear */
function RenomearModal({ nome, onClose, onSave }) {
  const [v, setV] = useState(nome)
  return (
    <Modal title="Renomear" icon="✏️" onClose={onClose}
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn primary" disabled={!v.trim()} onClick={() => onSave(v.trim())}>Salvar</button>
      </>}>
      <div className="field"><label>Nome</label><input autoFocus value={v} onChange={(e) => setV(e.target.value)} /></div>
    </Modal>
  )
}

/* ----------------------------------------------------------- modal: adicionar custeio */
function AddCusteioModal({ onClose, onAdd }) {
  const [nome, setNome] = useState('')
  const [valor, setValor] = useState('')
  return (
    <Modal title="Adicionar custeio" icon="🧾" onClose={onClose}
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn primary" disabled={!nome.trim() || !valor} onClick={() => onAdd(nome.trim(), valor)}>Adicionar</button>
      </>}>
      <div className="field">
        <label>Componente de custeio</label>
        <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Medicamentos, Gases medicinais, Telefonia…" />
      </div>
      <div className="field" style={{ maxWidth: 220 }}>
        <label>Valor mensal (R$)</label>
        <input type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
      </div>
    </Modal>
  )
}
