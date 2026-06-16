import { useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import * as api from '../mock/api.js'
import { brl, brlc, competenciaLabel, gerarCompetencias } from '../lib/format.js'
import { Modal, Note, Badge } from '../components/ui.jsx'

export default function Cronograma() {
  const { id } = useParams()
  const planoId = Number(id)
  const [sp] = useSearchParams()

  const planoBase = api.getPlano(planoId)
  const [cebas, setCebas] = useState(sp.get('cebas') === '1')
  const [modelo, setModelo] = useState(sp.get('modelo') === 'subhue' ? 'subhue' : 'grupos')
  const [ta, setTa] = useState(null)            // { reajuste, meses, competenciaInicial, mesInicialNum }
  const [periodo, setPeriodo] = useState('original') // 'original' | 'ta'
  const [taModal, setTaModal] = useState(false)
  const [expandido, setExpandido] = useState({})
  const [cell, setCell] = useState(null)
  const [ajuste, setAjuste] = useState(null)
  const [, setVersao] = useState(0)
  const refresh = () => setVersao((n) => n + 1)
  const toggle = (k) => setExpandido((s) => ({ ...s, [k]: !s[k] }))

  const emTA = periodo === 'ta' && ta
  const cr = api.getCronograma(planoId, emTA
    ? { cebas, modelo, reajuste: ta.reajuste, meses: ta.meses, competenciaInicial: ta.competenciaInicial, mesInicialNum: ta.mesInicialNum }
    : { cebas, modelo })

  const nMeses = cr.meses.length
  const m0 = cr.mesInicialNum

  return (
    <div style={{ padding: '24px 28px 60px' }}>
      <div className="page-head">
        <div>
          <Link to={`/plano/${planoId}/construcao`} className="muted" style={{ fontSize: 12.5 }}>← {cr.plano.nome}</Link>
          <h1 style={{ marginTop: 4 }}>Cronograma financeiro {emTA && <Badge cls="roxo">Termo Aditivo</Badge>}</h1>
          <div className="sub">
            {cr.plano.objeto?.nome} · Mês {m0} a {m0 + nMeses - 1} ({competenciaLabel(cr.meses[0])} a {competenciaLabel(cr.meses[nMeses - 1])})
            {emTA && <> · reajuste {(ta.reajuste * 100).toFixed(1)}%</>}
          </div>
        </div>
        <div className="actions">
          <div title="Modelo de cálculo de encargos e benefícios">
            <div className="muted" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 3 }}>Modelo de custo</div>
            <div className="pill-toggle">
              <button className={modelo === 'grupos' ? 'active' : ''} onClick={() => setModelo('grupos')}>Grupos A–E</button>
              <button className={modelo === 'subhue' ? 'active' : ''} onClick={() => setModelo('subhue')}>Motor SUBHUE</button>
            </div>
          </div>
          <div title="Cenário tributário" style={modelo === 'subhue' ? { opacity: .4, pointerEvents: 'none' } : null}>
            <div className="muted" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 3 }}>Cenário</div>
            <div className="pill-toggle">
              <button className={!cebas ? 'active' : ''} onClick={() => setCebas(false)}>Sem CEBAS</button>
              <button className={cebas ? 'active' : ''} onClick={() => setCebas(true)}>Com CEBAS</button>
            </div>
          </div>
          <button className="btn">📊 Excel</button>
          <button className="btn primary" onClick={() => setTaModal(true)}>＋ Termo Aditivo</button>
        </div>
      </div>

      {/* alternância de período (aparece após criar o TA) */}
      {ta && (
        <div className="pill-toggle mb-2">
          <button className={periodo === 'original' ? 'active' : ''} onClick={() => setPeriodo('original')}>Contrato original (mês 1–{planoBase.meses_projecao})</button>
          <button className={periodo === 'ta' ? 'active' : ''} onClick={() => setPeriodo('ta')}>Termo Aditivo (mês {ta.mesInicialNum}–{ta.mesInicialNum + ta.meses - 1})</button>
        </div>
      )}

      <div className="grid cols-4 mb-2">
        <Card t="Parte fixa (RH + gestão) / mês" v={brl(cr.parteFixa.mensal)} />
        <Card t="Custeio / mês" v={brl(cr.custeio.mensal)} />
        <Card t="Total mensal" v={brl(cr.total.mensal)} dest />
        <Card t={`Total ${nMeses} meses`} v={brl(cr.total.total_periodo)} dest />
      </div>

      <Note icon="🔒">O cronograma <b>não recalcula regras</b>: distribui temporalmente os valores apurados.{emTA && ' No Termo Aditivo, aplica-se o reajuste salarial sobre os valores do contrato original.'} Abra um bloco para ajustar quantidades; divergências da norma exigem justificativa e voltam para a construção.</Note>

      <div className="sheet-wrap mt-2">
        <table className="sheet">
          <thead>
            <tr>
              <th style={{ minWidth: 320, position: 'sticky', left: 0, zIndex: 2 }}>Bloco / Setor</th>
              {cr.meses.map((m, i) => <th key={m} className="num">Mês {m0 + i}<div style={{ fontWeight: 400, fontSize: 10, opacity: .8 }}>{competenciaLabel(m)}</div></th>)}
              <th className="num" style={{ minWidth: 120 }}>Total período</th>
            </tr>
          </thead>
          <tbody>
            {cr.blocos.map((b) => (
              <BlocoRows key={b.nome} bloco={b} nMeses={nMeses} expandido={!!expandido[b.nome]} onToggle={() => toggle(b.nome)} onCell={(mes, val, item = null) => setCell({ bloco: b.nome, mes, val, tipo: item ? item.label : 'RH', item })} onEditarItem={(item) => setAjuste({ bloco: b.nome, item })} />
            ))}

            {/* Apoio à Gestão */}
            <tr className="bloco" onClick={() => toggle('__apoio')} style={{ cursor: 'pointer' }}>
              <td className="label">{expandido.__apoio ? '▾' : '▸'} Apoio à Gestão</td>
              {cr.apoioGestao.valores.map((v, i) => <td key={i} className="num cell-clickable" onClick={(e) => { e.stopPropagation(); setCell({ bloco: 'Apoio à Gestão', mes: i, val: v, tipo: 'Taxa de gestão (CGE+RUE)' }) }}>{brlc(v)}</td>)}
              <td className="num">{brlc(cr.apoioGestao.total_periodo)}</td>
            </tr>
            {expandido.__apoio && cr.apoioGestao.itens.map((it, idx) => (
              <tr key={idx} className="item"><td className="label">{it.label}</td>{cr.meses.map((_, i) => <td key={i} className="num">{brlc(it.mensal)}</td>)}<td className="num">{brlc(it.mensal * nMeses)}</td></tr>
            ))}

            {/* Custeio */}
            <tr className="bloco" onClick={() => toggle('__custeio')} style={{ cursor: 'pointer' }}>
              <td className="label">{expandido.__custeio ? '▾' : '▸'} Custeio</td>
              {cr.custeio.valores.map((v, i) => <td key={i} className="num cell-clickable" onClick={(e) => { e.stopPropagation(); setCell({ bloco: 'Custeio', mes: i, val: v, tipo: 'Custeio' }) }}>{brlc(v)}</td>)}
              <td className="num">{brlc(cr.custeio.total_periodo)}</td>
            </tr>
            {expandido.__custeio && cr.custeio.itens.map((it, idx) => (
              <tr key={idx} className="item"><td className="label">{it.label}</td>{cr.meses.map((_, i) => <td key={i} className="num">{brlc(it.mensal)}</td>)}<td className="num">{brlc(it.mensal * nMeses)}</td></tr>
            ))}

            {/* Subtotais */}
            <tr className="subtotal"><td className="label">Subtotal Parte Fixa</td>{cr.parteFixa.valores.map((v, i) => <td key={i} className="num">{brlc(v)}</td>)}<td className="num">{brlc(cr.parteFixa.total_periodo)}</td></tr>
            <tr className="subtotal"><td className="label">Parte Variável (produção)</td>{cr.parteVariavel.valores.map((v, i) => <td key={i} className="num">{brlc(v)}</td>)}<td className="num">{brlc(cr.parteVariavel.total_periodo)}</td></tr>
            <tr className="total"><td className="label">TOTAL GERAL</td>{cr.total.valores.map((v, i) => <td key={i} className="num">{brlc(v)}</td>)}<td className="num">{brlc(cr.total.total_periodo)}</td></tr>
          </tbody>
        </table>
      </div>

      {cell && (
        <Modal title="Origem do valor" icon="🧮" onClose={() => setCell(null)}>
          <div className="mb-2"><b>{cell.bloco}</b> · {cell.tipo} · Mês {m0 + cell.mes} ({competenciaLabel(cr.meses[cell.mes])}) · <Badge cls={cebas ? 'verde' : 'cinza'}>{cebas ? 'Com CEBAS' : 'Sem CEBAS'}</Badge></div>
          <div className="memo-line"><span className="k">Valor mensal apurado</span><span className="v">{brl(cell.val)}</span></div>
              {cell.item && (
            <>
              <div className="memo-line"><span className="k">Quantidade atual</span><span className="v">{cell.item.quantidade}</span></div>
              {cell.item.quantidadeNormativa != null && <div className="memo-line"><span className="k">Quantidade normativa</span><span className="v">{cell.item.quantidadeNormativa}</span></div>}
              {cell.item.diferencaNormativa != null && cell.item.diferencaNormativa !== 0 && <div className="memo-line"><span className="k">Diferença normativa</span><span className="v">{cell.item.diferencaNormativa > 0 ? '+' : ''}{cell.item.diferencaNormativa}</span></div>}
              {cell.item.justificativa && <div className="memo-line"><span className="k">Justificativa</span><span className="v">{cell.item.justificativa}</span></div>}
              {cell.item.qp40 != null && <div className="memo-line"><span className="k">QP 40h / QP 30h</span><span className="v">{cell.item.qp40} / {cell.item.qp30}</span></div>}
              {cell.item.memoriaCalculo?.formula && <div className="memo-line"><span className="k">Fórmula</span><span className="v">{cell.item.memoriaCalculo.formula}</span></div>}
              <button className="btn sm mt-1" onClick={() => { setAjuste({ bloco: cell.bloco, item: cell.item }); setCell(null) }}>Ajustar quantidade</button>
            </>
          )}
          {emTA && <div className="memo-line"><span className="k">Reajuste aplicado</span><span className="v">+{(ta.reajuste * 100).toFixed(1)}%</span></div>}
          <div className="memo-line"><span className="k">Distribuição</span><span className="v">Linear nos {nMeses} meses</span></div>
          <Note icon="📜">Deriva da apuração do setor. Ao ajustar quantidade aqui, o mesmo item do setor é atualizado e o cronograma é recalculado.</Note>
        </Modal>
      )}

      {ajuste && (
        <AjusteQuantidadeModal
          data={ajuste}
          planoId={planoId}
          onClose={() => setAjuste(null)}
          onSave={(qtd, motivo) => {
            const it = ajuste.item
            api.setQuantidade(planoId, it.noId, it.itemId, qtd)
            if (it.quantidadeNormativa != null && qtd !== it.quantidadeNormativa) {
              api.registrarDesvio(planoId, it.noId, it.perfilId, { de: it.quantidadeNormativa, para: qtd, motivo, tipo: 'cronograma' })
            } else {
              api.limparDesvio(planoId, it.noId, it.perfilId)
            }
            setAjuste(null)
            refresh()
          }}
        />
      )}

      {taModal && (
        <TermoAditivoModal plano={planoBase} cebas={cebas} modelo={modelo} onClose={() => setTaModal(false)} onCreate={(novo) => { setTa(novo); setPeriodo('ta'); setTaModal(false) }} />
      )}
    </div>
  )
}

