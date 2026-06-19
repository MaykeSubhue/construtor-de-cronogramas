import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as api from '../mock/api.js'
import { Badge, Note } from '../components/ui.jsx'

const passos = ['Unidade', 'Especialidades', 'Prévia', 'Criar']

const tiposUnidade = ['Hospital geral', 'Hospital especializado', 'Maternidade', 'UPA 24h', 'CER', 'Unidade especializada']

export default function NovoPlano() {
  const nav = useNavigate()
  const loc = useLocation()
  const boot = api.getBootstrap()
  const paramsUrl = new URLSearchParams(loc.search)
  const cronogramasProntos = api.listCronogramasProntos()
  const especialidadesDisponiveis = useMemo(() => api.listEspecialidadesCronograma(), [])
  const modoInicial = paramsUrl.get('modo') === 'modelo' ? 'modelo' : 'especialidades'
  const cronogramaProntoInicial = paramsUrl.get('modelo') || cronogramasProntos[0]?.id || ''
  const [step, setStep] = useState(0)
  const [f, setF] = useState(() => ({
    modo: modoInicial,
    nome: '',
    unidadeModo: 'existente',
    objeto_planejamento_id: boot.objetos_planejamento[0]?.id,
    unidadeNova: { nome: '', sigla: '', cnes: '', tipoUnidade: 'Hospital geral' },
    competencia_inicial: '2026-01',
    meses_projecao: modoInicial === 'modelo' ? 24 : 12,
    tabela_salarial_id: boot.tabelas_salariais[0]?.id || 1,
    especialidades: [],
    cronogramaProntoId: cronogramaProntoInicial,
    sei: '',
  }))
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }))
  const setUnidadeNova = (k, v) => setF((s) => ({ ...s, unidadeNova: { ...s.unidadeNova, [k]: v } }))
  const toggleEspecialidade = (item) => setF((s) => {
    const existe = s.especialidades.some((especialidade) => especialidade.key === item.key)
    if (existe) return { ...s, especialidades: s.especialidades.filter((especialidade) => especialidade.key !== item.key) }
    const categorias = item.categoriasSugeridas?.length
      ? item.categoriasSugeridas.map((grupo, index) => ({ ...grupo, ativo: index === 0 }))
      : [{ id: `categoria-${item.key.replace(/[^a-z0-9]+/gi, '-')}`, nome: `Equipe de ${item.nome}`, ativo: true }]
    return { ...s, especialidades: [...s.especialidades, { ...item, especialidadeId: item.id, categoriasGerais: categorias }] }
  })
  const setCategoriasEspecialidade = (key, categoriasGerais) => setF((s) => ({
    ...s,
    especialidades: s.especialidades.map((item) => item.key === key ? { ...item, categoriasGerais } : item),
  }))

  const payload = useMemo(() => ({
    modo: f.modo,
    nome: f.nome,
    unidade: f.unidadeModo === 'nova'
      ? { tipo: 'nova', ...f.unidadeNova }
      : { tipo: 'existente', id: Number(f.objeto_planejamento_id) },
    competencia_inicial: f.competencia_inicial,
    meses_projecao: f.meses_projecao,
    tabela_salarial_id: f.tabela_salarial_id,
    especialidades: f.especialidades,
    cronogramaProntoId: f.cronogramaProntoId,
    sei: f.sei,
  }), [f])

  const preview = f.modo === 'modelo'
    ? api.previewCronogramaPronto(f.cronogramaProntoId, payload)
    : api.previewPlanoNormativo(payload)
  const unidadeValida = f.unidadeModo === 'existente' ? !!f.objeto_planejamento_id : !!f.unidadeNova.nome.trim()
  const configValida = f.modo === 'modelo'
    ? !!f.cronogramaProntoId
    : f.especialidades.length > 0 && f.especialidades.every((item) => item.categoriasGerais.some((grupo) => grupo.ativo !== false))
  const podeAvancar =
    (step !== 0 || unidadeValida) &&
    (step !== 1 || configValida)
  const podeCriar = unidadeValida && configValida

  const criar = () => {
    if (f.modo === 'modelo') {
      const plano = api.criarPlanoDeCronogramaPronto(f.cronogramaProntoId, payload)
      nav(`/plano/${plano.id}/construcao`)
      return
    }
    const plano = api.criarPlanoNormativo(payload)
    nav(`/plano/${plano.id}/construcao`)
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div className="page-head">
        <div>
          <h1>Novo cronograma</h1>
          <div className="sub">Escolha a unidade, selecione as especialidades e organize cada equipe por categoria geral.</div>
        </div>
      </div>

      <div className="wizard-steps">
        {passos.map((p, i) => (
          <div key={p} className={`wstep ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
            <span className="n">{i < step ? '✓' : i + 1}</span>
            <span>{p}</span>
            {i < passos.length - 1 && <span className="wstep-sep" />}
          </div>
        ))}
      </div>

      <div className="card card-pad">
        {step === 1 && (
          <>
            <div className="section-title">Como deseja começar?</div>
            <div className="grid cols-2">
              <Opcao
                ativo={f.modo === 'especialidades'}
                ico="🏥"
                titulo="Montar por especialidades"
                texto="Escolha uma ou várias especialidades, suas categorias gerais e depois preencha os profissionais."
                onClick={() => setF((s) => ({ ...s, modo: 'especialidades', meses_projecao: 12 }))}
              />
              <Opcao
                ativo={f.modo === 'modelo'}
                ico="📋"
                titulo="Modelo pronto"
                texto="Copia um cronograma concluído, com especialidades, categorias gerais, equipes e valores da planilha de origem."
                onClick={() => setF((s) => ({ ...s, modo: 'modelo', meses_projecao: 24 }))}
              />
            </div>
            <Note icon="📜">Fluxo de preenchimento: unidade → especialidades → categorias gerais → profissionais → cronograma calculado.</Note>
          </>
        )}

        {step === 0 && (
          <>
            <div className="section-title">Unidade</div>
            <div className="pill-toggle mb-2">
              <button className={f.unidadeModo === 'existente' ? 'active' : ''} onClick={() => set('unidadeModo', 'existente')}>Unidade cadastrada</button>
              <button className={f.unidadeModo === 'nova' ? 'active' : ''} onClick={() => set('unidadeModo', 'nova')}>Nova unidade</button>
            </div>
            {f.unidadeModo === 'existente' ? (
              <div className="field">
                <label>Unidade de saúde</label>
                <select value={f.objeto_planejamento_id} onChange={(e) => set('objeto_planejamento_id', Number(e.target.value))}>
                  {boot.objetos_planejamento.map((o) => <option key={o.id} value={o.id}>{o.nome} · {o.tipo} · CNES {o.cnes || 'sem CNES'}</option>)}
                </select>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="field">
                    <label>Nome da unidade</label>
                    <input autoFocus value={f.unidadeNova.nome} onChange={(e) => setUnidadeNova('nome', e.target.value)} placeholder="Ex.: Hospital Municipal Novo Rio" />
                  </div>
                  <div className="field">
                    <label>Sigla</label>
                    <input value={f.unidadeNova.sigla} onChange={(e) => setUnidadeNova('sigla', e.target.value)} placeholder="Opcional" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field">
                    <label>CNES <span className="muted">(opcional)</span></label>
                    <input value={f.unidadeNova.cnes} onChange={(e) => setUnidadeNova('cnes', e.target.value)} placeholder="Pode ficar em branco" />
                  </div>
                  <div className="field">
                    <label>Tipo de unidade</label>
                    <select value={f.unidadeNova.tipoUnidade} onChange={(e) => setUnidadeNova('tipoUnidade', e.target.value)}>
                      {tiposUnidade.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <Note icon="🏷️">A unidade nova será cadastrada como manual, com AP “Não informada” e fonte “Cadastro manual”.</Note>
              </>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <div className="section-title">Dados do cronograma</div>
            <div className="field">
              <label>Nome do plano <span className="muted">(opcional)</span></label>
              <input value={f.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Se ficar vazio, o sistema monta um nome automático" />
            </div>
            {f.modo === 'especialidades' ? (
              <SeletorEspecialidades
                disponiveis={especialidadesDisponiveis}
                selecionadas={f.especialidades}
                onToggle={toggleEspecialidade}
                onCategorias={setCategoriasEspecialidade}
              />
            ) : (
              <div className="field">
                <label>Cronograma pronto</label>
                <select value={f.cronogramaProntoId} onChange={(e) => set('cronogramaProntoId', e.target.value)}>
                  {cronogramasProntos.map((modelo) => <option key={modelo.id} value={modelo.id}>{modelo.nome}</option>)}
                </select>
                <div className="hint">O modelo preserva as especialidades, categorias gerais, equipes e componentes salariais da planilha de origem.</div>
              </div>
            )}
            <div className="form-row three">
              <div className="field">
                <label>Competência inicial</label>
                <input type="month" value={f.competencia_inicial} onChange={(e) => set('competencia_inicial', e.target.value)} />
              </div>
              <div className="field">
                <label>Meses de projeção</label>
                <input type="number" min={1} max={60} value={f.meses_projecao} onChange={(e) => set('meses_projecao', Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Tabela salarial</label>
                <select value={f.tabela_salarial_id} onChange={(e) => set('tabela_salarial_id', Number(e.target.value))}>
                  {boot.tabelas_salariais.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </div>
            </div>
            <div className="field">
              <label>Processo SEI <span className="muted">(opcional)</span></label>
              <input value={f.sei} onChange={(e) => set('sei', e.target.value)} placeholder="Ex.: SEI-080001/004321/2026" />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="spread">
              <div className="section-title" style={{ margin: 0 }}>{f.modo === 'modelo' ? 'Prévia do modelo' : 'Prévia das especialidades'}</div>
              <div className="flex" style={{ gap: 8 }}>
                <Badge cls="verde" dot>{preview.resumo.especialidadesAtivas || preview.resumo.setoresAtivos || 0} especialidade(s)</Badge>
                <Badge cls="azul">Equipe {preview.resumo.equipeTotal || 0}</Badge>
                {f.modo === 'modelo'
                  ? <Badge cls="cinza">{preview.resumo.linhasEquipe || 0} linhas</Badge>
                  : <Badge cls="cinza">{preview.resumo.categoriasGerais || 0} categorias gerais</Badge>}
              </div>
            </div>
            {preview.avisos?.map((aviso, i) => <Note key={i} icon="⚠️">{aviso}</Note>)}
            {f.modo === 'modelo'
              ? <PreviewCronogramaPronto preview={preview} />
              : <PreviewEspecialidades especialidades={preview.especialidades || []} />}
          </>
        )}

        {step === 3 && (
          <>
            <div className="section-title">Criar cronograma</div>
            <div className="grid cols-2">
              <Resumo k="Tipo" v={f.modo === 'modelo' ? 'Modelo pronto' : 'Montagem por especialidades'} />
              <Resumo k="Unidade" v={preview.unidade?.nome || '—'} />
              <Resumo k="Competência" v={f.competencia_inicial} />
              <Resumo k="Meses" v={f.meses_projecao} />
              <Resumo k="Especialidades" v={preview.resumo.especialidadesAtivas || preview.resumo.setoresAtivos || 0} />
              <Resumo k={f.modo === 'modelo' ? 'Equipe importada' : 'Equipe normativa estimada'} v={preview.resumo.equipeTotal || 0} />
            </div>
            <Note icon="✅">Ao criar, o plano abrirá na primeira categoria geral. Preencha os profissionais de cada especialidade; o cronograma financeiro será atualizado automaticamente.</Note>
          </>
        )}

        <div className="divider" />
        <div className="spread">
          <button className="btn ghost" onClick={() => (step === 0 ? nav('/planos') : setStep(step - 1))}>
            {step === 0 ? 'Cancelar' : '← Voltar'}
          </button>
          {step < passos.length - 1 ? (
            <button className="btn primary" disabled={!podeAvancar} onClick={() => setStep(step + 1)}>Continuar →</button>
          ) : (
            <button className="btn primary" disabled={!podeCriar} onClick={criar}>Criar plano e preencher equipes</button>
          )}
        </div>
      </div>
    </div>
  )
}

function SeletorEspecialidades({ disponiveis, selecionadas, onToggle, onCategorias }) {
  const [busca, setBusca] = useState('')
  const termo = busca.trim().toLocaleLowerCase('pt-BR')
  const filtradas = disponiveis.filter((item) => !termo || `${item.nome} ${item.tipo}`.toLocaleLowerCase('pt-BR').includes(termo))
  const selecionadasIds = new Set(selecionadas.map((item) => item.key))

  return (
    <div className="specialty-builder">
      <div className="field">
        <label>Especialidades da unidade</label>
        <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar especialidade ou área da unidade" />
        <div className="hint">Selecione uma ou várias. As áreas existentes nos cronogramas de referência também aparecem na busca.</div>
      </div>
      <div className="specialty-options" role="group" aria-label="Especialidades disponíveis">
        {filtradas.slice(0, 80).map((item) => (
          <label key={item.key} className={`specialty-option ${selecionadasIds.has(item.key) ? 'selected' : ''}`}>
            <input type="checkbox" checked={selecionadasIds.has(item.key)} onChange={() => onToggle(item)} />
            <span><b>{item.nome}</b><small>{item.tipo} · {item.origem}</small></span>
          </label>
        ))}
        {!filtradas.length && <div className="muted specialty-empty">Nenhuma especialidade encontrada.</div>}
      </div>

      <div className="spread mt-2">
        <div className="section-title" style={{ margin: 0 }}>Especialidades selecionadas</div>
        <Badge cls={selecionadas.length ? 'azul' : 'cinza'}>{selecionadas.length}</Badge>
      </div>
      {!selecionadas.length && <Note icon="👆">Escolha pelo menos uma especialidade para continuar.</Note>}
      <div className="specialty-selected-list">
        {selecionadas.map((item) => (
          <EspecialidadeSelecionada
            key={item.key}
            item={item}
            onRemove={() => onToggle(item)}
            onChange={(categorias) => onCategorias(item.key, categorias)}
          />
        ))}
      </div>
    </div>
  )
}

function EspecialidadeSelecionada({ item, onRemove, onChange }) {
  const [novaCategoria, setNovaCategoria] = useState('')
  const categorias = item.categoriasGerais || []
  const adicionar = () => {
    const nome = novaCategoria.trim()
    if (!nome) return
    const id = `categoria-manual-${item.key.replace(/[^a-z0-9]+/gi, '-')}-${categorias.length + 1}`
    onChange([...categorias, { id, nome, ativo: true, origem: 'Cadastro manual' }])
    setNovaCategoria('')
  }
  return (
    <section className="specialty-selected">
      <div className="spread">
        <div><b>{item.nome}</b><div className="hint">Escolha as categorias gerais que organizarão os profissionais.</div></div>
        <button type="button" className="btn sm ghost danger" onClick={onRemove} aria-label={`Remover ${item.nome}`}>✕</button>
      </div>
      <div className="general-category-options">
        {categorias.map((grupo) => (
          <label key={grupo.id} className="general-category-option">
            <input type="checkbox" checked={grupo.ativo !== false} onChange={(e) => onChange(categorias.map((itemCategoria) => itemCategoria.id === grupo.id ? { ...itemCategoria, ativo: e.target.checked } : itemCategoria))} />
            <span>{grupo.nome}</span>
          </label>
        ))}
      </div>
      <div className="specialty-add-category">
        <input value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionar() } }} placeholder="Adicionar outra categoria geral" />
        <button type="button" className="btn sm" disabled={!novaCategoria.trim()} onClick={adicionar}>Adicionar</button>
      </div>
    </section>
  )
}

function PreviewEspecialidades({ especialidades }) {
  return (
    <div className="card mt-2">
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Especialidade</th><th>Categorias gerais</th><th>Preenchimento inicial</th><th>Referência normativa</th></tr></thead>
          <tbody>
            {especialidades.map((item) => (
              <tr key={item.key}>
                <td><b>{item.nome}</b></td>
                <td>{item.categoriasGerais.map((grupo) => grupo.nome).join(' · ')}</td>
                <td>{item.equipeTotal ? <Badge cls="verde">{item.equipeTotal} profissionais sugeridos</Badge> : <Badge cls="cinza">Equipe a preencher</Badge>}</td>
                <td className="muted">{item.referenciaNormativa || 'Sem regra automática correspondente'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Opcao({ ativo, ico, titulo, texto, onClick }) {
  return (
    <button type="button" className={`preset-opt preset-button ${ativo ? 'sel' : ''}`} onClick={onClick} aria-pressed={ativo}>
      <div className="p-ico">{ico}</div>
      <div>
        <h4>{titulo}</h4>
        <p>{texto}</p>
      </div>
    </button>
  )
}

function PreviewSetor({ setor }) {
  if (!setor) return <Note icon="⚠️">Não foi possível reconhecer uma regra estruturada para este texto. O plano poderá ser criado, mas o setor entrará como manual sem RH automático.</Note>
  return (
    <>
      <div className="card card-pad mt-2" style={{ boxShadow: 'none', background: 'var(--cinza-bg)' }}>
        <div className="spread">
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Setor reconhecido</div>
            <b>{setor.setor?.setor}</b>
          </div>
          <Badge cls={setor.regras?.length ? 'verde' : 'ambar'}>{setor.regras?.length || 0} regra(s)</Badge>
        </div>
        <div className="memo-line"><span className="k">Entrada detectada</span><span className="v">{setor.quantidade} {setor.unidade}</span></div>
        <div className="memo-line"><span className="k">Fontes</span><span className="v">{setor.fontes?.slice(0, 3).join(' · ') || 'Sem fonte vinculada'}</span></div>
      </div>
      <TabelaPreview linhas={setor.linhas || []} />
    </>
  )
}

function PreviewHospital({ setores, setSetor, pendenciasJustificativa }) {
  return (
    <>
      {pendenciasJustificativa.length > 0 && <Note icon="⚠️">Setores obrigatórios desmarcados precisam de justificativa antes de criar.</Note>}
      <div className="card mt-2">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Ativo</th><th>Setor</th><th>Perfil</th><th className="num">Qtd</th><th>Unidade</th><th className="num">Equipe</th><th>Fonte</th></tr></thead>
            <tbody>
              {setores.map((s) => (
                <tr key={s.slug}>
                  <td><input type="checkbox" checked={s.ativo} onChange={(e) => setSetor(s.slug, { ativo: e.target.checked })} /></td>
                  <td>
                    <b>{s.setor?.setor || s.slug}</b>
                    <div className="hint">{s.setor?.macroarea}</div>
                    {!s.ativo && s.obrigatorio && (
                      <textarea rows={2} value={s.justificativa || ''} onChange={(e) => setSetor(s.slug, { justificativa: e.target.value })}
                        placeholder="Justifique a retirada deste setor obrigatório"
                        style={{ width: '100%', marginTop: 6, padding: '6px 8px', border: '1px solid var(--cinza-borda-forte)', borderRadius: 6, font: 'inherit' }} />
                    )}
                  </td>
                  <td>{s.obrigatorio ? <Badge cls="azul">Obrigatório</Badge> : <Badge>Opcional</Badge>}</td>
                  <td className="num"><input className="cell-input" type="number" min={0} step="1" disabled={!s.ativo} value={s.quantidade} onChange={(e) => setSetor(s.slug, { quantidade: Number(e.target.value) || 0 })} /></td>
                  <td><input className="cell-input" style={{ textAlign: 'left' }} disabled={!s.ativo} value={s.unidade} onChange={(e) => setSetor(s.slug, { unidade: e.target.value })} /></td>
                  <td className="num tnum">{s.ativo ? s.equipeTotal : '—'}</td>
                  <td className="muted">{s.fontes?.[0] || 'Matriz v4'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function PreviewCronogramaPronto({ preview }) {
  const modelo = preview.modelo
  return (
    <>
      <div className="card card-pad mt-2" style={{ boxShadow: 'none', background: 'var(--cinza-bg)' }}>
        <div className="spread">
          <div>
            <div className="muted" style={{ fontSize: 12 }}>Modelo selecionado</div>
            <b>{modelo?.nome}</b>
          </div>
          <Badge cls={preview.resumo.linhasRevisao ? 'ambar' : 'verde'}>
            {preview.resumo.linhasRevisao ? `${preview.resumo.linhasRevisao} revisar` : 'Sem revisão'}
          </Badge>
        </div>
        <div className="memo-line"><span className="k">Fonte</span><span className="v">{modelo?.fonte}</span></div>
        <div className="memo-line"><span className="k">Custeio operacional</span><span className="v">{Math.round((modelo?.parametrosCronograma?.custeioOperacionalPct || 0) * 100)}%</span></div>
      </div>
      <div className="card mt-2">
        <div className="table-wrap">
          <table className="tbl">
            <thead><tr><th>Aba importada</th><th>Especialidade / área</th><th className="num">Linhas</th><th className="num">Equipe</th><th>Revisão</th></tr></thead>
            <tbody>
              {preview.setores.map((setor) => (
                <tr key={setor.id}>
                  <td className="muted">{setor.abaOrigem}</td>
                  <td><b>{setor.nome}</b></td>
                  <td className="num tnum">{setor.linhasEquipe}</td>
                  <td className="num tnum">{setor.profissionais}</td>
                  <td>{setor.revisar ? <Badge cls="ambar" dot>Revisar</Badge> : <Badge cls="verde" dot>Ok</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

function TabelaPreview({ linhas }) {
  return (
    <div className="card mt-2">
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Função</th><th>Fonte</th><th className="num">Normativo</th><th className="num">QP 30h</th><th className="num">QP 40h</th><th>CHS</th></tr></thead>
          <tbody>
            {linhas.map((l) => (
              <tr key={l.regra.id}>
                <td><b>{l.perfil.label}</b></td>
                <td className="muted">{l.fonte}</td>
                <td className="num tnum">{l.qtd}</td>
                <td className="num tnum">{l.qp30}</td>
                <td className="num tnum">{l.qp40}</td>
                <td>{l.chs}h</td>
              </tr>
            ))}
            {!linhas.length && <tr><td colSpan={6} className="muted" style={{ padding: 20, textAlign: 'center' }}>Sem quadro automático.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Resumo({ k, v }) {
  return (
    <div className="stat-line">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  )
}
