# Seed realista SMS-Rio

Este arquivo e o README historico do antigo `seed_realista_rj`.

Na arvore atual, o comando canonico foi consolidado em:

```pwsh
python manage.py seed_plano_trabalho
```

O conteudo real continua modularizado em `plano_trabalho/seeds/`, mas o ponto de entrada versionado e `plano_trabalho/management/commands/seed_plano_trabalho.py`.

Para a referencia completa e atualizada, use [SEEDS.md](./SEEDS.md).

## Como rodar hoje

```pwsh
# valida toda a carga e desfaz a transacao ao final
python manage.py seed_plano_trabalho --dry-run

# persiste catalogos, normativas, salarios, objetos e plano demo
python manage.py seed_plano_trabalho

# carrega bases sem criar plano demonstravel
python manage.py seed_plano_trabalho --sem-plano-demo

# valida cobertura minima do banco atual
python manage.py seed_plano_trabalho --somente-validar

# falha se a validacao de cobertura emitir alertas
python manage.py seed_plano_trabalho --falhar-em-alertas

# muda a data de referencia da tabela salarial e do plano demo
python manage.py seed_plano_trabalho --data-referencia 2026-01-01
```

## O que entra na carga

Na execucao padrao, a carga cobre:

| Bloco | Modelos principais | Conteudo |
| --- | --- | --- |
| Catalogos estruturais | `TipoNoEstrutura`, `TipoSetor`, `CategoriaProfissional`, `RegimeTrabalho`, `NaturezaAtuacao`, `PerfilAlocacao` | Papeis estruturais, tipos de area, categorias, regimes, naturezas e postos planejaveis. |
| Rubricas | `GrupoRubrica`, `Rubrica` | Grupos financeiros e rubricas de remuneracao, beneficios, encargos, provisoes e custeio. |
| Variaveis | `DefinicaoVariavel`, `CompatibilidadeTipoSetorVariavel` | Indicadores e compatibilidades obrigatorias/opcionais por tipo de setor. |
| Conjuntos normativos | `ConjuntoRegras`, `RegraQuadroPessoal`, `RegraRubrica`, `FaixaRegraQuadroPessoal` | Bases normativas, regras de quadro, regras financeiras e exemplos por faixa. |
| Salarios | `TabelaSalarial`, `ItemTabelaSalarial` | Tabela salarial de referencia com itens por `PerfilAlocacao`. |
| Arquetipos | `ObjetoPlanejamento` | Unidades e recortes demonstraveis. |
| Plano demo | `PlanoTrabalho`, `VariantePlano`, `NoPlano`, `EscopoPlano`, `ValorVariavelPlano`, `ItemQuadroEscopo`, `ProcedimentoEscopo`, `ComponenteCusteioEscopo`, `CalendarioOperacionalEscopo` | Plano `upa_penha_2026` com estrutura, parametros, quadro, custos, calendario e cenarios. |

## Classificacao de origem

Textos seedados podem carregar prefixos como:

- `norma_obrigatoria`;
- `diretriz_assistencial`;
- `meta_operacional`;
- `pressuposto_financeiro`;
- `modelo_referencia_rio`;
- `seed_demo`.

Eles ajudam o usuario operacional a distinguir norma, diretriz, pressuposto e dado demonstrativo.

## Estrutura do pacote

- `helpers.py`: `SeedHelper`, origem, marcadores e conversao decimal.
- `bases_catalogos.py`: tipos estruturais, areas, categorias, regimes, naturezas e perfis.
- `bases_rubricas.py`: grupos e rubricas.
- `bases_variaveis.py`: variaveis e compatibilidades.
- `bases_normativas.py`: conjuntos normativos e regras.
- `bases_salarios.py`: tabela e itens salariais.
- `bases_arquetipos.py`: objetos de planejamento e plano demo.

## Nota de manutencao

Se o comando for renomeado no futuro, atualize:

- [README.md](./README.md);
- [SEEDS.md](./SEEDS.md);
- este arquivo;
- referencias em prompts ou documentos historicos.
