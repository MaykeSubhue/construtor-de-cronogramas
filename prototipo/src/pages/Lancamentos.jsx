import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '../mock/api.js'
import { brl, brlc, num, pct } from '../lib/format.js'
import { Badge, Empty, Modal, Note } from '../components/ui.jsx'

const CHS_OPCOES = [12, 18, 24, 30, 36, 40]

function asNumber(value) {
  const normalized = String(value ?? '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : 0
}

export default function Lancamentos() {
  const { id } = useParams()
  const planoId = Number(id)
  const [cebas, setCebas] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [versao, setVersao] = useState(0)
  const [justificativa, setJustificativa] = useState(null)
  const [memoria, setMemoria] = useState(null)
  const [addOpen, setAddOpen] = useState(false)

  const refresh = () => setVersao((n) => n + 1)
  const lancamentos = api.getLancamentosPlano(planoId, { cebas })
  const reducao = api.getReducaoCebas(planoId)
  const plano = lancamentos.plano
  const setores = lancamentos.setores
  const selected = useMemo(
    () => setores.find((setor) => setor.noId === selectedId) || setores[0],
    [setores, selectedId, versao],
  )

  if (!plano) {
    return (
      <div style={{ padding: 28 }}>
        <Empty icon="!">
          <h3>Plano nao encontrado</h3>
          <p className="muted">Volte para a lista de planos ou crie um novo cronograma.</p>
          <div className="actions mt-2" style={{ justifyContent: 'center' }}>
            <Link className="btn primary" to="/novo">Criar novo cronograma</Link>
            <Link className="btn" to="/planos">Ver planos</Link>
          </div>
        </Empty>
      </div>
    )
  }

  const salvarParametro = (chave, valor, divisor = 1) => {
    api.setParametroCronograma(planoId, chave, asNumber(valor) / divisor)
    refresh()
  }

  const salvarLinha = (linha, campo, valor) => {
    const payload = campo === 'quantidade'
      ? { quantidade: asNumber(valor) }
      : campo === 'chs'
        ? { chs: asNumber(valor) }
        : { quantidadeTurno: asNumber(valor) }
    const tentativa = api.setLancamentoEquipe(planoId, linha.noId, linha.id, payload)
    if (tentativa?.requiresJustification) {
      setJustificativa({ tipo: 'quantidade', linha, valor: payload.quantidade, normativa: tentativa.normativa })
      return
    }
    refresh()
  }

  const removerLinha = (linha) => {
    const tentativa = api.removeLancamentoEquipe(planoId, linha.noId, linha.id)
    if (tentativa?.requiresJustification) {
      setJustificativa({ tipo: 'remover', linha, valor: 0, normativa: linha.quantidadeNormativa })
      return
    }
    refresh()
  }

  return (
    <div className="lanc-page">
      <div className="page-head lanc-head">
        <div>
          <Link to={`/plano/${planoId}/construcao`} className="muted" style={{ fontSize: 12.5 }}>← {plano.nome}</Link>
          <h1 style={{ marginTop: 4 }}>Lancamentos de equipe e custos</h1>
          <div className="sub">
            Abas dinamicas no formato HMLJ. Edite apenas os campos claros; formulas recalculam o cronograma final.
          </div>
        </div>
        <div className="actions">
          <div title="Cenario tributario usado nesta conferencia">
            <div className="muted" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 3 }}>Cenario</div>
            <div className="pill-toggle">
              <button className={!cebas ? 'active' : ''} onClick={() => setCebas(false)}>Sem CEBAS</button>
              <button className={cebas ? 'active' : ''} onClick={() => setCebas(true)}>Com CEBAS</button>
            </div>
          </div>
          <Link className="btn" to={`/plano/${planoId}/construcao`}>Construcao</Link>
          <Link className="btn primary" to={`/plano/${planoId}/cronograma${cebas ? '?cebas=1' : ''}`}>Cronograma final</Link>
        </div>
      </div>

      <div className="grid cols-4 mb-2 lanc-kpis">
        <div className="card kpi"><span className="l">Equipe total</span><span className="v">{num(lancamentos.totais.quantidade, 0)}</span></div>
        <div className="card kpi"><span className="l">RH mensal</span><span className="v">{brl(lancamentos.totais.totalMensal)}</span></div>
        <div className="card kpi"><span className="l">Reducao CEBAS contrato</span><span className="v">{brl(reducao.total.diferenca)}</span></div>
        <div className="card kpi"><span className="l">Setores lancados</span><span className="v">{setores.length}</span></div>
      </div>

      <div className="lanc-layout">
        <aside className="lanc-tabs">
          <div className="lanc-tabs-head">
            <b>Abas de entrada</b>
            <span>{setores.length} setores</span>
          </div>
          {setores.map((setor, idx) => (
            <button
              key={setor.noId}
              className={selected?.noId === setor.noId ? 'active' : ''}
              onClick={() => setSelectedId(setor.noId)}
            >
              <span>B{idx + 1}</span>
              <strong>{setor.nome}</strong>
              <small>{brl(setor.totais.totalMensal)} / mes</small>
            </button>
          ))}
        </aside>

        <main className="lanc-main">
          <div className="card card-pad lanc-parametros">
            <div>
              <h3>Base de ajuste automatico</h3>
              <p className="muted">Parametros espelham a planilha e podem ser ajustados por plano.</p>
            </div>
            <Param label="Custeio %" value={lancamentos.parametros.custeioOperacionalPct * 100} suffix="%" onSave={(v) => salvarParametro('custeioOperacionalPct', v, 100)} />
            <Param label="RUE-OSC %" value={lancamentos.parametros.apoioRuePct * 100} suffix="%" onSave={(v) => salvarParametro('apoioRuePct', v, 100)} />
            <Param label="CGE %" value={lancamentos.parametros.apoioCgePct * 100} suffix="%" onSave={(v) => salvarParametro('apoioCgePct', v, 100)} />
            <Param label="VT dia" value={lancamentos.parametros.valeTransporteDia} onSave={(v) => salvarParametro('valeTransporteDia', v)} />
            <Param label="VR dia" value={lancamentos.parametros.valeRefeicaoDia} onSave={(v) => salvarParametro('valeRefeicaoDia', v)} />
          </div>

          {!selected ? (
            <Empty icon="!">
              <h3>Nenhum setor calculavel</h3>
              <p className="muted">Inclua setores na construcao para gerar as abas de lancamento.</p>
            </Empty>
          ) : (
            <>
              <div className="lanc-sheet-title">
                <div>
                  <h2>{selected.nome}</h2>
                  <p className="muted">Custeio de pessoal da equipe. Cenario: {cebas ? 'Com CEBAS' : 'Sem CEBAS'}.</p>
                </div>
                <div className="actions">
                  {selected.foraMatriz && <Badge cls="ambar">Fora da matriz normativa</Badge>}
                  <button className="btn sm" onClick={() => setAddOpen(true)}>Adicionar linha</button>
                </div>
              </div>

              <div className="sheet-wrap lanc-sheet-wrap">
                <table className="sheet lanc-sheet">
                  <thead>
                    <tr>
                      <th className="text-left">Categoria</th>
                      <th className="num">CH</th>
                      <th className="num">Quantitativo</th>
                      <th className="num">Qtd turno 12h</th>
                      <th className="num">Salario base</th>
                      <th className="num">Insal.</th>
                      <th className="num">Grat.</th>
                      <th className="num">Titulacao</th>
                      <th className="num">Ad. noturno</th>
                      <th className="num">Rem. bruta</th>
                      <th className="num">Salario total</th>
                      <th className="num">Beneficios</th>
                      <th className="num">Encargos</th>
                      <th className="num">Total mensal</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bloco"><td className="label" colSpan="15">APLICACAO DE RECURSOS FINANCEIROS NECESSARIOS</td></tr>
                    {selected.linhas.map((linha) => (
                      <tr key={linha.id} className={linha.diferencaNormativa ? 'lanc-desvio' : ''}>
                        <td className="label">
                          <div className="lanc-cat">
                            <button className="btn sm ghost" onClick={() => setMemoria(linha)}>Memoria</button>
                            <div>
                              <strong>{linha.categoria}</strong>
                              {linha.funcaoNormativa && <span>{linha.funcaoNormativa}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="num">
                          <select className="cell-input lanc-select" value={linha.chs} onChange={(e) => salvarLinha(linha, 'chs', e.target.value)}>
                            {CHS_OPCOES.map((chs) => <option key={chs} value={chs}>{chs}</option>)}
                          </select>
                        </td>
                        <td className="num input-cell">
                          <input key={`q-${linha.id}-${linha.quantidade}-${versao}`} className="cell-input" type="number" min="0" step="1" defaultValue={linha.quantidade} onBlur={(e) => salvarLinha(linha, 'quantidade', e.target.value)} />
                          {linha.quantidadeNormativa != null && <small>norma {linha.quantidadeNormativa}</small>}
                        </td>
                        <td className="num input-cell">
                          <input key={`t-${linha.id}-${linha.quantidadeTurno}-${versao}`} className="cell-input" type="number" min="0" step="0.1" defaultValue={linha.quantidadeTurno} onBlur={(e) => salvarLinha(linha, 'quantidadeTurno', e.target.value)} />
                        </td>
                        <td className="num">{brlc(linha.base)}</td>
                        <td className="num">{brlc(linha.insalubridade)}</td>
                        <td className="num">{brlc(linha.gratificacao)}</td>
                        <td className="num">{brlc(linha.titulacao)}</td>
                        <td className="num">{brlc(linha.adicionalNoturno)}</td>
                        <td className="num">{brlc(linha.remuneracaoBruta)}</td>
                        <td className="num">{brlc(linha.salarioTotal)}</td>
                        <td className="num">{brlc(linha.beneficiosTotal)}</td>
                        <td className="num">{brlc(linha.encargosTotal)}</td>
                        <td className="num strong">{brlc(linha.totalMensal)}</td>
                        <td>
                          <div className="lanc-status">
                            {linha.diferencaNormativa ? <Badge cls="ambar">Desvio {linha.diferencaNormativa > 0 ? '+' : ''}{linha.diferencaNormativa}</Badge> : <Badge cls="verde">Normativo</Badge>}
                            {linha.justificativa && <small>{linha.justificativa}</small>}
                            <button className="btn sm ghost danger" onClick={() => removerLinha(linha)}>Remover</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr className="subtotal">
                      <td className="label">Total funcionarios</td>
                      <td />
                      <td className="num">{num(selected.totais.quantidade, 0)}</td>
                      <td colSpan="7" />
                      <td className="num">{brlc(selected.totais.salarioTotal)}</td>
                      <td className="num">{brlc(selected.totais.beneficiosTotal)}</td>
                      <td className="num">{brlc(selected.totais.encargosTotal)}</td>
                      <td className="num">{brlc(selected.totais.totalMensal)}</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
              <Note icon="i">A quantidade divergente da norma exige justificativa e fica refletida na construcao e no cronograma final.</Note>
            </>
          )}
        </main>
      </div>

      {justificativa && (
        <JustificativaModal
          data={justificativa}
          onClose={() => setJustificativa(null)}
          onSave={(motivo) => {
            if (justificativa.tipo === 'remover') {
              api.removeLancamentoEquipe(planoId, justificativa.linha.noId, justificativa.linha.id, motivo)
            } else {
              api.setLancamentoEquipe(planoId, justificativa.linha.noId, justificativa.linha.id, {
                quantidade: justificativa.valor,
                justificativa: motivo,
              })
            }
            setJustificativa(null)
            refresh()
          }}
        />
      )}

      {memoria && <MemoriaModal linha={memoria} onClose={() => setMemoria(null)} />}
      {addOpen && selected && <AddLinhaModal setor={selected} onClose={() => setAddOpen(false)} onSave={(dados) => { api.addLancamentoEquipe(planoId, selected.noId, dados); setAddOpen(false); refresh() }} />}
    </div>
  )
}

function Param({ label, value, suffix = '', onSave }) {
  return (
    <label className="lanc-param">
      <span>{label}</span>
      <input type="number" step="0.01" defaultValue={Number(value || 0).toFixed(suffix ? 2 : 2)} onBlur={(e) => onSave(e.target.value)} />
      {suffix && <b>{suffix}</b>}
    </label>
  )
}

function JustificativaModal({ data, onClose, onSave }) {
  const [motivo, setMotivo] = useState('')
  const titulo = data.tipo === 'remover' ? 'Remover linha normativa' : 'Justificar divergencia'
  return (
    <Modal title={titulo} icon="!" onClose={onClose}
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn primary" disabled={!motivo.trim()} onClick={() => onSave(motivo.trim())}>Salvar justificativa</button>
      </>}>
      <div className="mb-2"><b>{data.linha.categoria}</b></div>
      <div className="memo-line"><span className="k">Normativo</span><span className="v">{data.normativa ?? 'Sem norma'}</span></div>
      <div className="memo-line"><span className="k">Atual</span><span className="v">{data.valor}</span></div>
      <div className="field mt-2">
        <label>Justificativa obrigatoria</label>
        <textarea rows={4} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Descreva a razao tecnica, operacional ou assistencial do ajuste." />
      </div>
    </Modal>
  )
}

function MemoriaModal({ linha, onClose }) {
  return (
    <Modal title="Memoria de calculo" icon="i" onClose={onClose} lg>
      <div className="memo-line"><span className="k">Categoria</span><span className="v">{linha.categoria}</span></div>
      <div className="memo-line"><span className="k">Quantidade</span><span className="v">{linha.quantidade}</span></div>
      <div className="memo-line"><span className="k">QP 40h / QP 30h</span><span className="v">{linha.memoriaCalculo?.qp40 ?? '-'} / {linha.memoriaCalculo?.qp30 ?? '-'}</span></div>
      <div className="memo-line"><span className="k">Beneficios</span><span className="v">VT {brl(linha.valeTransporte)} + VR {brl(linha.valeRefeicao)}</span></div>
      <div className="memo-line"><span className="k">Encargos</span><span className="v">{pct(linha.encargosPct * 100)} sobre salario total</span></div>
      {linha.justificativa && <div className="memo-line"><span className="k">Justificativa</span><span className="v">{linha.justificativa}</span></div>}
      {linha.memoriaCalculo?.formula && <div className="memo-formula mt-2">{linha.memoriaCalculo.formula}</div>}
      {linha.salarioProvisorio && <Note icon="i">Referencia salarial aproximada usada para manter o cronograma calculavel.</Note>}
    </Modal>
  )
}

function AddLinhaModal({ setor, onClose, onSave }) {
  const [perfilId, setPerfilId] = useState(api.perfis[0]?.id || '')
  const [quantidade, setQuantidade] = useState(1)
  const [chs, setChs] = useState(40)
  const [quantidadeTurno, setQuantidadeTurno] = useState(1)
  const [justificativa, setJustificativa] = useState('')
  return (
    <Modal title="Adicionar linha manual" icon="+" onClose={onClose}
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn primary" disabled={!perfilId || !justificativa.trim()} onClick={() => onSave({ perfilId, quantidade, chs, quantidadeTurno, justificativa })}>Adicionar</button>
      </>}>
      <div className="mb-2"><b>{setor.nome}</b></div>
      <div className="field">
        <label>Perfil de alocacao</label>
        <select value={perfilId} onChange={(e) => setPerfilId(e.target.value)}>
          {api.perfis.map((perfil) => <option key={perfil.id} value={perfil.id}>{perfil.label}</option>)}
        </select>
      </div>
      <div className="form-row three">
        <div className="field"><label>Quantidade</label><input type="number" min="0" step="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} /></div>
        <div className="field"><label>CH</label><select value={chs} onChange={(e) => setChs(e.target.value)}>{CHS_OPCOES.map((op) => <option key={op} value={op}>{op}</option>)}</select></div>
        <div className="field"><label>Qtd turno 12h</label><input type="number" min="0" step="0.1" value={quantidadeTurno} onChange={(e) => setQuantidadeTurno(e.target.value)} /></div>
      </div>
      <div className="field">
        <label>Justificativa</label>
        <textarea rows={3} value={justificativa} onChange={(e) => setJustificativa(e.target.value)} placeholder="Linha manual fora da matriz normativa." />
      </div>
    </Modal>
  )
}
