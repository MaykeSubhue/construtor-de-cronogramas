# API do app `plano_trabalho`

## Base

```text
/plano-trabalho/api/
```

Todas as APIs atuais usam autenticacao de sessao e `IsAuthenticated`. Chamadas inseguras (`POST`, `PUT`, `PATCH`, `DELETE`) devem enviar CSRF quando consumidas via browser.

O shell React fica em:

```text
/plano-trabalho/
```

## Convencoes

- IDs de cenario podem aparecer como `cenario_id` ou `variante_id` em alguns endpoints para manter compatibilidade.
- A API usa desativacao logica para muitos recursos; `DELETE` nem sempre remove fisicamente.
- Errors de dominio geralmente retornam HTTP 400 com objeto de campos ou `detail`.
- Datas de competencia aceitam `YYYY-MM` ou `YYYY-MM-DD` na criacao do plano; internamente sao normalizadas para o primeiro dia do mes.

## Bootstrap

| Metodo | Rota | Uso |
| --- | --- | --- |
| `GET` | `/bootstrap/` | Retorna planos resumidos, opcoes de catalogos e sugestoes de criacao. |

Resposta contem:

- `planos`;
- `objetos_planejamento`;
- `conjuntos_regras`;
- `tabelas_salariais`;
- `tipos_setor`;
- `tipos_no_estrutura`;
- `composicoes_conjuntos_regras`;
- `sugestoes`.

## Catalogos editaveis

| Metodo | Rota | Uso |
| --- | --- | --- |
| `GET` | `/catalogos/` | Lista catalogos disponiveis na area de gestao. |
| `GET` | `/catalogos/{catalogo}/` | Lista registros e metadados de um catalogo. |
| `POST` | `/catalogos/{catalogo}/` | Cria registro em um catalogo. |
| `PATCH` | `/catalogos/{catalogo}/{id}/` | Edita registro. |
| `DELETE` | `/catalogos/{catalogo}/{id}/` | Desativa logicamente registro. |
| `GET` | `/catalogos/{catalogo}/{id}/historico/` | Lista eventos de auditoria do registro. |

Slugs atuais:

| Slug | Grupo | Model |
| --- | --- | --- |
| `objetos-planejamento` | Planejamento | `ObjetoPlanejamento` |
| `conjuntos-regras` | Regras | `ConjuntoRegras` |
| `tabelas-salariais` | Base salarial | `TabelaSalarial` |
| `tipos-no-estrutura` | Estrutura | `TipoNoEstrutura` |
| `tipos-setor` | Estrutura | `TipoSetor` |
| `categorias-profissionais` | Base salarial | `CategoriaProfissional` |
| `regimes-trabalho` | Base salarial | `RegimeTrabalho` |
| `naturezas-atuacao` | Base salarial | `NaturezaAtuacao` |
| `perfis-alocacao` | Base salarial | `PerfilAlocacao` |
| `itens-tabela-salarial` | Base salarial | `ItemTabelaSalarial` |
| `definicoes-variaveis` | Regras | `DefinicaoVariavel` |
| `compatibilidades-setor-variavel` | Regras | `CompatibilidadeTipoSetorVariavel` |
| `grupos-rubrica` | Custeio | `GrupoRubrica` |
| `rubricas` | Custeio | `Rubrica` |
| `regras-quadro-pessoal` | Regras | `RegraQuadroPessoal` |
| `faixas-regras-quadro-pessoal` | Regras | `FaixaRegraQuadroPessoal` |
| `condicoes-regras-quadro-pessoal` | Regras | `CondicaoRegraQuadroPessoal` |

Payloads de catalogo aceitam `_justificativa` em edicoes e criacoes. Ao editar item herdado de seed, a justificativa e obrigatoria.

## Planos