function BlocoRows({ bloco, nMeses, expandido, onToggle, onCell, onEditarItem }) {
  return (
    <>
      <tr className="bloco" onClick={onToggle} style={{ cursor: 'pointer' }}>
        <td className="label">{expandido ? '▾' : '▸'} {bloco.nome}</td>
        {bloco.valores.map((v, i) => <td key={i} className="num cell-clickable" onClick={(e) => { e.stopPropagation(); onCell(i, v) }}>{brlc(v)}</td>)}
        <td className="num">{brlc(bloco.total_periodo)}</td>
      </tr>
      {expandido && bloco.itens.map((it, idx) => (
        <tr key={idx} className="item">
          <td className="label">
            <div className="spread" style={{ gap: 8 }}>
              <span>
                {it.label}
                <span className="muted"> · Qtd {it.quantidade}</span>
                {it.quantidadeNormativa != null && it.quantidade !== it.quantidadeNormativa && <Badge cls="ambar">norma {it.quantidadeNormativa} ({it.diferencaNormativa > 0 ? '+' : ''}{it.diferencaNormativa})</Badge>}
                {it.justificativa && <span className="muted"> · {it.justificativa}</span>}
              </span>
              <button className="btn sm ghost" onClick={(e) => { e.stopPropagation(); onEditarItem(it) }}>Ajustar Qtd</button>
            </div>
          </td>
          {Array.from({ length: nMeses }).map((_, i) => <td key={i} className="num cell-clickable" onClick={() => onCell(i, it.mensal, it)}>{brlc(it.mensal)}</td>)}
          <td className="num">{brlc(it.mensal * nMeses)}</td>
        </tr>
      ))}
    </>
  )
}

