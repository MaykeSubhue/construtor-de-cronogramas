import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import * as api from '../mock/api.js'
import { brl, brlc, competenciaLabel, num } from '../lib/format.js'
import { Badge, Empty, Modal, Note } from '../components/ui.jsx'

export default function Cronograma() {
  const { id } = useParams()
  const planoId = Number(id)
  const [sp] = useSearchParams()
  const [cebas, setCebas] = useState(sp.get('cebas') === '1')
  const [view, setView] = useState('cronograma')
  const [cell, setCell] = useState(null)

  const cr = api.getCronogramaFinal(planoId, { cebas })
  const reducao = api.getReducaoCebas(planoId)
  const plano = cr.plano

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

  return (
    <div className="cron-page">
      <div className="page-head cron-head">
        <div>
          <Link to={`/plano/${planoId}/lancamentos`} className="muted" style={{ fontSize: 12.5 }}>← Lancamentos de equipe e custos</Link>
          <h1 style={{ marginTop: 4 }}>Cronograma de desembolso financeiro - {cr.unidade}</h1>
          <div className="sub">
            {competenciaLabel(cr.meses[0])} a {competenciaLabel(cr.meses[cr.meses.length - 1])} · matriz final baseada nas abas de lancamento.
          </div>
        </div>
        <div className="actions">
          <div>
            <div className="muted" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 3 }}>Cenario</div>
            <div className="pill-toggle">
              <button className={!cebas ? 'active' : ''} onClick={() => setCebas(false)}>Sem CEBAS</button>
              <button className={cebas ? 'active' : ''} onClick={() => setCebas(true)}>Com CEBAS</button>
            </div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 3 }}>Visao</div>
            <div className="pill-toggle">
              <button className={view === 'cronograma' ? 'active' : ''} onClick={() => setView('cronograma')}>Cronograma</button>
              <button className={view === 'reducao' ? 'active' : ''} onClick={() => setView('reducao')}>Reducao</button>
            </div>
          </div>
          <Link className="btn" to={`/plano/${planoId}/construcao`}>Construcao</Link>
        </div>
      </div>

      <div className="grid cols-4 mb-2">
        <Card t="RH + custeio / mes" v={brl(cr.resumo.rhCusteioMensal)} />
        <Card t="Apoio a gestao / mes" v={brl(cr.resumo.apoioTotal)} />
        <Card t="Variavel / mes" v={brl(cr.resumo.variavelTotal)} />
        <Card t="Total contrato" v={brl(cr.resumo.totalContrato)} dest />
      </div>

      <Note icon="i">
        A matriz final nao tem motor duplicado: ela le as abas de lancamento, aplica custeio 30%, apoio 4%/1%,
        parte variavel 2%/1%/2% e o cenario CEBAS selecionado.
      </Note>

      {view === 'reducao' ? (
        <ReducaoTable reducao={reducao} />
      ) : (
        <CronogramaTable cr={cr} onCell={setCell} />
      )}

      {cell && <CellModal cell={cell} cr={cr} onClose={() => setCell(null)} />}
    </div>
  )
}

function Card({ t, v, dest }) {
  return <div className="card kpi"><span className="l">{t}</span><span className="v" style={{ fontSize: dest ? 22 : 18 }}>{v}</span></div>
}

