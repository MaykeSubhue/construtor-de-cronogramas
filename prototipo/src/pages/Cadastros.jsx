import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as api from '../mock/api.js'
import { Badge, Empty, Kpi, Modal, Note } from '../components/ui.jsx'
import { brl, competenciaLabel, num, pct } from '../lib/format.js'

const SECOES = [
  { id: 'unidades', label: 'Unidades', desc: 'Unidades municipais e unidades manuais do planejamento.' },
  { id: 'especialidades', label: 'Especialidades', desc: 'Especialidades assistenciais normalizadas.' },
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

const STATUS_CATEGORIAS = {
  validado: { label: 'Validado', cls: 'verde' },
  revisar_financeiro: { label: 'Revisar financeiro', cls: 'ambar' },
  revisar: { label: 'Revisar', cls: 'vermelho' },
  manual: { label: 'Manual', cls: 'azul' },
}

function categoriaStatus(status) {
  return STATUS_CATEGORIAS[status] || { label: status || 'Revisar', cls: 'cinza' }
}

function tipoRegraLabel(tipo) {
  return String(tipo || 'regra')
    .replace(/_/g, ' ')
    .replace(/^./, (char) => char.toUpperCase())
}

function origemLabel(origem) {
  return origem === 'manual' ? 'Manual' : origem === 'cbo' ? 'Base' : origem === 'seed' ? 'Base' : origem || 'Base'
}

function normalizarBusca(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function listaCurta(itens, limite = 3) {
  const arr = Array.isArray(itens) ? itens.filter(Boolean) : []
  if (!arr.length) return '-'
  const visiveis = arr.slice(0, limite).join(', ')
  return arr.length > limite ? `${visiveis} +${arr.length - limite}` : visiveis
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
      {atual.id === 'setores' && <TiposSetorView secao={atual} onChange={refresh} />}
      {atual.id === 'servicos' && <ServicosView secao={atual} onChange={refresh} />}
      {atual.id === 'categorias' && <CategoriasView secao={atual} onChange={refresh} />}
      {atual.id === 'rubricas' && <RubricasView secao={atual} onChange={refresh} />}
      {['regimes', 'naturezas', 'encargos', 'beneficios', 'regras-custeio'].includes(atual.id) && (
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
      <Note>Fonte inicial: {meta?.fontes?.especialidades || 'FatVinculo-2026-06-10 (1).xlsx'}. A carga usa apenas dados agregados, sem CPF, CNS, nome ou conselho profissional.</Note>
      <div className="grid cols-4 mb-2">
        <Kpi valor={especialidades.length} label="Especialidades" />
        <Kpi valor={especialidades.filter((item) => item.revisao).length} label="Marcadas para revisar" />
        <Kpi valor={especialidades.reduce((acc, item) => acc + Number(item.quantidadeVinculos || 0), 0)} label="Vinculos agregados" />
        <Kpi valor={especialidades.filter((item) => item.origem === 'manual').length} label="Manuais" />
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Especialidade</th><th>Tipo</th><th className="num">Vinculos</th><th>Fonte</th><th>Revisao</th></tr></thead>
            <tbody>
              {especialidades.map((item) => (
                <tr key={item.id || item.nome}>
                  <td><b>{item.nome}</b><div className="muted" style={{ fontSize: 11.5 }}>{origemLabel(item.origem)}</div></td>
                  <td><Badge cls="azul">{item.tipo || 'Assistencial'}</Badge></td>
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

function CategoriasView({ secao, onChange }) {
  const [busca, setBusca] = useState('')
  const [grupo, setGrupo] = useState('')
  const [conselho, setConselho] = useState('')
  const [status, setStatus] = useState('')
  const [salario, setSalario] = useState('')
  const dados = api.categoriasProfissionais
  const meta = api.categoriasProfissionaisInfo
  const grupos = useMemo(() => [...new Set(dados.map((item) => item.grupo).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [dados])
  const conselhos = useMemo(() => [...new Set(dados.map((item) => item.conselho).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [dados])
  const buscaNorm = normalizarBusca(busca)
  const revisar = dados.filter((item) => ['revisar', 'revisar_financeiro'].includes(item.status)).length
  const filtrados = dados.filter((item) => {
    const texto = normalizarBusca([
      item.nome,
      item.grupo,
      item.conselho,
      item.fonte,
      item.categoriaSalarial,
    ].join(' '))
    if (buscaNorm && !texto.includes(buscaNorm)) return false
    if (grupo && item.grupo !== grupo) return false
    if (conselho && item.conselho !== conselho) return false
    if (status && item.status !== status) return false
    if (salario === 'com' && !item.temSalario) return false
    if (salario === 'sem' && item.temSalario) return false
    return true
  })

  return (
    <>
      <Head secao={secao}>
        <InlineForm
          label="Nova categoria"
          campos={[
            { id: 'nome', label: 'Nome da categoria' },
            { id: 'grupo', label: 'Grupo', default: 'Manual' },
            { id: 'conselho', label: 'Conselho', default: '—' },
          ]}
          onSave={(dadosForm) => {
            if (!dadosForm.nome.trim()) return
            api.addCadastro('categorias', {
              ...dadosForm,
              fonte: 'Cadastro manual',
              status: 'manual',
              ativo: true,
            })
            onChange()
          }}
        />
      </Head>
      <Note>Cadastro simplificado por categoria profissional. A base salarial é a referência principal; itens sem correspondência salarial segura ficam para revisão financeira.</Note>
      <div className="flex wrap mb-2" style={{ gap: 8 }}>
        <span className="origem-tag">{meta.fonteSalarial}</span>
        <span className="origem-tag">{meta.totalCategoriasSalariaisUnicas} categorias salariais únicas</span>
        <span className="origem-tag">cadastro simplificado</span>
      </div>
      <div className="grid cols-5 mb-2">
        <Kpi valor={dados.length} label="Categorias" />
        <Kpi valor={dados.filter((item) => item.temSalario).length} label="Com salário" />
        <Kpi valor={dados.filter((item) => !item.temSalario).length} label="Sem salário" />
        <Kpi valor={dados.filter((item) => item.origem === 'manual').length} label="Manuais" />
        <Kpi valor={revisar} label="Revisar" />
      </div>

      <div className="card card-pad mb-2">
        <div className="form-row three">
          <div className="field">
            <label>Buscar</label>
            <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Nome, grupo, conselho ou salário..." />
          </div>
          <div className="field">
            <label>Grupo</label>
            <select value={grupo} onChange={(event) => setGrupo(event.target.value)}>
              <option value="">Todos</option>
              {grupos.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Conselho</label>
            <select value={conselho} onChange={(event) => setConselho(event.target.value)}>
              <option value="">Todos</option>
              {conselhos.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Todos</option>
              {Object.entries(STATUS_CATEGORIAS).map(([id, info]) => <option key={id} value={id}>{info.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Salário vinculado</label>
            <select value={salario} onChange={(event) => setSalario(event.target.value)}>
              <option value="">Todos</option>
              <option value="com">Com salário</option>
              <option value="sem">Sem salário</option>
            </select>
          </div>
        </div>
        <div className="muted" style={{ fontSize: 12 }}>{num(filtrados.length, 0)} categoria(s) exibida(s).</div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Grupo</th>
                <th>Conselho</th>
                <th>Salário vinculado</th>
                <th>Fonte</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item) => {
                const statusInfo = categoriaStatus(item.status)
                return (
                  <tr key={item.id || item.slug || item.nome}>
                    <td><b>{item.nome}</b></td>
                    <td><Badge cls={item.grupo === 'Administrativo' ? 'cinza' : item.grupo === 'Multiprofissional' ? 'roxo' : 'azul'}>{item.grupo || '-'}</Badge></td>
                    <td>{item.conselho || '—'}</td>
                    <td>
                      {item.temSalario ? (
                        <>
                          <Badge cls="verde" dot>{item.classificacaoSalarial || 'Com salário'}</Badge>
                          <div className="muted" style={{ fontSize: 11.5 }}>{item.categoriaSalarial || listaCurta(item.categoriasSalariaisFonte?.map((sal) => sal.categoria), 1)}</div>
                        </>
                      ) : (
                        <Badge cls="ambar" dot>Sem salário</Badge>
                      )}
                    </td>
                    <td className="muted" style={{ maxWidth: 260 }}>{item.fonte || '-'}</td>
                    <td><Badge cls={statusInfo.cls} dot>{statusInfo.label}</Badge></td>
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
  const cronogramas = api.listCronogramasProntos()
  const grupos = api.gruposModelosCronograma
  const [grupo, setGrupo] = useState('')
  const [detalheId, setDetalheId] = useState(null)
  const filtrados = grupo ? cronogramas.filter((modelo) => modelo.grupoId === grupo) : cronogramas
  const detalhe = detalheId ? api.getCronogramaPronto(detalheId) : null
  return (
    <>
      <Head secao={secao} />
      <Note>Perfis hospitalares iniciam planos normativos. Cronogramas prontos copiam estrutura, equipes e componentes salariais das planilhas; encargos, benefícios e cronograma são calculados pelo app.</Note>
      <div className="section-title">Cronogramas prontos</div>
      <div className="pill-toggle mb-2">
        <button className={!grupo ? 'active' : ''} onClick={() => setGrupo('')}>Todos</button>
        {grupos.map((item) => (
          <button key={item.id} className={grupo === item.id ? 'active' : ''} onClick={() => setGrupo(item.id)}>
            {item.descricao}
          </button>
        ))}
      </div>
      <div className="grid cols-3 mb-2">
        <Mini t="Modelos exibidos" v={String(filtrados.length)} />
        <Mini t="Setores / abas" v={String(filtrados.reduce((acc, modelo) => acc + modelo.resumo.setoresAtivos, 0))} />
        <Mini t="Equipe importada" v={num(filtrados.reduce((acc, modelo) => acc + modelo.resumo.equipeTotal, 0), 0)} />
      </div>
      <div className="grid cols-3 mb-2">
        {filtrados.map((modelo) => (
          <div className="card card-pad" key={modelo.id}>
            <div className="spread mb-2">
              <h3 style={{ fontSize: 15 }}>{modelo.nome}</h3>
              <Badge cls={modelo.resumo.linhasRevisao ? 'ambar' : 'verde'}>{modelo.resumo.linhasRevisao ? 'Revisar' : 'Ok'}</Badge>
            </div>
            <p className="muted" style={{ fontSize: 12.5 }}>{modelo.descricao}</p>
            <div className="memo-line mt-2"><span className="k">Grupo</span><span className="v"><Badge cls="azul">{modelo.grupoId} · {modelo.grupoNome}</Badge></span></div>
            <div className="memo-line mt-2"><span className="k">Abas / linhas</span><span className="v">{modelo.resumo.setoresAtivos} abas · {modelo.resumo.linhasEquipe} linhas</span></div>
            <div className="memo-line"><span className="k">Equipe importada</span><span className="v">{num(modelo.resumo.equipeTotal, 0)} profissionais</span></div>
            <div className="memo-line mt-2"><span className="k">Fonte</span><span className="v">{modelo.fonte}</span></div>
            <div className="memo-line"><span className="k">Custeio</span><span className="v">{pct((modelo.parametrosCronograma?.custeioOperacionalPct || 0) * 100)}</span></div>
            <Note icon="i">Modelo clonável com equipes e remuneração da planilha de origem.</Note>
            <button className="btn mt-2" onClick={() => setDetalheId(modelo.id)} style={{ width: '100%', justifyContent: 'center' }}>
              Ver detalhes do modelo
            </button>
            {modelo.planoReferenciaId && (
              <Link className="btn mt-2" to={`/plano/${modelo.planoReferenciaId}/construcao`} style={{ width: '100%', justifyContent: 'center' }}>
                Abrir plano finalizado
              </Link>
            )}
            <Link className="btn primary mt-2" to={`/novo?modo=modelo&modelo=${modelo.id}`} style={{ width: '100%', justifyContent: 'center' }}>
              Criar cronograma a partir deste modelo
            </Link>
          </div>
        ))}
        {!filtrados.length && <Empty icon="🧩"><h3>Nenhum modelo neste filtro</h3></Empty>}
      </div>
      {detalhe && <CronogramaProntoDetalheModal modelo={detalhe} onClose={() => setDetalheId(null)} />}

      <div className="section-title">Perfis normativos</div>
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

function CronogramaProntoDetalheModal({ modelo, onClose }) {
  const [setorId, setSetorId] = useState(modelo.setores?.[0]?.id || '')
  const setor = modelo.setores?.find((item) => item.id === setorId) || modelo.setores?.[0]
  const resumoFinanceiro = modelo.resumoFinanceiro || {}
  const semCebas = resumoFinanceiro.semCebas || {}
  const comCebas = resumoFinanceiro.comCebas || {}
  const reducao = resumoFinanceiro.reducao || {}
  const resumoDisponivel = Number.isFinite(semCebas.contrato) && Number.isFinite(comCebas.contrato)
  return (
    <Modal title={modelo.nome} icon="🧾" onClose={onClose} lg
      footer={<>
        <button className="btn ghost" onClick={onClose}>Fechar</button>
        {modelo.planoReferenciaId && <Link className="btn" to={`/plano/${modelo.planoReferenciaId}/construcao`}>Abrir plano finalizado</Link>}
        <Link className="btn primary" to={`/novo?modo=modelo&modelo=${modelo.id}`}>Criar cronograma</Link>
      </>}>
      <div className="grid cols-4 mb-2">
        <Mini t="Sem CEBAS · 24 meses" v={brl(semCebas.contrato)} hint={modelo.origemPlanoId ? 'Calculado no fechamento' : 'Total histórico da planilha'} />
        <Mini t="Com CEBAS · 24 meses" v={brl(comCebas.contrato)} hint={modelo.origemPlanoId ? 'Calculado no fechamento' : 'Total histórico da planilha'} />
        <Mini t="Economia CEBAS" v={brl(reducao.valor)} hint="Diferença no contrato" />
        <Mini t="Redução" v={pct(reducao.percentual == null ? null : reducao.percentual * 100, 2)} hint="Comparação em 24 meses" />
      </div>
      <div className="table-wrap mb-2">
        <table className="tbl">
          <thead><tr><th>Cenário da planilha</th><th className="num">Mês 01</th><th className="num">1º ano</th><th className="num">2º ano</th><th className="num">Total 24 meses</th></tr></thead>
          <tbody>
            <tr>
              <td><Badge cls="cinza" dot>Sem CEBAS</Badge></td>
              <td className="num tnum">{brl(semCebas.mes1)}</td>
              <td className="num tnum">{brl(semCebas.ano1)}</td>
              <td className="num tnum">{brl(semCebas.ano2)}</td>
              <td className="num tnum"><b>{brl(semCebas.contrato)}</b></td>
            </tr>
            <tr>
              <td><Badge cls="verde" dot>Com CEBAS</Badge></td>
              <td className="num tnum">{brl(comCebas.mes1)}</td>
              <td className="num tnum">{brl(comCebas.ano1)}</td>
              <td className="num tnum">{brl(comCebas.ano2)}</td>
              <td className="num tnum"><b>{brl(comCebas.contrato)}</b></td>
            </tr>
          </tbody>
        </table>
      </div>
      <Note icon={resumoDisponivel ? "i" : "!"}>
        {resumoDisponivel
          ? modelo.origemPlanoId
            ? <>Resumo calculado pelo aplicativo no momento da finalização do plano. Ao clonar, os valores continuam ligados às equipes e bases vigentes.</>
            : <>Resumo histórico extraído da aba <b>{resumoFinanceiro.fonteAba || 'RESUMO'}</b>. Ao criar um plano, a remuneração é preservada e o aplicativo calcula encargos, benefícios e cenários.</>
          : resumoFinanceiro.observacao || 'A planilha de origem não possui totais financeiros consolidados disponíveis.'}
      </Note>
      <div className="memo-line"><span className="k">Hospital</span><span className="v">{modelo.hospitalNome || modelo.unidadeModelo}</span></div>
      <div className="memo-line"><span className="k">Fonte</span><span className="v">{modelo.fonte}</span></div>
      <div className="memo-line"><span className="k">Custeio / VT / VR</span><span className="v">{pct((modelo.parametrosCronograma?.custeioOperacionalPct || 0) * 100)} · VT {modelo.parametrosCronograma?.valeTransporteDia || 0} · VR {modelo.parametrosCronograma?.valeRefeicaoDia || 0}</span></div>
      <Note icon="i">A tabela de equipes abaixo mostra as linhas importadas da planilha e continua sendo apenas a base clonável do modelo.</Note>

      <div className="form-row mt-2">
        <div className="field">
          <label>Aba / setor importado</label>
          <select value={setor?.id || ''} onChange={(event) => setSetorId(event.target.value)}>
            {(modelo.setores || []).map((item) => (
              <option key={item.id} value={item.id}>{item.abaOrigem} · {item.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {setor && (
        <div className="card mt-2" style={{ boxShadow: 'none' }}>
          <div className="table-wrap">
            <table className="tbl team-grid">
              <thead><tr><th>Categoria profissional</th><th className="num">CH</th><th className="num">Quantitativo</th><th className="num">Qtd. por turno 12h</th><th className="num">Salário base</th><th className="num">Insalubridade</th><th className="num">Gratificação RT / chefia</th><th className="num">Titulação</th><th className="num">Adic. noturno</th><th className="num">Remuneração bruta</th><th className="num">Salário total</th><th>Status</th></tr></thead>
              <tbody>
                {setor.linhas.map((linha) => {
                  const comp = linha.componentesPlanilha || {}
                  const remuneracao = Number(comp.remuneracaoBruta) || (Number(comp.base) || 0) + (Number(comp.insalubridade) || 0) + (Number(comp.gratificacao) || 0) + (Number(comp.titulacao) || 0) + (Number(comp.adicionalNoturno) || 0)
                  const total = Number(comp.salarioTotal) || remuneracao * Number(linha.quantidade || 0)
                  return (
                    <tr key={linha.id}>
                      <td><b>{linha.categoria}</b><div className="muted" style={{ fontSize: 11.5 }}>Linha {linha.linhaOrigem} · {setor.abaOrigem}</div></td>
                      <td className="num tnum">{linha.chs}h</td>
                      <td className="num tnum">{num(linha.quantidade, 0)}</td>
                      <td className="num tnum">{linha.quantidadeTurno ?? '-'}</td>
                      <td className="num tnum">{brl(comp.base || 0)}</td>
                      <td className="num tnum">{comp.insalubridade ? brl(comp.insalubridade) : '-'}</td>
                      <td className="num tnum">{comp.gratificacao ? brl(comp.gratificacao) : '-'}</td>
                      <td className="num tnum">{comp.titulacao ? brl(comp.titulacao) : '-'}</td>
                      <td className="num tnum">{comp.adicionalNoturno ? brl(comp.adicionalNoturno) : '-'}</td>
                      <td className="num tnum">{brl(remuneracao)}</td>
                      <td className="num tnum"><b>{brl(total)}</b></td>
                      <td>{linha.revisar ? <Badge cls="ambar" dot>Revisar</Badge> : <Badge cls="verde" dot>Ok</Badge>}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  )
}

function TiposSetorView({ secao, onChange }) {
  const [classe, setClasse] = useState('')
  const [fonte, setFonte] = useState('')
  const dados = api.tiposSetor
  const fontes = [...new Set(dados.map((item) => item.fonte).filter(Boolean))].sort()
  const filtrados = dados.filter((item) => {
    if (classe && item.classe !== classe) return false
    if (fonte && item.fonte !== fonte) return false
    return true
  })

  return (
    <>
      <Head secao={secao}>
        <InlineForm
          label="Novo tipo"
          campos={[{ id: 'nome', label: 'Nome' }]}
          onSave={(dadosForm) => {
            if (!dadosForm.nome.trim()) return
            api.addCadastro('setores', { nome: dadosForm.nome, classe: 'dimensionador', usoMotor: true, calculavel: true, ativo: true })
            onChange()
          }}
        />
      </Head>
      <Note>Tipos dimensionadores alimentam o motor de construcao. Macroareas organizam a matriz e nao aparecem no seletor de criacao de setor calculavel.</Note>
      <div className="grid cols-4 mb-2">
        <Kpi valor={dados.length} label="Tipos cadastrados" />
        <Kpi valor={dados.filter((item) => item.classe === 'dimensionador').length} label="Dimensionadores" />
        <Kpi valor={dados.filter((item) => item.classe === 'macroarea').length} label="Macroareas" />
        <Kpi valor={dados.filter((item) => item.origem === 'manual').length} label="Manuais" />
      </div>
      <div className="card card-pad mb-2">
        <div className="form-row">
          <div className="field">
            <label>Classe</label>
            <select value={classe} onChange={(event) => setClasse(event.target.value)}>
              <option value="">Todas</option>
              <option value="dimensionador">Dimensionador</option>
              <option value="macroarea">Macroarea</option>
            </select>
          </div>
          <div className="field">
            <label>Fonte</label>
            <select value={fonte} onChange={(event) => setFonte(event.target.value)}>
              <option value="">Todas</option>
              {fontes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Tipo</th><th>Classe</th><th>Uso no motor</th><th>Variaveis</th><th>Fonte</th><th>Status</th></tr></thead>
            <tbody>
              {filtrados.map((item) => (
                <tr key={item.id || item.slug || item.nome}>
                  <td><b>{item.nome}</b><div className="muted" style={{ fontSize: 11.5 }}>{item.slug || '-'}</div></td>
                  <td><Badge cls={item.classe === 'dimensionador' ? 'azul' : 'roxo'}>{item.classe || '-'}</Badge></td>
                  <td><Badge cls={item.usoMotor ? 'verde' : 'cinza'} dot>{item.usoMotor ? 'Sim' : 'Nao'}</Badge></td>
                  <td className="muted">{(item.variaveis || []).join(', ') || '-'}</td>
                  <td className="muted">{item.fonte || '-'}</td>
                  <td><Badge cls={item.ativo === false ? 'cinza' : 'verde'} dot>{item.ativo === false ? 'Inativo' : 'Ativo'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function ServicosView({ secao, onChange }) {
  const [busca, setBusca] = useState('')
  const [macroarea, setMacroarea] = useState('')
  const [status, setStatus] = useState('')
  const dados = api.servicos
  const macroareas = [...new Set(dados.map((item) => item.macroarea).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  const buscaNorm = normalizarBusca(busca)
  const filtrados = dados.filter((item) => {
    const texto = normalizarBusca([item.nome, item.macroarea, item.subtipo, item.baseNormativa, item.fonte].join(' '))
    if (buscaNorm && !texto.includes(buscaNorm)) return false
    if (macroarea && item.macroarea !== macroarea) return false
    if (status && item.status !== status) return false
    return true
  })

  return (
    <>
      <Head secao={secao}>
        <InlineForm
          label="Novo servico"
          campos={[
            { id: 'nome', label: 'Nome' },
            { id: 'macroarea', label: 'Macroarea', default: 'Manual' },
            { id: 'especialidade', label: 'Especialidade' },
          ]}
          onSave={(dadosForm) => {
            if (!dadosForm.nome.trim()) return
            api.addCadastro('servicos', {
              nome: dadosForm.nome,
              setor: dadosForm.nome,
              macroarea: dadosForm.macroarea || 'Manual',
              especialidade: dadosForm.especialidade,
              status: 'referencial',
              fonte: 'Cadastro manual',
              ativo: true,
            })
            onChange()
          }}
        />
      </Head>
      <Note>Servicos sao o catalogo normativo-operacional da matriz. Eles nao representam automaticamente uma unidade fisica com leitos/salas; isso acontece quando o plano e construido.</Note>
      <div className="grid cols-4 mb-2">
        <Kpi valor={dados.length} label="Servicos cadastrados" />
        <Kpi valor={dados.filter((item) => item.origem === 'matriz').length} label="Da matriz v4" />
        <Kpi valor={dados.filter((item) => item.status === 'calculavel').length} label="Com regra de RH" />
        <Kpi valor={dados.filter((item) => item.origem === 'manual').length} label="Manuais" />
      </div>
      <div className="card card-pad mb-2">
        <div className="form-row">
          <div className="field">
            <label>Buscar</label>
            <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="UTI, CME, centro cirurgico..." />
          </div>
          <div className="field">
            <label>Macroarea</label>
            <select value={macroarea} onChange={(event) => setMacroarea(event.target.value)}>
              <option value="">Todas</option>
              {macroareas.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Todos</option>
              <option value="calculavel">Calculavel</option>
              <option value="referencial">Referencial</option>
            </select>
          </div>
        </div>
        <div className="muted" style={{ fontSize: 12 }}>{num(filtrados.length, 0)} servico(s) exibido(s).</div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Servico</th><th>Macroarea / subtipo</th><th className="num">Regras RH</th><th>Parametros</th><th>Fonte</th><th>Status</th></tr></thead>
            <tbody>
              {filtrados.map((item) => (
                <tr key={item.id || item.matrizSetorSlug || item.nome}>
                  <td><b>{item.nome}</b><div className="muted" style={{ fontSize: 11.5 }}>{item.matrizSetorSlug || item.slug || origemLabel(item.origem)}</div></td>
                  <td>{item.macroarea || '-'}<div className="muted" style={{ fontSize: 11.5 }}>{item.subtipo || '-'}</div></td>
                  <td className="num tnum">{num(item.qtdRegrasRh || 0, 0)}</td>
                  <td className="muted" style={{ maxWidth: 360 }}>{(item.parametrosDimensionadores || []).join(', ') || item.metricaPrincipal || '-'}</td>
                  <td className="muted">{item.fonte || '-'}</td>
                  <td><Badge cls={item.status === 'calculavel' ? 'verde' : 'azul'} dot>{item.status || 'referencial'}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function RubricasView({ secao, onChange }) {
  const [busca, setBusca] = useState('')
  const [grupo, setGrupo] = useState('')
  const [tipo, setTipo] = useState('')
  const dados = api.rubricas
  const grupos = [...new Set(dados.map((item) => item.grupo).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  const tipos = [...new Set(dados.map((item) => item.tipo).filter(Boolean))].sort()
  const buscaNorm = normalizarBusca(busca)
  const filtrados = dados.filter((item) => {
    const texto = normalizarBusca([item.nome, item.grupo, item.tipo, item.incidencia, item.modelo, item.fonte].join(' '))
    if (buscaNorm && !texto.includes(buscaNorm)) return false
    if (grupo && item.grupo !== grupo) return false
    if (tipo && item.tipo !== tipo) return false
    return true
  })

  return (
    <>
      <Head secao={secao}>
        <InlineForm
          label="Nova rubrica"
          campos={[
            { id: 'nome', label: 'Nome' },
            { id: 'grupo', label: 'Grupo', default: 'Custeio operacional' },
            { id: 'tipo', label: 'Tipo', default: 'custeio' },
            { id: 'forma', label: 'Forma', default: 'valor' },
            { id: 'percentual', label: 'Percentual' },
          ]}
          onSave={(dadosForm) => {
            if (!dadosForm.nome.trim()) return
            api.addCadastro('rubricas', {
              ...dadosForm,
              percentual: Number(dadosForm.percentual || 0),
              fonte: 'Cadastro manual',
              entraCronograma: true,
            })
            onChange()
          }}
        />
      </Head>
      <Note>Rubricas organizam folha, encargos, beneficios e blocos financeiros do cronograma. Nesta etapa elas estruturam o cadastro; o motor financeiro atual continua usando as formulas ja existentes.</Note>
      <div className="grid cols-4 mb-2">
        <Kpi valor={dados.length} label="Rubricas cadastradas" />
        <Kpi valor={grupos.length} label="Grupos financeiros" />
        <Kpi valor={dados.filter((item) => item.entraCronograma !== false).length} label="Entram no cronograma" />
        <Kpi valor={dados.filter((item) => item.origem === 'manual').length} label="Manuais" />
      </div>
      <div className="card card-pad mb-2">
        <div className="form-row">
          <div className="field">
            <label>Buscar</label>
            <input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="FGTS, CEBAS, investimento..." />
          </div>
          <div className="field">
            <label>Grupo</label>
            <select value={grupo} onChange={(event) => setGrupo(event.target.value)}>
              <option value="">Todos</option>
              {grupos.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Tipo</label>
            <select value={tipo} onChange={(event) => setTipo(event.target.value)}>
              <option value="">Todos</option>
              {tipos.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Rubrica</th><th>Grupo</th><th>Tipo</th><th>Forma</th><th>Incidencia</th><th className="num">Valor / %</th><th>Cronograma</th><th>Fonte</th></tr></thead>
            <tbody>
              {filtrados.map((item) => (
                <tr key={item.id || `${item.nome}-${item.grupo}`}>
                  <td><b>{item.nome}</b><div className="muted" style={{ fontSize: 11.5 }}>{item.modelo || origemLabel(item.origem)}</div></td>
                  <td><Badge cls="azul">{item.grupo || '-'}</Badge></td>
                  <td>{item.tipo || '-'}</td>
                  <td>{item.forma || '-'}</td>
                  <td className="muted">{item.incidencia || '-'}</td>
                  <td className="num tnum">{item.forma === 'percentual' ? pct(item.percentual || 0) : (item.valor ? brl(item.valor) : '-')}</td>
                  <td><Badge cls={item.entraCronograma !== false ? 'verde' : 'cinza'} dot>{item.entraCronograma !== false ? 'Sim' : 'Nao'}</Badge></td>
                  <td className="muted">{item.fonte || '-'}</td>
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
