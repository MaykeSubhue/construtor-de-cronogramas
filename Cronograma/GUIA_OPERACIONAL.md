# Guia operacional

Este guia descreve o fluxo esperado para operar o app em desenvolvimento, homologacao ou demonstracao.

## 1. Preparar dados de referencia

Rode o seed canonico:

```pwsh
python manage.py seed_plano_trabalho --dry-run
python manage.py seed_plano_trabalho
```

Quando quiser apenas validar cobertura existente:

```pwsh
python manage.py seed_plano_trabalho --somente-validar
```

Quando quiser carregar bases sem criar plano demonstravel:

```pwsh
python manage.py seed_plano_trabalho --sem-plano-demo
```

## 2. Abrir o app

O shell da SPA e servido em:

```text
/plano-trabalho/
```

A API fica em:

```text
/plano-trabalho/api/
```

Usuarios precisam estar autenticados. Em desenvolvimento, o login padrao segue o fluxo Django/Admin configurado no projeto.

## 3. Criar um plano

Um plano nasce com:

- objeto de planejamento;
- conjunto de regras ou composicao normativa;
- tabela salarial;
- competencia inicial;
- meses de projecao;
- recorte integral ou parcial.

Na API, `POST /api/planos/` aceita:

```json
{
  "nome": "UPA Penha 2026",
  "objeto_planejamento_id": 1,
  "conjunto_regras_id": 1,
  "composicao_conjuntos_id": null,
  "tabela_salarial_id": 1,
  "competencia_inicial": "2026-01",
  "meses_projecao": 12,
  "cobre_objeto_integralmente": true,
  "ponto_partida": "base"
}
```

Ao criar o plano, o service inicializa:

- competencias mensais;
- cenario `Sem CEBAS`;
- cenario `Com CEBAS`, herdando de `Sem CEBAS`;
- escopo global;
- configuracao global zerada;
- estrutura inicial quando `ponto_partida = "base"` e existir tipo estrutural adequado.

## 4. Montar a estrutura

A estrutura do plano e uma arvore de `NoPlano`.

Para cada no relevante ao calculo:

- defina `tipo_no_estrutura`;
- defina `tipo_setor` quando o no representa uma area funcional;
- marque ou mantenha um `EscopoPlano` ativo para configuracao e calculo.

Um no sem `tipo_setor` pode existir para organizacao visual, mas nao abre configuracao operacional de setor.

## 5. Configurar cada setor

Para abrir a configuracao de um no:

```text
GET /api/planos/{plano_id}/estrutura/nos/{no_id}/configuracao/
```

Opcionalmente informe cenario:

```text
GET /api/planos/{plano_id}/estrutura/nos/{no_id}/configuracao/?cenario_id={id}
```

A resposta traz:

- parametros exigidos e preenchidos;
- itens de equipe;
- custos operacionais;
- opcoes de perfis e rubricas;
- regras aplicaveis e sugestoes.

Para salvar configuracao:

```text
PUT /api/planos/{plano_id}/estrutura/nos/{no_id}/configuracao/
```

Payload tipico:

```json
{
  "parametros": [
    {
      "definicao_variavel_id": 10,
      "valor": 12,
      "observacoes": "Capacidade operacional validada."
    }
  ],
  "quadro": [
    {
      "perfil_alocacao_id": 5,
      "quantidade_planejada": "6.0000",
      "observacoes": ""
    }
  ],
  "custos": [
    {
      "nome": "Limpeza e conservacao",
      "tipo_componente": "servico",
      "estrategia_valor": "fixo_mensal",
      "rubrica_id": 20,
      "valor_unitario": "15000.00",
      "obrigatorio": true
    }
  ]
}
```

O envio de lista substitui a secao enviada: itens existentes que nao aparecem no payload sao desativados logicamente.

## 6. Aplicar sugestoes de regras

Para materializar quadro sugerido:

```text
POST /api/planos/{plano_id}/estrutura/nos/{no_id}/aplicar-regras-quadro/
```

Para materializar componentes de custeio vindos de regras de rubrica:

```text
POST /api/planos/{plano_id}/estrutura/nos/{no_id}/aplicar-regras-rubrica/
```

Ambos aceitam `?cenario_id=` ou `?variante_id=` quando a aplicacao deve ocorrer em um cenario.

## 7. Trabalhar com cenarios

Um cenario pode:

- herdar de outro cenario;
- trocar conjunto de regras;
- trocar composicao normativa;
- trocar tabela salarial;
- sobrescrever configuracoes, equipe e custos por escopo.

Os cenarios padrao `Sem CEBAS` e `Com CEBAS` nao podem ser removidos.

## 8. Checar completude

Antes de simular ou apurar, consulte:

```text
GET /api/planos/{plano_id}/checklist-completude/
```

O checklist cruza:

- variaveis globais exigidas por regras do plano;
- variaveis obrigatorias por `TipoSetor`;
- valores preenchidos nos escopos.

## 9. Validar

```text
POST /api/planos/{plano_id}/validar/
```

A validacao verifica prontidao operacional para calculo. Ela deve ser usada como barreira antes de persistir apuracoes.

## 10. Simular

```text
POST /api/planos/{plano_id}/simular/
```

Payload opcional:

```json
{
  "cenario_ids": [1, 2]
}
```

Simulacao calcula e retorna resultados sem criar `ApuracaoPlano`.

## 11. Apurar

```text
POST /api/planos/{plano_id}/apurar/
```

Apuracao persiste:

- `ApuracaoPlano`;
- `PosicaoPlanejada`;
- `ResultadoProducaoEscopo`;
- `ItemCustoApurado`;
- `ItemCustoMensalApurado`;
- `ConsolidadoResultadoEscopo`;
- `ConsolidadoResultadoMensalEscopo`.

Depois, consulte:

```text
GET /api/planos/{plano_id}/apuracoes/
GET /api/planos/{plano_id}/apuracoes/{apuracao_id}/
```

## 12. Gerar cronograma

```text
POST /api/planos/{plano_id}/cronogramas/gerar/
```

Payload:

```json
{
  "apuracao_id": 10,
  "cenario_ids": [1, 2]
}
```

O cronograma usa consolidados mensais ja apurados. Ele nao recalcula regras.

## 13. Fechar, arquivar, reabrir ou excluir

Fechar:

```text
POST /api/planos/{plano_id}/fechar/
```

Arquivar:

```text
POST /api/planos/{plano_id}/arquivar/
```

Reabrir:

```text
POST /api/planos/{plano_id}/reabrir/
```

Excluir permanentemente:

```text
DELETE /api/planos/{plano_id}/excluir/
```

Somente planos em `rascunho` sao excluiveis.

## Checklist rapido de uso

- Rode seed e valide cobertura.
- Crie ou selecione plano.
- Confira bases vinculadas.
- Monte estrutura.
- Classifique setores.
- Garanta escopos ativos nos setores calculaveis.
- Preencha variaveis obrigatorias.
- Aplique ou ajuste quadro.
- Aplique ou ajuste custeio.
- Compare cenarios.
- Rode checklist de completude.
- Simule.
- Apure.
- Gere cronograma.
- Feche o plano quando a saida estiver validada.