function CronogramaTable({ cr, onCell }) {
  const ano1 = cr.meses.slice(0, 12)
  const ano2 = cr.meses.slice(12, 24)
  return (
    <div className="sheet-wrap cron-sheet-wrap mt-2">
      <table className="sheet cron-sheet">
        <thead>
          <tr>
            <th className="text-left">Item</th>
            <th className="num">Valores unitarios</th>
            {ano1.map((mes, idx) => <th key={mes} className="num">Mes {String(idx + 1).padStart(2, '0')}<small>{competenciaLabel(mes)}</small></th>)}
            <th className="num">Total 1 ano</th>
            {ano2.map((mes, idx) => <th key={mes} className="num">Mes {String(idx + 13).padStart(2, '0')}<small>{competenciaLabel(mes)}</small></th>)}
            <th className="num">Total 2 ano</th>
            <th className="num">Total contrato</th>
          </tr>
        </thead>
        <tbody>
          {cr.grupos.map((grupo) => (
            <FragmentGroup key={grupo.id} grupo={grupo} onCell={onCell} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FragmentGroup({ grupo, onCell }) {
  return (
    <>
      <tr className="section-row"><td className="label" colSpan="30">{grupo.titulo}</td></tr>
      {grupo.linhas.map((linha) => (
        <tr key={linha.id} className={linha.tipo === 'grand-total' ? 'total' : linha.tipo === 'subtotal' ? 'subtotal' : linha.tipo === 'total' ? 'bloco' : 'item'}>
          <td className="label" onClick={() => onCell({ linha, mesIndex: null })}>{linha.label}</td>
          <td className="num cell-clickable" onClick={() => onCell({ linha, mesIndex: null, valor: linha.valorUnitario })}>{brlc(linha.valorUnitario)}</td>
          {linha.valores.slice(0, 12).map((valor, idx) => (
            <td key={idx} className="num cell-clickable" onClick={() => onCell({ linha, mesIndex: idx, valor })}>{brlc(valor)}</td>
          ))}
          <td className="num">{brlc(linha.totalAno1)}</td>
          {linha.valores.slice(12, 24).map((valor, idx) => (
            <td key={idx + 12} className="num cell-clickable" onClick={() => onCell({ linha, mesIndex: idx + 12, valor })}>{brlc(valor)}</td>
          ))}
          <td className="num">{brlc(linha.totalAno2)}</td>
          <td className="num">{brlc(linha.totalContrato)}</td>
        </tr>
      ))}
    </>
  )
}

function ReducaoTable({ reducao }) {
  return (
    <div className="sheet-wrap reducao-wrap mt-2">
      <table className="sheet reducao-sheet">
        <thead>
          <tr>
            <th className="text-left">Rubrica</th>
            <th className="num">Sem CEBAS</th>
            <th className="num">Com CEBAS</th>
            <th className="num">Diferenca</th>
          </tr>
        </thead>
        <tbody>
          {reducao.linhas.map((linha) => (
            <tr key={linha.rubrica}>
              <td className="label">{linha.rubrica}</td>
              <td className="num">{brl(linha.sem)}</td>
              <td className="num">{brl(linha.com)}</td>
              <td className="num">{brl(linha.diferenca)}</td>
            </tr>
          ))}
          <tr className="total">
            <td className="label">TOTAL</td>
            <td className="num">{brl(reducao.total.sem)}</td>
            <td className="num">{brl(reducao.total.com)}</td>
            <td className="num">{brl(reducao.total.diferenca)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function CellModal({ cell, cr, onClose }) {
  const linha = cell.linha
  const valor = cell.valor ?? linha.valorUnitario
  const competencia = cell.mesIndex == null ? 'Valor unitario mensal' : `Mes ${cell.mesIndex + 1} - ${competenciaLabel(cr.meses[cell.mesIndex])}`
  return (
    <Modal title="Origem do valor" icon="i" onClose={onClose}>
      <div className="mb-2">
        <b>{linha.label}</b> <Badge cls={cr.cebas ? 'verde' : 'cinza'}>{cr.cebas ? 'Com CEBAS' : 'Sem CEBAS'}</Badge>
      </div>
      <div className="memo-line"><span className="k">Competencia</span><span className="v">{competencia}</span></div>
      <div className="memo-line"><span className="k">Valor</span><span className="v">{brl(valor)}</span></div>
      <div className="memo-line"><span className="k">Total 1 ano</span><span className="v">{brl(linha.totalAno1)}</span></div>
      <div className="memo-line"><span className="k">Total 2 ano</span><span className="v">{brl(linha.totalAno2)}</span></div>
      <div className="memo-line"><span className="k">Total contrato</span><span className="v">{brl(linha.totalContrato)}</span></div>
      {linha.memoria && <div className="memo-formula mt-2">{linha.memoria}</div>}
      <div className="mt-2">
        <h4 style={{ marginBottom: 8 }}>Resumo do plano</h4>
        <div className="memo-line"><span className="k">Equipe total</span><span className="v">{num(cr.lancamentos.totais.quantidade, 0)}</span></div>
        <div className="memo-line"><span className="k">RH mensal</span><span className="v">{brl(cr.lancamentos.totais.totalMensal)}</span></div>
      </div>
    </Modal>
  )
}