function AjusteQuantidadeModal({ data, onClose, onSave }) {
  const item = data.item
  const [qtd, setQtd] = useState(item.quantidade)
  const [motivo, setMotivo] = useState('')
  const normativo = item.quantidadeNormativa
  const diverge = normativo != null && Number(qtd) !== Number(normativo)
  const podeSalvar = Number.isFinite(Number(qtd)) && Number(qtd) >= 0 && (!diverge || motivo.trim())

  return (
    <Modal title="Ajustar quantidade no cronograma" icon="🧮" onClose={onClose}
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn primary" disabled={!podeSalvar} onClick={() => onSave(Math.max(0, Math.round(Number(qtd) || 0)), motivo.trim())}>Salvar ajuste</button>
      </>}>
      <div className="mb-2"><b>{item.label}</b> · {data.bloco}</div>
      <div className="form-row">
        <div className="field">
          <label>Quantidade atual</label>
          <input type="number" min="0" step="1" value={qtd} onChange={(e) => setQtd(e.target.value)} autoFocus />
          <div className="hint">O valor altera o mesmo item exibido na construção.</div>
        </div>
        <div className="field">
          <label>Normativo</label>
          <input value={normativo ?? 'Sem norma vinculada'} disabled />
          <div className="hint">{item.qp40 != null ? `QP 40h: ${item.qp40} · QP 30h: ${item.qp30}` : 'Sem QP calculado pela matriz.'}</div>
        </div>
      </div>
      {item.memoriaCalculo?.formula && <div className="memo-formula mt-1">{item.memoriaCalculo.formula}</div>}
      {diverge && (
        <div className="field mt-2">
          <label>Justificativa obrigatória</label>
          <textarea rows={3} value={motivo} onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ex.: ajuste temporário de escala, ampliação autorizada, demanda sazonal..."
            style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--cinza-borda-forte)', borderRadius: 6, resize: 'vertical', font: 'inherit' }} />
          <div className="hint">A justificativa fica registrada no setor e aparece como desvio normativo.</div>
        </div>
      )}
      {!diverge && <Note icon="📜">Como o valor coincide com a norma, eventuais desvios anteriores serão limpos.</Note>}
    </Modal>
  )
}