| Metodo | Rota | Uso |
| --- | --- | --- |
| `GET` | `/planos/` | Lista planos. |
| `POST` | `/planos/` | Cria plano inicial. |
| `PATCH` | `/planos/{id}/` | Atualiza campos editaveis do plano. |
| `POST` | `/planos/{id}/duplicar/` | Duplica plano. |
| `POST` | `/planos/{id}/arquivar/` | Arquiva plano. |
| `POST` | `/planos/{id}/reabrir/` | Reabre plano arquivado. |
| `DELETE` | `/planos/{id}/excluir/` | Exclui plano em rascunho. |

### Filtros de listagem

`GET /planos/` aceita:

- `status`;
- `objeto_planejamento_id`;
- `busca`;
- `ordenacao=nome|unidade|competencia|atualizacao`;
- `incluir_arquivados=false`;
- `page` e `page_size`.

Sem `page`, a resposta e um array puro para compatibilidade com o SPA. Com `page`, retorna objeto paginado.

### Criacao de plano

```json
{
  "codigo": "",
  "nome": "UPA Penha 2026",
  "objeto_planejamento_id": 1,
  "conjunto_regras_id": 1,
  "composicao_conjuntos_id": null,
  "tabela_salarial_id": 1,
  "competencia_inicial": "2026-01",
  "meses_projecao": 12,
  "cobre_objeto_integralmente": true,
  "descricao_recorte": "",
  "ponto_partida": "base"
}
```

`ponto_partida`:

- `base`: cria estrutura inicial minima quando possivel;
- `zero`: cria esqueleto sem estrutura operacional.

### Duplicacao

```json
{
  "modo": "configuracao"
}
```

Modos:

- `estrutura`: copia arvore, escopos, competencias e cenarios;
- `configuracao`: copia tambem parametros, quadro, custos, producao, calendario e parametros de rubrica.

Apuracoes, cronogramas e resultados nao sao copiados.

## Bases vinculadas

| Metodo | Rota | Uso |
| --- | --- | --- |
| `GET` | `/planos/{id}/bases/` | Lista bases normativas vinculadas ao plano. |
| `POST` | `/planos/{id}/bases/{papel}/` | Substitui base de um papel. |
| `GET` | `/planos/{id}/bases-historico/` | Lista historico de substituicoes de base. |

Papeis:

- `regras`: `ConjuntoRegras`;
- `salarial`: `TabelaSalarial`.

Payload de substituicao:

```json
{
  "base_id": 2,
  "justificativa": "Atualizacao da tabela de referencia."
}
```

Justificativa e obrigatoria quando o plano nao esta em `rascunho`.

## Completude

| Metodo | Rota | Uso |
| --- | --- | --- |
| `GET` | `/planos/{id}/checklist-completude/` | Lista variaveis exigidas, preenchidas e faltantes por escopo. |

Formato resumido:

```json
{
  "plano_id": 1,
  "resumo": {
    "total_exigidas": 10,
    "total_preenchidas": 8,
    "total_faltantes": 2,
    "percentual": 80.0,
    "escopos_completos": 3,
    "escopos_total": 4
  },
  "escopos": []
}
```

## Cenarios

| Metodo | Rota | Uso |
| --- | --- | --- |
| `GET` | `/planos/{id}/cenarios/` | Lista cenarios ativos. |
| `POST` | `/planos/{id}/cenarios/` | Cria cenario. |
| `PATCH` | `/planos/{id}/cenarios/{cenario_id}/` | Edita cenario. |
| `DELETE` | `/planos/{id}/cenarios/{cenario_id}/` | Desativa cenario nao padrao. |

Payload de criacao:

```json
{
  "nome": "Cenario alternativo",
  "codigo": "",
  "descricao": "",
  "cenario_base_id": 1,
  "conjunto_regras_override_id": null,
  "composicao_conjuntos_override_id": null,
  "tabela_salarial_override_id": null
}
```

`tipo_variante` criado via API publica fica restrito a `outra`. Os cenarios padrao `sem_cebas` e `com_cebas` sao criados pelo service inicial.

