import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '../mock/api.js'
import { Badge, Empty, Kpi, Modal, Note } from '../components/ui.jsx'
import { brl, competenciaLabel, num, pct } from '../lib/format.js'

const SECOES = [
  { id: 'unidades', label: 'Unidades', desc: 'Unidades municipais e unidades manuais do planejamento.' },
  { id: 'especialidades', label: 'Especialidades', desc: 'Especialidades assistenciais normalizadas por CBO.' },
  { id: 'salarios', label: 'Tabelas salariais', desc: 'Base salarial vigente por categoria profissional.' },
  { id: 'normativas', label: 'Normativas / RDCs', desc: 'Bases normativas e fontes do dimensionamento.' },
  { id: 'regras', label: 'Regras', desc: 'Biblioteca de regras normativas, metodologicas e checklists.' },
  { id: 'presets', label: 'Modelos / Presets', desc: 'Perfis hospitalares iniciais e setores da matriz.' },
  { id: 'setores', label: 'Tipos de setores', desc: 'Tipos estruturais usados na construção.' },
  { id: 'servicos', label: 'Serviços', desc: 'Serviços cadastrados dentro dos setores.' },
  { id: 'categorias', label: 'Categorias profissionais', desc: 'Categorias profissionais de referência.' },
  { id: 'regimes', label: 'Regimes de trabalho', desc: 'Cargas horárias e escalas.' },
  { id: 'naturezas', label: 'Naturezas / turnos', desc: 'Natureza de atuação e incidência noturna.' },
  { id: 'rubricas', label: 'Rubricas', desc: 'Rubricas de salário, adicionais, encargos e benefícios.' },
  { id: 'encargos', label: 'Encargos', desc: 'Grupos de encargos e incidências.' },
  { id: 'beneficios', label: 'Benefícios', desc: 'Regras de benefícios.' },
  { id: 'regras-custeio', label: 'Regras de custeio', desc: 'Regras financeiras complementares.' },
]

const CLASSIFICACOES_SALARIAIS = {
  A: { label: 'Assistencial', cls: 'azul' },
  B: { label: 'Multiprofissional', cls: 'roxo' },
  C: { label: 'Administrativo', cls: 'cinza' },
}

function classificacaoSalarial(codigo) {
  return CLASSIFICACOES_SALARIAIS[String(codigo || '').trim().toUpperCase()] || { label: codigo || 'Nao classificada', cls: 'cinza' }
}

const STATUS_REGRAS = {
  calculavel: { label: 'Calculavel', cls: 'verde' },
  referencial: { label: 'Referencial', cls: 'azul' },
  revisar: { label: 'Revisar', cls: 'ambar' },
}

function regraStatus(status) {
  return STATUS_REGRAS[status] || { label: status || 'Sem status', cls: 'cinza' }
}

function tipoRegraLabel(tipo) {
  return String(tipo || 'regra')
    .replace(/_/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())
}

function origemLabel(origem) {
  return origem === 'manual' ? 'Manual' : origem === 'cbo' ? 'CBO' : origem === 'seed' ? 'Base' : origem || 'Base'
}

function Head({ secao, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{secao.label}</h1>
        <div className="sub">{secao.desc}</div>
      </div>
      {children && <div className="actions">{children}</div>}
    </div>
  )
}

