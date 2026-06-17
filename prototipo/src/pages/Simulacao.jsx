import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import * as api from '../mock/api.js'
import { brl, pct } from '../lib/format.js'
import { Note, Badge } from '../components/ui.jsx'

// Simulação what-if em memória (não persiste) — contraparte de /planos/{id}/simular/.
export default function Simulacao() {
  const { id } = useParams()
  const planoId = Number(id)
  const plano = api.getPlano(planoId)
  const escopos = api.listEscopos(planoId)

  const baseMensal = (cebas) => escopos.reduce((a, n) => a + api.calcEscopo(n, { cebas }).total_mensal, 0)
  const semCebas = baseMensal(false)
  const comCebas = baseMensal(true)
  const economiaCebas = semCebas - comCebas

  const pctSem = api.encargosPercentual(false) * 100
  const pctCom = api.encargosPercentual(true) * 100

  // cenário selecionado para a "proposta" + ajustes what-if
  const [cebas, setCebas] = useState(false)
  const [fatorEquipe, setFatorEquipe] = useState(1)
  const [fatorSalario, setFatorSalario] = useState(1)

  const vigente = semCebas
  const proposta = baseMensal(cebas) * fatorEquipe * fatorSalario
  const dif = proposta - vigente
  const difPct = vigente ? (dif / vigente) * 100 : 0

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div className="page-head">
        <div>
          <Link to={`/plano/${planoId}/construcao`} className="muted" style={{ fontSize: 12.5 }}>← {plano.nome}</Link>
          <h1 style={{ marginTop: 4 }}>Simulação de cenários</h1>
          <div className="sub">Compare cenários e altere variáveis. Nada é salvo.</div>
        </div>
      </div>

      {/* destaque CEBAS */}
      <div className="card card-pad mb-2">
        <div className="section-title">Cenário Com / Sem CEBAS (imunidade tributária)</div>
        <div className="grid cols-3">
          <CenCard nome="Sem CEBAS" desc={`Encargos ${pct(pctSem)} · INSS patronal incide`} mensal={semCebas} tag="cinza" />
          <CenCard nome="Com CEBAS" desc={`Encargos ${pct(pctCom)} · INSS patronal isento`} mensal={comCebas} tag="verde" />
          <div className="card card-pad" style={{ boxShadow: 'none', background: 'var(--verde-bg)' }}>
            <Badge cls="verde" dot>Economia com CEBAS</Badge>
            <div style={{ fontSize: 24, fontWeight: 750, marginTop: 8, color: 'var(--verde)' }}>{brl(economiaCebas)}</div>
            <div className="muted" style={{ fontSize: 12 }}>por mês · {brl(economiaCebas * 12)} / ano</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{pct((economiaCebas / semCebas) * 100)} do custo mensal</div>
          </div>
        </div>
        <Note icon="🏛️">Com CEBAS, o Grupo A dos encargos (INSS Empresa, INSS Terceiros+FAP e patronais) é zerado — exatamente o caso “COM imunidade tributária” da planilha real.</Note>
      </div>

      {/* what-if */}
      <div className="grid cols-3">
        <div className="card card-pad">
          <div className="section-title">Ajustes (what-if)</div>
          <div className="field" style={{ marginBottom: 10 }}>
            <label>Cenário da proposta</label>
            <div className="pill-toggle">
              <button className={!cebas ? 'active' : ''} onClick={() => setCebas(false)}>Sem CEBAS</button>
              <button className={cebas ? 'active' : ''} onClick={() => setCebas(true)}>Com CEBAS</button>
            </div>
          </div>
          <Slider label={`Equipe: ${pct((fatorEquipe - 1) * 100, 0)}`} value={fatorEquipe} onChange={setFatorEquipe} />
          <Slider label={`Salários: ${pct((fatorSalario - 1) * 100, 0)}`} value={fatorSalario} onChange={setFatorSalario} />
        </div>

        <div className="card card-pad" style={{ gridColumn: 'span 2' }}>
          <div className="section-title">Vigente × Proposta</div>
          <div className="grid cols-2">
            <CenCard nome="Vigente" desc="Sem CEBAS, configuração atual" mensal={vigente} tag="cinza" />
            <CenCard nome="Proposta" desc={`${cebas ? 'Com CEBAS' : 'Sem CEBAS'} + ajustes`} mensal={proposta} tag="azul" />
          </div>
          <div className="divider" />
          <div className="grid cols-3">
            <Impacto t="Diferença mensal" v={brl(dif)} up={dif >= 0} />
            <Impacto t="Diferença anual" v={brl(dif * 12)} up={dif >= 0} />
            <Impacto t="Variação" v={pct(difPct)} up={dif >= 0} />
          </div>
        </div>
      </div>

      <Note icon="⚖️">Cenários (no código, <i>VariantePlano</i>) funcionam como sobreposição do plano base: herdam tudo e só sobrescrevem o que muda (aqui, o regime tributário). A simulação calcula em memória; para persistir, use <b>Apurar</b>.</Note>
    </div>
  )
}

function CenCard({ nome, desc, mensal, tag }) {
  return (
    <div className="card card-pad" style={{ boxShadow: 'none', background: 'var(--cinza-bg)' }}>
      <Badge cls={tag} dot>{nome}</Badge>
      <div style={{ fontSize: 23, fontWeight: 750, marginTop: 8 }}>{brl(mensal)}</div>
      <div className="muted" style={{ fontSize: 12 }}>por mês · {desc}</div>
      <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{brl(mensal * 12)} / ano</div>
    </div>
  )
}

function Slider({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>
      <input type="range" min="0.7" max="1.5" step="0.05" value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%' }} />
    </div>
  )
}

function Impacto({ t, v, up }) {
  return (
    <div>
      <div className="muted" style={{ fontSize: 12 }}>{t}</div>
      <div style={{ fontSize: 19, fontWeight: 700, color: up ? 'var(--vermelho)' : 'var(--verde)' }}>{up ? '▲' : '▼'} {v}</div>
    </div>
  )
}
