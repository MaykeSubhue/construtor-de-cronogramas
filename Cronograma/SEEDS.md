# Seed canonico do `plano_trabalho`

## Comando atual

O comando presente na arvore atual e:

```pwsh
python manage.py seed_plano_trabalho
```

O nome do comando Django deriva do arquivo:

```text
plano_trabalho/management/commands/seed_plano_trabalho.py
```

Os nomes `seed_realista_rj` e `seed_catalogos_regras_salarios` sao historicos. Eles aparecem em documentos antigos e no docstring do orquestrador, mas nao existem como arquivos de comando na arvore atual.

## Variantes

```pwsh
python manage.py seed_plano_trabalho --dry-run
python manage.py seed_plano_trabalho --sem-plano-demo
python manage.py seed_plano_trabalho --somente-validar
python manage.py seed_plano_trabalho --falhar-em-alertas
python manage.py seed_plano_trabalho --sem-validacao-cobertura
python manage.py seed_plano_trabalho --data-referencia 2026-01-01
```

| Opcao | Efeito |
| --- | --- |
| `--dry-run` | Executa a carga em transacao e reverte no final. |
| `--sem-plano-demo` | Carrega bases, regras, salarios e objetos sem criar plano demonstravel. |
| `--somente-validar` | Nao carrega dados; apenas valida cobertura minima existente. |
| `--falhar-em-alertas` | Transforma alertas de cobertura em erro de comando. |
| `--sem-validacao-cobertura` | Pula validacao final de cobertura minima. |
| `--data-referencia` | Define data de referencia para tabela salarial e plano demo. |

## Ordem da carga

O comando executa sete etapas:

1. catalogos estruturais;
2. rubricas e grupos;
3. variaveis e compatibilidades;
4. conjuntos normativos e regras;
5. tabela salarial;
6. objetos de planejamento;
7. plano demo UPA Penha 2026, salvo quando `--sem-plano-demo` e usado.

## Modulos do pacote `seeds`

| Arquivo | Conteudo |
| --- | --- |
| `helpers.py` | `SeedHelper`, origem, marcadores de origem, conversao decimal. |
| `bases_catalogos.py` | Tipos de no, tipos de setor, categorias, regimes, naturezas e perfis. |
| `bases_rubricas.py` | Grupos financeiros e rubricas. |
| `bases_variaveis.py` | Variaveis e compatibilidades por tipo de setor. |
| `bases_normativas.py` | Conjuntos normativos, regras de quadro, regras de rubrica e faixas. |
| `bases_salarios.py` | Tabela salarial e itens por perfil. |
| `bases_arquetipos.py` | Objetos de planejamento e plano demonstravel. |

## Idempotencia

O seed foi desenhado para poder rodar varias vezes.

O `SeedHelper`:

- cria ou atualiza por chaves estaveis;
- chama validacoes antes de salvar;
- contabiliza criados e atualizados;
- marca origem em textos e registros.

Na segunda execucao, a expectativa e que a maior parte dos itens apareca como `atualizados`, nao como `criados`.

## Validacao de cobertura

Ao final, salvo `--sem-validacao-cobertura`, o comando valida cobertura minima para evitar regressao para um seed meramente demonstrativo.

Ele verifica, entre outros pontos:

- codigos estrategicos de `TipoNoEstrutura`;
- volume minimo de categorias, regimes, tipos de setor e variaveis;
- grupos e rubricas financeiras essenciais;
- volume minimo de perfis, regras de quadro, regras de rubrica e itens salariais;
- regras em setores criticos;
- compatibilidades setor-variavel;
- referencias normativas esperadas ou desatualizadas.

Use `--falhar-em-alertas` em CI ou revisoes mais rigorosas.

## Plano demonstravel

Quando `--sem-plano-demo` nao e usado, a carga cria um plano demonstravel para UPA Penha 2026, com:

- objeto de planejamento;
- cenarios padrao;
- competencias mensais;
- arvore operacional;
- escopos;
- variaveis;
- quadro;
- producao;
- componentes de custeio;
- calendario operacional;
- parametros de rubrica por cenario.

O plano demo deve servir para navegar o frontend sem cadastrar tudo manualmente.

## Marcadores de origem

Descricoes e observacoes do seed podem incluir prefixos como:

- `norma_obrigatoria`;
- `diretriz_assistencial`;
- `meta_operacional`;
- `pressuposto_financeiro`;
- `modelo_referencia_rio`;
- `seed_demo`.

Esses marcadores ajudam a diferenciar norma, hipotese gerencial e dado ilustrativo.

## Rotina recomendada ao alterar seed

1. Edite o modulo `bases_*` especifico.
2. Rode `python manage.py seed_plano_trabalho --dry-run`.
3. Rode `python manage.py seed_plano_trabalho --somente-validar`.
4. Confira alertas normativos.
5. Se a carga afetar frontend, abra o plano demo e valide telas principais.
6. Atualize esta documentacao quando adicionar novas familias de dados, flags ou etapas.

## Documentos historicos

- [SEED_REALISTA_RJ_README.md](./SEED_REALISTA_RJ_README.md) foi atualizado para apontar ao comando atual.
- [SEED_REALISTA_RJ_PROMPT.md](./SEED_REALISTA_RJ_PROMPT.md) e um prompt historico de concepcao, nao contrato atual de implementacao.
- [SEEDS_CATALOGOS_E_REGRAS.md](./SEEDS_CATALOGOS_E_REGRAS.md) resume catalogos e regras, agora usando o comando canonico atual.