function SectionNav({ atual }) {
  return (
    <div className="card card-pad mb-2">
      <div className="flex wrap" style={{ gap: 8 }}>
        {SECOES.map((secao) => (
          <Link key={secao.id} to={`/cadastros/${secao.id}`} className={`btn sm ${atual === secao.id ? 'primary' : 'ghost'}`}>
            {secao.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function Mini({ t, v, hint }) {
  return (
    <div className="card kpi">
      <span className="l">{t}</span>
      <span className="v" style={{ fontSize: 18 }}>{v}</span>
      {hint && <span className="t up">{hint}</span>}
    </div>
  )
}

function InlineForm({ campos, onSave, label = 'Adicionar' }) {
  const inicial = Object.fromEntries(campos.map((campo) => [campo.id, campo.default || '']))
  const [aberto, setAberto] = useState(false)
  const [form, setForm] = useState(inicial)
  const set = (id, value) => setForm((prev) => ({ ...prev, [id]: value }))

  if (!aberto) return <button className="btn primary" onClick={() => setAberto(true)}>+ {label}</button>

  return (
    <div className="card card-pad mb-2">
      <div className="form-row">
        {campos.map((campo) => (
          <div className="field" key={campo.id}>
            <label>{campo.label}</label>
            <input value={form[campo.id]} onChange={(event) => set(campo.id, event.target.value)} placeholder={campo.placeholder || ''} />
          </div>
        ))}
      </div>
      <div className="flex" style={{ gap: 8 }}>
        <button className="btn primary" onClick={() => { onSave(form); setForm(inicial); setAberto(false) }}>Salvar</button>
        <button className="btn ghost" onClick={() => { setForm(inicial); setAberto(false) }}>Cancelar</button>
      </div>
    </div>
  )
}

export default function Cadastros() {
  const { secao = 'unidades' } = useParams()
  const [, force] = useState(0)
  const refresh = () => force((n) => n + 1)
  const atual = SECOES.find((item) => item.id === secao) || SECOES[0]

  return (
    <>
      <SectionNav atual={atual.id} />
      {atual.id === 'unidades' && <UnidadesView secao={atual} onChange={refresh} />}
      {atual.id === 'especialidades' && <EspecialidadesView secao={atual} onChange={refresh} />}
      {atual.id === 'salarios' && <SalariosView secao={atual} />}
      {atual.id === 'normativas' && <NormativasView secao={atual} />}
      {atual.id === 'regras' && <RegrasView secao={atual} />}
      {atual.id === 'presets' && <PresetsView secao={atual} />}
      {['setores', 'servicos', 'categorias', 'regimes', 'naturezas', 'rubricas', 'encargos', 'beneficios', 'regras-custeio'].includes(atual.id) && (
        <CatalogoView secao={atual} onChange={refresh} />
      )}
    </>
  )
}

function UnidadesView({ secao, onChange }) {
  const unidades = api.objetosPlanejamento
  const meta = api.cadastroMunicipal
  const porTipo = useMemo(() => {
    const map = new Map()
    unidades.forEach((unidade) => map.set(unidade.tipo || 'Nao informado', (map.get(unidade.tipo || 'Nao informado') || 0) + 1))
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [unidades])

  return (
    <>
      <Head secao={secao}>
        <InlineForm
          label="Nova unidade"
          campos={[
            { id: 'nome', label: 'Nome da unidade', placeholder: 'Ex.: Hospital Municipal Novo' },
            { id: 'sigla', label: 'Sigla' },
            { id: 'cnes', label: 'CNES' },
            { id: 'tipo', label: 'Tipo', default: 'Hospital geral' },
          ]}
          onSave={(dados) => {
            if (!dados.nome.trim()) return
            api.addCadastro('unidades', { ...dados, ap: 'Nao informada', ativo: true, fonte: 'Cadastro manual' })
            onChange()
          }}
        />
      </Head>
      <Note>Fonte inicial: {meta?.fontes?.unidades || 'Unidades_APs - CNES.pdf'}. AP nao informada nesta etapa; dados pessoais nao sao importados.</Note>
      <div className="grid cols-4 mb-2">
        <Kpi valor={unidades.length} label="Unidades cadastradas" />
        <Kpi valor={porTipo.length} label="Tipos identificados" />
        <Kpi valor={unidades.filter((u) => u.ativo !== false).length} label="Ativas" />
        <Kpi valor={unidades.filter((u) => u.origem === 'manual').length} label="Manuais" />
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>CNES</th><th>Unidade</th><th>Tipo</th><th>AP</th><th>Fonte</th><th>Status</th></tr></thead>
            <tbody>
              {unidades.map((unidade) => (
                <tr key={unidade.id || unidade.cnes || unidade.nome}>
                  <td className="tnum">{unidade.cnes || '-'}</td>
                  <td><b>{unidade.nome}</b><div className="muted" style={{ fontSize: 11.5 }}>{unidade.sigla || '-'}</div></td>
                  <td><Badge cls="azul">{unidade.tipo || 'Nao informado'}</Badge></td>
                  <td>{unidade.ap || 'Nao informada'}</td>
                  <td className="muted">{unidade.fonte || '-'}</td>
                  <td><Badge cls={unidade.ativo === false ? 'cinza' : 'verde'} dot>{unidade.ativo === false ? 'Inativa' : 'Ativa'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function EspecialidadesView({ secao, onChange }) {
  const especialidades = api.especialidades
  const meta = api.cadastroMunicipal
  return (
    <>
      <Head secao={secao}>
        <InlineForm
          label="Nova especialidade"
          campos={[{ id: 'nome', label: 'Nome' }, { id: 'tipo', label: 'Tipo', default: 'Assistencial' }]}
          onSave={(dados) => {
            if (!dados.nome.trim()) return
            api.addCadastro('especialidades', { ...dados, fonte: 'Cadastro manual' })
            onChange()
          }}
        />
      </Head>
      <Note>Fonte inicial: {meta?.fontes?.especialidades || 'FatVinculo-2026-06-10 (1).xlsx'}. A carga usa apenas agregados de CBO/ocupacao, sem CPF, CNS, nome ou conselho profissional.</Note>
      <div className="grid cols-4 mb-2">
        <Kpi valor={especialidades.length} label="Especialidades" />
        <Kpi valor={especialidades.filter((item) => item.revisao).length} label="Marcadas para revisar" />
        <Kpi valor={especialidades.reduce((acc, item) => acc + Number(item.quantidadeVinculos || 0), 0)} label="Vinculos agregados" />
        <Kpi valor={especialidades.filter((item) => item.origem === 'manual').length} label="Manuais" />
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Especialidade</th><th>Tipo</th><th>CBOs</th><th className="num">Vinculos</th><th>Fonte</th><th>Revisao</th></tr></thead>
            <tbody>
              {especialidades.map((item) => (
                <tr key={item.id || item.nome}>
                  <td><b>{item.nome}</b><div className="muted" style={{ fontSize: 11.5 }}>{origemLabel(item.origem)}</div></td>
                  <td><Badge cls="azul">{item.tipo || 'Assistencial'}</Badge></td>
                  <td className="muted" style={{ maxWidth: 360 }}>{(item.cbos || []).join(', ') || '-'}</td>
                  <td className="num tnum">{item.quantidadeVinculos || '-'}</td>
                  <td className="muted">{item.fonte || '-'}</td>
                  <td>{item.revisao ? <Badge cls="ambar" dot>Revisar</Badge> : <Badge cls="verde" dot>Ok</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function SalariosView({ secao }) {
  const linhas = api.baseSalarialRhLinhas
  const meta = api.baseSalarialRhInfo
  const totalMensal = linhas.reduce((acc, item) => acc + Number(item.valorFinalSalario || 0), 0)

  return (
    <>
      <Head secao={secao}><Badge cls="verde" dot>Base vigente</Badge></Head>
      <div className="flex wrap mb-2" style={{ gap: 8 }}>
        <button className="btn sm primary">{meta.fonte}</button>
        <span className="origem-tag">{linhas.length} categorias</span>
        <span className="origem-tag">sem setor na chave salarial</span>
        {Object.entries(CLASSIFICACOES_SALARIAIS).map(([codigo, info]) => (
          <span key={codigo} className="origem-tag">{codigo} - {info.label}</span>
        ))}
      </div>
      <Note icon="💰">Base salarial unica por categoria profissional. O RH calculado pela matriz usa a funcao/categoria para encontrar esta referencia; nomes de setor, como UTI, nao entram no salario. <b>Classificacao</b>: Assistencial, Multiprofissional ou Administrativo. <b>Valor final</b> = base salarial + dificil provimento + titulacao.</Note>
      <div className="grid cols-3 mb-2">
        <Mini t="Categorias salariais" v={String(linhas.length)} />
        <Mini t="Fonte" v={meta.fonte} />
        <Mini t="Soma simples da tabela" v={brl(totalMensal)} />
      </div>
      <div className="card mt-2">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Categoria profissional</th>
                <th>Classificacao</th>
                <th className="num">CH referencia</th>
                <th className="num">Hora trabalhada</th>
                <th className="num">Base salarial</th>
                <th className="num">Dificil prov. 50%</th>
                <th className="num">Titulacao 30%</th>
                <th className="num">Valor final</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((item) => {
                const classificacao = classificacaoSalarial(item.classificacao)
                return (
                  <tr key={item.id}>
                    <td><b>{item.categoria}</b></td>
                    <td><Badge cls={classificacao.cls}>{classificacao.label}</Badge></td>
                    <td className="num tnum">{num(item.chReferencia, 0)}h</td>
                    <td className="num tnum">{num(item.horaTrabalhada, 2)}</td>
                    <td className="num tnum">{brl(item.baseSalarial)}</td>
                    <td className="num tnum">{item.gratificacaoDificilProvimento ? brl(item.gratificacaoDificilProvimento) : '-'}</td>
                    <td className="num tnum">{item.gratificacaoTitulacao ? brl(item.gratificacaoTitulacao) : '-'}</td>
                    <td className="num tnum"><b>{brl(item.valorFinalSalario)}</b></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function NormativasView({ secao }) {
  const normativas = api.conjuntosRegras
  const matriz = api.matrizSetores
  return (
    <>
      <Head secao={secao} />
      <Note>A matriz tecnica validada continua sendo a fonte canonica do MVP para o dimensionamento automatico. Normativas manuais permanecem disponiveis para consulta e compatibilidade.</Note>
      <div className="grid cols-3 mb-2">
        <Kpi valor={normativas.length} label="Normativas cadastradas" />
        <Kpi valor={matriz.length} label="Setores na matriz v4" />
        <Kpi valor={api.conjuntosRegras.filter((item) => item.quadro?.length).length} label="Com quadro antigo" />
      </div>
      <div className="card mb-2">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Codigo</th><th>Normativa</th><th>Orgao</th><th>Tipo</th><th>Referencia</th><th className="num">Quadro</th></tr></thead>
            <tbody>
              {normativas.map((item) => (
                <tr key={item.id}>
                  <td><Badge cls="azul">{item.codigo}</Badge></td>
                  <td><b>{item.nome}</b><div className="muted" style={{ fontSize: 11.5 }}>{item.descricao}</div></td>
                  <td>{item.orgao || '-'}</td>
                  <td><Badge>{item.tipo || '-'}</Badge></td>
                  <td className="muted">{item.referencia || '-'}</td>
                  <td className="num">{item.quadro?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Setor matriz</th><th>Macroarea</th><th>Base normativa</th><th>Observacao Rio</th></tr></thead>
            <tbody>
              {matriz.map((setor) => (
                <tr key={setor.slug}>
                  <td><b>{setor.setor}</b></td>
                  <td>{setor.macroarea || '-'}</td>
                  <td className="muted">{setor.baseNormativa || '-'}</td>
                  <td className="muted">{setor.observacaoImplantacao || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function RegrasView({ secao }) {
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('')
  const [tipo, setTipo] = useState('')
  const [detalhe, setDetalhe] = useState(null)
  const resumo = api.resumoRegrasNormativas()
  const regras = api.listRegrasNormativas({ busca, status, tipoRegra: tipo })
  const tipos = useMemo(() => [...new Set(api.regrasNormativas.map((regra) => regra.tipoRegra).filter(Boolean))].sort(), [])

  return (
    <>
      <Head secao={secao}><Badge cls="azul" dot>Biblioteca normativa</Badge></Head>
      <Note>A matriz tecnica v4 continua sendo a fonte canonica calculavel. Manuais e documentos internos entram como metodologia, checklist ou regra em revisao; HFA/HFCF sao apenas referencia de formato do cronograma, sem importar setores ou RH como seed.</Note>
      <div className="grid cols-4 mb-2">
        <Kpi valor={resumo.total} label="Regras cadastradas" />
        <Kpi valor={resumo.calculavel} label="Calculaveis no motor" />
        <Kpi valor={resumo.revisar} label="Em revisao" />
        <Kpi valor={resumo.fontes} label="Fontes rastreadas" />
      </div>

      <div className="card card-pad mb-2">
        <div className="form-row">
          <div className="field">
            <label>Buscar</label>
            <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Setor, fonte, categoria, CME, CTQ, CRM..." />
          </div>
          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Todos</option>
              {Object.entries(STATUS_REGRAS).map(([id, info]) => <option key={id} value={id}>{info.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Tipo de regra</label>
            <select value={tipo} onChange={(event) => setTipo(event.target.value)}>
              <option value="">Todos</option>
              {tipos.map((item) => <option key={item} value={item}>{tipoRegraLabel(item)}</option>)}
            </select>
          </div>
        </div>
        <div className="muted" style={{ fontSize: 12 }}>{num(regras.length, 0)} regra(s) exibida(s). Portarias financeiras/contextuais ficam registradas aqui, mas nao alimentam RH automaticamente.</div>
      </div>

      <div className="card card-pad mb-2">
        <div className="section-title">Referencias de formato de cronograma</div>
        <div className="grid cols-2">
          {api.referenciasCronograma.map((ref) => (
            <div key={ref.id} className="card card-pad" style={{ boxShadow: 'none' }}>
              <b>{ref.arquivo}</b>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>{ref.usoNoMvp}</div>
              <div className="flex wrap mt-1" style={{ gap: 6 }}>
                {ref.partesCronograma.map((parte) => <span key={parte} className="origem-tag">{parte}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Regra</th><th>Aplicacao</th><th>Status</th><th>Parametro / formula</th><th>Categoria / turno</th><th>Fonte</th><th></th>
              </tr>
            </thead>
            <tbody>
              {regras.map((regra) => {
                const st = regraStatus(regra.status)
                return (
                  <tr key={regra.id}>
                    <td>
                      <b>{regra.titulo}</b>
                      <div className="muted" style={{ fontSize: 11.5 }}>{tipoRegraLabel(regra.tipoRegra)} · {regra.origem === 'matriz' ? 'Matriz v4' : 'Biblioteca complementar'}</div>
                    </td>
                    <td>{regra.setor || (regra.setorSlugs || []).join(', ') || regra.aplicacaoGeral || '-'}</td>
                    <td><Badge cls={st.cls} dot>{st.label}</Badge></td>
                    <td>
                      <div>{regra.parametroDimensionador || '-'}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>{regra.formula || '-'}</div>
                    </td>
                    <td>
                      <div>{regra.categoriaProfissional || '-'}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>{regra.regimeTurno || '-'}</div>
                    </td>
                    <td>
                      <b>{regra.fonte?.orgao || regra.fonteNormativaTexto || '-'}</b>
                      <div className="muted" style={{ fontSize: 11.5 }}>{regra.fonte?.arquivo || regra.fonte?.titulo || '-'}</div>
                    </td>
                    <td><button className="btn sm ghost" onClick={() => setDetalhe(regra)}>Detalhar</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {detalhe && <RegraDetalheModal regra={detalhe} onClose={() => setDetalhe(null)} />}
    </>
  )
}

function RegraDetalheModal({ regra, onClose }) {
  const st = regraStatus(regra.status)
  const memoria = regra.memoriaCalculo || {}
  return (
    <Modal title="Memoria normativa" icon="📜" onClose={onClose} lg>
      <div className="spread mb-2">
        <div>
          <h3 style={{ margin: 0, fontSize: 17 }}>{regra.titulo}</h3>
          <div className="muted" style={{ fontSize: 12.5 }}>{tipoRegraLabel(regra.tipoRegra)} · {regra.origem === 'matriz' ? 'Matriz v4' : 'Biblioteca complementar'}</div>
        </div>
        <Badge cls={st.cls} dot>{st.label}</Badge>
      </div>
      <div className="memo-line"><span className="k">Fonte</span><span className="v">{regra.fonte?.titulo || regra.fonteNormativaTexto || '-'}</span></div>
      <div className="memo-line"><span className="k">Orgao / esfera</span><span className="v">{regra.fonte?.orgao || '-'} · {regra.fonte?.esfera || regra.esferaNormativa || '-'}</span></div>
      <div className="memo-line"><span className="k">Arquivo</span><span className="v">{regra.fonte?.arquivo || '-'}</span></div>
      {regra.fontesComplementares?.length > 0 && <div className="memo-line"><span className="k">Fontes complementares</span><span className="v">{regra.fontesComplementares.map((fonte) => fonte.titulo).join(' · ')}</span></div>}
      <div className="divider" />
      <div className="memo-line"><span className="k">Parametro dimensionador</span><span className="v">{regra.parametroDimensionador || '-'}</span></div>
      <div className="memo-line"><span className="k">Formula / metodo</span><span className="v">{regra.formula || '-'}</span></div>
      <div className="memo-line"><span className="k">Categoria profissional</span><span className="v">{regra.categoriaProfissional || '-'}</span></div>
      <div className="memo-line"><span className="k">Regime / turno</span><span className="v">{regra.regimeTurno || '-'}</span></div>
      <div className="memo-line"><span className="k">Validade territorial</span><span className="v">{regra.validadeTerritorial || '-'}</span></div>
      {regra.url && <div className="memo-line"><span className="k">URL</span><span className="v"><a href={regra.url} target="_blank" rel="noreferrer">{regra.url}</a></span></div>}
      <div className="divider" />
      <div className="section-title">Memoria de calculo</div>
      {Object.entries(memoria).map(([key, value]) => (
        <div key={key} className="memo-line"><span className="k">{tituloKey(key)}</span><span className="v">{String(value || '-')}</span></div>
      ))}
      {regra.checklist?.length > 0 && (
        <>
          <div className="divider" />
          <div className="section-title">Checklist</div>
          {regra.checklist.map((item) => <div key={item} className="memo-line"><span className="k">Item</span><span className="v">{item}</span></div>)}
        </>
      )}
    </Modal>
  )
}

function PresetsView({ secao }) {
  return (
    <>
      <Head secao={secao} />
      <Note>Perfis hospitalares sao templates editaveis para iniciar um plano. O calculo normativo continua acontecendo por setor, a partir da matriz validada.</Note>
      <div className="grid cols-3 mb-2">
        {api.perfisHospitalares.map((perfil) => (
          <div className="card card-pad" key={perfil.id}>
            <div className="spread mb-2">
              <h3 style={{ fontSize: 15 }}>{perfil.nome}</h3>
              <Badge cls="azul">{perfil.setores.length} setores</Badge>
            </div>
            <p className="muted" style={{ fontSize: 12.5 }}>{perfil.descricao}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Setor automatico</th><th>Macroarea</th><th>Fonte normativa</th></tr></thead>
            <tbody>
              {api.matrizSetores.map((setor) => (
                <tr key={setor.slug}>
                  <td><b>{setor.setor}</b></td>
                  <td>{setor.macroarea || '-'}</td>
                  <td className="muted">{setor.baseNormativa || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function CatalogoView({ secao, onChange }) {
  const dados = catalogoDados(secao.id)
  const form = formCatalogo(secao.id)
  return (
    <>
      <Head secao={secao}>
        {form && (
          <InlineForm
            label={`Novo ${secao.label.toLowerCase()}`}
            campos={form.campos}
            onSave={(valores) => {
              if (!valores.nome?.trim()) return
              api.addCadastro(form.secaoApi, form.transform(valores))
              onChange()
            }}
          />
        )}
      </Head>
      <div className="grid cols-3 mb-2">
        <Kpi valor={dados.length} label="Registros" />
        <Kpi valor={dados.filter((item) => item.origem === 'manual').length} label="Manuais" />
        <Kpi valor={secao.label} label="Cadastro" />
      </div>
      {dados.length === 0 ? <Empty>Nenhum registro cadastrado.</Empty> : <GenericTable dados={dados} />}
    </>
  )
}

function catalogoDados(secao) {
  return ({
    setores: api.tiposSetor,
    servicos: api.servicos,
    categorias: api.categoriasProfissionais,
    regimes: api.regimesTrabalho,
    naturezas: api.naturezas,
    rubricas: api.rubricas,
    encargos: api.encargosGrupos,
    beneficios: api.beneficiosRegras,
    'regras-custeio': api.regrasCusteio,
  })[secao] || []
}

function formCatalogo(secao) {
  return ({
    setores: { secaoApi: 'setores', campos: [{ id: 'nome', label: 'Nome' }], transform: (v) => ({ nome: v.nome, calculavel: true }) },
    categorias: { secaoApi: 'categorias', campos: [{ id: 'nome', label: 'Nome' }, { id: 'grupo', label: 'Grupo' }, { id: 'conselho', label: 'Conselho' }], transform: (v) => v },
    regimes: { secaoApi: 'regimes', campos: [{ id: 'nome', label: 'Nome' }, { id: 'cargaSemanal', label: 'Carga semanal' }, { id: 'escala', label: 'Escala' }], transform: (v) => ({ ...v, cargaSemanal: Number(v.cargaSemanal || 0) }) },
    naturezas: { secaoApi: 'naturezas', campos: [{ id: 'nome', label: 'Nome' }], transform: (v) => ({ nome: v.nome, noturno: false }) },
    servicos: { secaoApi: 'servicos', campos: [{ id: 'nome', label: 'Nome' }, { id: 'setor', label: 'Setor' }, { id: 'especialidade', label: 'Especialidade' }], transform: (v) => v },
  })[secao]
}

function GenericTable({ dados }) {
  const keys = [...new Set(dados.flatMap((item) => Object.keys(item || {})))].filter((key) => !['sal', 'children'].includes(key)).slice(0, 8)
  return (
    <div className="card">
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr>{keys.map((key) => <th key={key}>{tituloKey(key)}</th>)}</tr></thead>
          <tbody>
            {dados.map((item, index) => (
              <tr key={item.id || item.nome || index}>
                {keys.map((key) => <td key={key}>{renderValue(key, item[key])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function tituloKey(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (char) => char.toUpperCase())
}

function renderValue(key, value) {
  if (value == null || value === '') return <span className="muted">-</span>
  if (typeof value === 'boolean') return <Badge cls={value ? 'verde' : 'cinza'}>{value ? 'Sim' : 'Nao'}</Badge>
  if (Array.isArray(value)) return <span className="muted">{value.join(', ')}</span>
  if (typeof value === 'number' && /valor|base|salario/i.test(key)) return <span className="tnum">{brl(value)}</span>
  if (typeof value === 'number' && /pct|percentual/i.test(key)) return <span className="tnum">{pct(value)}</span>
  if (String(key).includes('competencia')) return competenciaLabel(value)
  if (typeof value === 'object') return <span className="muted">{JSON.stringify(value)}</span>
  return String(value)
}