## Validacao, simulacao, apuracao e cronograma

| Metodo | Rota | Uso |
| --- | --- | --- |
| `POST` | `/planos/{id}/validar/` | Valida prontidao operacional. |
| `POST` | `/planos/{id}/simular/` | Calcula sem persistir resultados. |
| `POST` | `/planos/{id}/apurar/` | Calcula e persiste uma apuracao completa. |
| `GET` | `/planos/{id}/apuracoes/` | Lista apuracoes. |
| `GET` | `/planos/{id}/apuracoes/{apuracao_id}/` | Detalha apuracao. |
| `GET` | `/planos/{id}/cronogramas/` | Lista cronogramas. |
| `POST` | `/planos/{id}/cronogramas/gerar/` | Gera cronograma a partir de apuracao. |
| `POST` | `/planos/{id}/fechar/` | Fecha plano e cronogramas ativos. |

Payload opcional para simular/apurar:

```json
{
  "cenario_ids": [1, 2]
}
```

Payload para gerar cronograma:

```json
{
  "apuracao_id": 10,
  "cenario_ids": [1, 2]
}
```

## Estrutura do plano

| Metodo | Rota | Uso |
| --- | --- | --- |
| `GET` | `/planos/{id}/estrutura/` | Retorna arvore estrutural do plano. |
| `POST` | `/planos/{id}/estrutura/nos/` | Cria no. |
| `PATCH` | `/planos/{id}/estrutura/nos/{no_id}/` | Atualiza no. |
| `DELETE` | `/planos/{id}/estrutura/nos/{no_id}/` | Desativa no e subarvore. |
| `POST` | `/planos/{id}/estrutura/nos/{no_id}/reordenar/` | Move no entre irmaos. |
| `GET` | `/planos/{id}/estrutura/nos/{no_id}/configuracao/` | Retorna configuracao operacional do no. |
| `PUT` | `/planos/{id}/estrutura/nos/{no_id}/configuracao/` | Salva parametros, quadro e custos. |
| `POST` | `/planos/{id}/estrutura/nos/{no_id}/aplicar-regras-quadro/` | Materializa regras de quadro. |
| `POST` | `/planos/{id}/estrutura/nos/{no_id}/aplicar-regras-rubrica/` | Materializa regras de rubrica. |

Criacao de no:

```json
{
  "nome": "Observacao adulto",
  "codigo": "",
  "pai_id": 1,
  "tipo_no_estrutura_id": 4,
  "tipo_setor_id": 12,
  "ordem": 10,
  "criar_escopo": true,
  "escopo_nome": "Observacao adulto",
  "escopo_codigo": ""
}
```

Reordenar:

```json
{
  "direcao": "subir"
}
```

Direcoes aceitas:

- `subir`;
- `descer`.

Salvar configuracao:

```json
{
  "parametros": [
    {
      "definicao_variavel_id": 1,
      "valor": 10,
      "observacoes": ""
    }
  ],
  "quadro": [
    {
      "perfil_alocacao_id": 1,
      "quantidade_planejada": "2.0000",
      "observacoes": ""
    }
  ],
  "custos": [
    {
      "nome": "Energia",
      "descricao": "",
      "tipo_componente": "servico",
      "estrategia_valor": "fixo_mensal",
      "rubrica_id": 1,
      "quantidade_referencia": null,
      "valor_unitario": "10000.00",
      "percentual": null,
      "base_percentual": "",
      "obrigatorio": true
    }
  ]
}
```

## Boas praticas para consumidores

- Use `bootstrap` para popular seletores iniciais.
- Use `catalogos` para telas de gestao e nao para cada fluxo operacional.
- Use `estrutura/{no}/configuracao` como fonte de verdade da tela de configuracao do setor.
- Chame checklist de completude antes de habilitar apuracao persistida.
- Prefira `simular` para comparacao rapida e `apurar` quando o usuario confirmar persistencia.