function Card({ t, v, dest }) {
  return <div className="card kpi"><span className="l">{t}</span><span className="v" style={{ fontSize: dest ? 22 : 18 }}>{v}</span></div>
}

/* ----------------------------------------------------------- Termo Aditivo */
function TermoAditivoModal({ plano, cebas, modelo, onClose, onCreate }) {
  const [reajustePct, setReajustePct] = useState(6)
  const [meses, setMeses] = useState(plano.meses_projecao)

  // competência seguinte ao término do contrato original
  const todas = gerarCompetencias(plano.competencia_inicial, plano.meses_projecao + 1)
  const competenciaInicial = todas[plano.meses_projecao]
  const mesInicialNum = plano.meses_projecao + 1

  const atual = api.getCronograma(plano.id, { cebas, modelo }).total.mensal
  const novo = atual * (1 + reajustePct / 100)

  return (
    <Modal title="Criar Termo Aditivo" icon="📑" onClose={onClose} lg
      footer={<>
        <button className="btn ghost" onClick={onClose}>Cancelar</button>
        <button className="btn primary" onClick={() => onCreate({ reajuste: reajustePct / 100, meses, competenciaInicial, mesInicialNum })}>Gerar Termo Aditivo</button>
      </>}>
      <Note icon="📑">O contrato original termina no <b>mês {plano.meses_projecao}</b> ({competenciaLabel(todas[plano.meses_projecao - 1])}). O Termo Aditivo prorroga a partir do <b>mês {mesInicialNum}</b> ({competenciaLabel(competenciaInicial)}), reaproveitando a estrutura e o quadro, com reajuste salarial.</Note>
      <div className="form-row mt-2">
        <div className="field">
          <label>Reajuste salarial (%)</label>
          <input type="number" step="0.1" value={reajustePct} onChange={(e) => setReajustePct(Number(e.target.value))} />
          <div className="hint">Aplicado sobre todos os valores do contrato original.</div>
        </div>
        <div className="field">
          <label>Meses do aditivo</label>
          <input type="number" min={1} max={48} value={meses} onChange={(e) => setMeses(Number(e.target.value))} />
          <div className="hint">Ex.: mais 12 ou 24 meses.</div>
        </div>
      </div>
      <div className="divider" />
      <div className="section-title">Prévia de impacto (cenário {cebas ? 'Com' : 'Sem'} CEBAS)</div>
      <div className="grid cols-3">
        <Prev t="Mensal atual" v={brl(atual)} />
        <Prev t="Mensal com reajuste" v={brl(novo)} dest />
        <Prev t={`Total do aditivo (${meses}m)`} v={brl(novo * meses)} dest />
      </div>
      <div className="memo-line mt-2"><span className="k">Diferença mensal</span><span className="v">{brl(novo - atual)} (+{reajustePct.toFixed(1)}%)</span></div>
    </Modal>
  )
}

function Prev({ t, v, dest }) {
  return (
    <div className="card card-pad" style={{ boxShadow: 'none', background: 'var(--cinza-bg)' }}>
      <div className="muted" style={{ fontSize: 12 }}>{t}</div>
      <div style={{ fontSize: dest ? 20 : 17, fontWeight: 750, color: dest ? 'var(--azul-900)' : undefined }}>{v}</div>
    </div>
  )
}
