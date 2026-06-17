// Base simplificada de categorias profissionais.
// Usa a Base Salarial RH e categorias criticas do motor; nao contem dados pessoais.
export const categoriasProfissionaisMeta = {
  "geradoEm": "2026-06-17",
  "fonteSalarial": "Base Salarial RH.xlsx",
  "fontesMetodologicas": [
    "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
    "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
    "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
  ],
  "totalCategorias": 68,
  "totalCategoriasSalariaisUnicas": 62,
  "totalLinhasSalariais": 63,
  "observacoes": [
    "Cadastro simplificado apenas por categoria profissional.",
    "Categorias sem salario ficam em revisao financeira ate vinculacao a tabela salarial oficial."
  ]
}

export const categoriasProfissionaisSeed = [
  {
    "id": 1,
    "slug": "medico",
    "nome": "M\u00e9dico",
    "grupo": "Assistencial",
    "conselho": "CRM",
    "classificacaoSalarial": null,
    "categoriaSalarialSlug": null,
    "categoriaSalarial": null,
    "temSalario": false,
    "fonte": "Motor do prototipo",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "revisar_financeiro",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 2,
    "slug": "enfermeiro",
    "nome": "Enfermeiro",
    "grupo": "Assistencial",
    "conselho": "COREN",
    "classificacaoSalarial": null,
    "categoriaSalarialSlug": null,
    "categoriaSalarial": null,
    "temSalario": false,
    "fonte": "Motor do prototipo",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "revisar_financeiro",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 3,
    "slug": "tecnico-de-enfermagem",
    "nome": "T\u00e9cnico de Enfermagem",
    "grupo": "Assistencial",
    "conselho": "COREN",
    "classificacaoSalarial": null,
    "categoriaSalarialSlug": null,
    "categoriaSalarial": null,
    "temSalario": false,
    "fonte": "Motor do prototipo",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "revisar_financeiro",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 4,
    "slug": "psicologo",
    "nome": "Psic\u00f3logo",
    "grupo": "Multiprofissional",
    "conselho": "CRP",
    "classificacaoSalarial": null,
    "categoriaSalarialSlug": null,
    "categoriaSalarial": null,
    "temSalario": false,
    "fonte": "Motor do prototipo",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "revisar_financeiro",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 5,
    "slug": "assistente-social",
    "nome": "Assistente Social",
    "grupo": "Multiprofissional",
    "conselho": "CRESS",
    "classificacaoSalarial": null,
    "categoriaSalarialSlug": null,
    "categoriaSalarial": null,
    "temSalario": false,
    "fonte": "Motor do prototipo",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "revisar_financeiro",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 6,
    "slug": "tecnico-administrativo",
    "nome": "T\u00e9cnico Administrativo",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "tecnico-administrativo",
    "categoriaSalarial": "T\u00e9cnico Administrativo",
    "temSalario": true,
    "fonte": "Motor do prototipo + Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 7,
    "slug": "fisioterapeuta",
    "nome": "Fisioterapeuta",
    "grupo": "Multiprofissional",
    "conselho": "CREFITO",
    "classificacaoSalarial": null,
    "categoriaSalarialSlug": null,
    "categoriaSalarial": null,
    "temSalario": false,
    "fonte": "Motor do prototipo",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "revisar_financeiro",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1000,
    "slug": "assistente-administrativo",
    "nome": "Assistente Administrativo",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "assistente-administrativo",
    "categoriaSalarial": "Assistente Administrativo",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1001,
    "slug": "aux-almoxarifado",
    "nome": "Aux Almoxarifado",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "aux-almoxarifado",
    "categoriaSalarial": "Aux Almoxarifado",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1002,
    "slug": "aux-farmacia",
    "nome": "Aux Farm\u00e1cia",
    "grupo": "Multiprofissional",
    "conselho": "CRF",
    "classificacaoSalarial": "Multiprofissional",
    "categoriaSalarialSlug": "aux-farmacia",
    "categoriaSalarial": "Aux Farm\u00e1cia",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1003,
    "slug": "auxiliar-administrativo",
    "nome": "Auxiliar Administrativo",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "auxiliar-administrativo",
    "categoriaSalarial": "Auxiliar Administrativo",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1004,
    "slug": "auxiliar-de-consultorio-dentario",
    "nome": "Auxiliar de Consult\u00f3rio Dent\u00e1rio",
    "grupo": "Multiprofissional",
    "conselho": "CRO",
    "classificacaoSalarial": "Multiprofissional",
    "categoriaSalarialSlug": "auxiliar-de-consultorio-dentario",
    "categoriaSalarial": "Auxiliar de Consult\u00f3rio Dent\u00e1rio",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1005,
    "slug": "auxiliar-de-suprimentos",
    "nome": "Auxiliar de Suprimentos",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "auxiliar-de-suprimentos",
    "categoriaSalarial": "Auxiliar de Suprimentos",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1006,
    "slug": "bucomaxilo",
    "nome": "Bucomaxilo",
    "grupo": "Multiprofissional",
    "conselho": "CRO",
    "classificacaoSalarial": "Multiprofissional",
    "categoriaSalarialSlug": "bucomaxilo",
    "categoriaSalarial": "Bucomaxilo",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1007,
    "slug": "coordenador-administrativo",
    "nome": "Coordenador administrativo",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-administrativo",
    "categoriaSalarial": "Coordenador administrativo",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1008,
    "slug": "coordenador-de-bucomaxilo",
    "nome": "Coordenador de Bucomaxilo",
    "grupo": "Administrativo",
    "conselho": "CRO",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-de-bucomaxilo",
    "categoriaSalarial": "Coordenador de Bucomaxilo",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1009,
    "slug": "coordenador-de-enfermagem",
    "nome": "Coordenador de Enfermagem",
    "grupo": "Administrativo",
    "conselho": "COREN",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-de-enfermagem",
    "categoriaSalarial": "Coordenador de Enfermagem",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1010,
    "slug": "coordenador-de-enfermagem-responsavel-tecnico",
    "nome": "Coordenador de Enfermagem Respons\u00e1vel T\u00e9cnico",
    "grupo": "Administrativo",
    "conselho": "COREN",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-de-enfermagem-responsavel-tecnico",
    "categoriaSalarial": "Coordenador de Enfermagem Respons\u00e1vel T\u00e9cnico",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1011,
    "slug": "coordenador-de-farmacia",
    "nome": "Coordenador de Farm\u00e1cia",
    "grupo": "Administrativo",
    "conselho": "CRF",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-de-farmacia",
    "categoriaSalarial": "Coordenador de Farm\u00e1cia",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1012,
    "slug": "coordenador-de-fisioterapia",
    "nome": "Coordenador de Fisioterapia",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-de-fisioterapia",
    "categoriaSalarial": "Coordenador de Fisioterapia",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1013,
    "slug": "coordenador-de-nutricao",
    "nome": "Coordenador de Nutri\u00e7\u00e3o",
    "grupo": "Administrativo",
    "conselho": "CRN",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-de-nutricao",
    "categoriaSalarial": "Coordenador de Nutri\u00e7\u00e3o",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1014,
    "slug": "coordenador-de-processo",
    "nome": "Coordenador de Processo",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-de-processo",
    "categoriaSalarial": "Coordenador de Processo",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1015,
    "slug": "coordenador-de-psicologia",
    "nome": "Coordenador de Psicologia",
    "grupo": "Administrativo",
    "conselho": "CRP",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-de-psicologia",
    "categoriaSalarial": "Coordenador de Psicologia",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1016,
    "slug": "coordenador-de-qualidade",
    "nome": "Coordenador de Qualidade",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-de-qualidade",
    "categoriaSalarial": "Coordenador de Qualidade",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1017,
    "slug": "coordenador-de-servico-social",
    "nome": "Coordenador de Servi\u00e7o Social",
    "grupo": "Administrativo",
    "conselho": "CRESS",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-de-servico-social",
    "categoriaSalarial": "Coordenador de Servi\u00e7o Social",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1018,
    "slug": "coordenador-de-tecnologia",
    "nome": "Coordenador de Tecnologia",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-de-tecnologia",
    "categoriaSalarial": "Coordenador de Tecnologia",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1019,
    "slug": "coordenador-medico",
    "nome": "Coordenador M\u00e9dico",
    "grupo": "Administrativo",
    "conselho": "CRM",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-medico",
    "categoriaSalarial": "Coordenador M\u00e9dico",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1020,
    "slug": "coordenador-medico-responsavel-tecnico",
    "nome": "Coordenador M\u00e9dico Respons\u00e1vel T\u00e9cnico",
    "grupo": "Administrativo",
    "conselho": "CRM",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-medico-responsavel-tecnico",
    "categoriaSalarial": "Coordenador M\u00e9dico Respons\u00e1vel T\u00e9cnico",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1021,
    "slug": "coordenador-padi",
    "nome": "Coordenador Padi",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "coordenador-padi",
    "categoriaSalarial": "Coordenador Padi",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1022,
    "slug": "dentista",
    "nome": "Dentista",
    "grupo": "Multiprofissional",
    "conselho": "CRO",
    "classificacaoSalarial": "Multiprofissional",
    "categoriaSalarialSlug": "dentista",
    "categoriaSalarial": "Dentista",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1023,
    "slug": "direcao-medica-upa-cer",
    "nome": "Dire\u00e7\u00e3o M\u00e9dica UPA/CER",
    "grupo": "Administrativo",
    "conselho": "CRM",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "direcao-medica-upa-cer",
    "categoriaSalarial": "Dire\u00e7\u00e3o M\u00e9dica UPA/CER",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1024,
    "slug": "direcao-upa-cer",
    "nome": "Dire\u00e7\u00e3o UPA/CER",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "direcao-upa-cer",
    "categoriaSalarial": "Dire\u00e7\u00e3o UPA/CER",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1025,
    "slug": "diretor-administrativo-responsavel-tecnico",
    "nome": "Diretor Administrativo Respons\u00e1vel T\u00e9cnico",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "diretor-administrativo-responsavel-tecnico",
    "categoriaSalarial": "Diretor Administrativo Respons\u00e1vel T\u00e9cnico",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1026,
    "slug": "diretor-medico-hospital",
    "nome": "Diretor M\u00e9dico Hospital",
    "grupo": "Administrativo",
    "conselho": "CRM",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "diretor-medico-hospital",
    "categoriaSalarial": "Diretor M\u00e9dico Hospital",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1027,
    "slug": "diretor-unidade",
    "nome": "Diretor Unidade",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "diretor-unidade",
    "categoriaSalarial": "Diretor Unidade",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1028,
    "slug": "enfermeiro-neonatologista",
    "nome": "Enfermeiro Neonatologista",
    "grupo": "Assistencial",
    "conselho": "COREN",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "enfermeiro-neonatologista",
    "categoriaSalarial": "Enfermeiro Neonatologista",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1029,
    "slug": "enfermeiro-obstetrico",
    "nome": "Enfermeiro Obst\u00e9trico",
    "grupo": "Assistencial",
    "conselho": "COREN",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "enfermeiro-obstetrico",
    "categoriaSalarial": "Enfermeiro Obst\u00e9trico",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1030,
    "slug": "enfermeiro-plantonista",
    "nome": "Enfermeiro Plantonista",
    "grupo": "Assistencial",
    "conselho": "COREN",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "enfermeiro-plantonista",
    "categoriaSalarial": "Enfermeiro Plantonista",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1031,
    "slug": "enfermeiro-rotina",
    "nome": "Enfermeiro Rotina",
    "grupo": "Assistencial",
    "conselho": "COREN",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "enfermeiro-rotina",
    "categoriaSalarial": "Enfermeiro Rotina",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1032,
    "slug": "equipe-multi-biomedico-fono-fisio-psico-nutri-t-o-ass-soc-farmaceutico",
    "nome": "Equipe Multi (Biom\u00e9dico; Fono, Fisio, Psico, Nutri, T.O., Ass. Soc. Farmac\u00eautico; )",
    "grupo": "Multiprofissional",
    "conselho": "CRF",
    "classificacaoSalarial": "Multiprofissional",
    "categoriaSalarialSlug": "equipe-multi-biomedico-fono-fisio-psico-nutri-t-o-ass-soc-farmaceutico",
    "categoriaSalarial": "Equipe Multi (Biom\u00e9dico; Fono, Fisio, Psico, Nutri, T.O., Ass. Soc. Farmac\u00eautico; )",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1033,
    "slug": "gerente",
    "nome": "Gerente",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "gerente",
    "categoriaSalarial": "Gerente",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1034,
    "slug": "gerente-multiprofissional",
    "nome": "Gerente Multiprofissional",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "gerente-multiprofissional",
    "categoriaSalarial": "Gerente Multiprofissional",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1035,
    "slug": "maqueiro",
    "nome": "Maqueiro",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "maqueiro",
    "categoriaSalarial": "Maqueiro",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1036,
    "slug": "medico-anestesista",
    "nome": "M\u00e9dico Anestesista",
    "grupo": "Assistencial",
    "conselho": "CRM",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "medico-anestesista",
    "categoriaSalarial": "M\u00e9dico Anestesista",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1037,
    "slug": "medico-cirurgiao-pediatrico",
    "nome": "M\u00e9dico Cirurgi\u00e3o Pedi\u00e1trico",
    "grupo": "Assistencial",
    "conselho": "CRM",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "medico-cirurgiao-pediatrico",
    "categoriaSalarial": "M\u00e9dico Cirurgi\u00e3o Pedi\u00e1trico",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1038,
    "slug": "medico-ginecologista-obstetra",
    "nome": "M\u00e9dico Ginecologista/ Obstetra",
    "grupo": "Assistencial",
    "conselho": "CRM",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "medico-ginecologista-obstetra",
    "categoriaSalarial": "M\u00e9dico Ginecologista/ Obstetra",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1039,
    "slug": "medico-neonatologista",
    "nome": "M\u00e9dico Neonatologista",
    "grupo": "Assistencial",
    "conselho": "CRM",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "medico-neonatologista",
    "categoriaSalarial": "M\u00e9dico Neonatologista",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1040,
    "slug": "medico-neurocirurgiao",
    "nome": "M\u00e9dico Neurocirurgi\u00e3o",
    "grupo": "Assistencial",
    "conselho": "CRM",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "medico-neurocirurgiao",
    "categoriaSalarial": "M\u00e9dico Neurocirurgi\u00e3o",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1041,
    "slug": "medico-plantonista",
    "nome": "M\u00e9dico Plantonista",
    "grupo": "Assistencial",
    "conselho": "CRM",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "medico-plantonista",
    "categoriaSalarial": "M\u00e9dico Plantonista",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1042,
    "slug": "medico-rotina",
    "nome": "M\u00e9dico Rotina",
    "grupo": "Assistencial",
    "conselho": "CRM",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "medico-rotina",
    "categoriaSalarial": "M\u00e9dico Rotina",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1043,
    "slug": "medico-urologista",
    "nome": "M\u00e9dico Urologista",
    "grupo": "Assistencial",
    "conselho": "CRM",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "medico-urologista",
    "categoriaSalarial": "M\u00e9dico Urologista",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1044,
    "slug": "supervisor-administrativo",
    "nome": "Supervisor Administrativo",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "supervisor-administrativo",
    "categoriaSalarial": "Supervisor Administrativo",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1045,
    "slug": "supervisor-de-almoxarifado",
    "nome": "Supervisor de Almoxarifado",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "supervisor-de-almoxarifado",
    "categoriaSalarial": "Supervisor de Almoxarifado",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1046,
    "slug": "supervisor-de-base",
    "nome": "Supervisor de Base",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "supervisor-de-base",
    "categoriaSalarial": "Supervisor de Base",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1047,
    "slug": "tec-de-enfermagem",
    "nome": "T\u00e9c de Enfermagem",
    "grupo": "Assistencial",
    "conselho": "COREN",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "tec-de-enfermagem",
    "categoriaSalarial": "T\u00e9c de Enfermagem",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1048,
    "slug": "tec-de-enfermagem-rotina",
    "nome": "T\u00e9c de Enfermagem Rotina",
    "grupo": "Assistencial",
    "conselho": "COREN",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "tec-de-enfermagem-rotina",
    "categoriaSalarial": "T\u00e9c de Enfermagem Rotina",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1049,
    "slug": "tec-de-farmacia",
    "nome": "T\u00e9c de Farm\u00e1cia",
    "grupo": "Multiprofissional",
    "conselho": "CRF",
    "classificacaoSalarial": "Multiprofissional",
    "categoriaSalarialSlug": "tec-de-farmacia",
    "categoriaSalarial": "T\u00e9c de Farm\u00e1cia",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1050,
    "slug": "tec-de-hemoterapia",
    "nome": "T\u00e9c de Hemoterapia",
    "grupo": "Multiprofissional",
    "conselho": "-",
    "classificacaoSalarial": "Multiprofissional",
    "categoriaSalarialSlug": "tec-de-hemoterapia",
    "categoriaSalarial": "T\u00e9c de Hemoterapia",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1051,
    "slug": "tec-de-imobilizacao",
    "nome": "T\u00e9c de Imobiliza\u00e7\u00e3o",
    "grupo": "Multiprofissional",
    "conselho": "-",
    "classificacaoSalarial": "Multiprofissional",
    "categoriaSalarialSlug": "tec-de-imobilizacao",
    "categoriaSalarial": "T\u00e9c de Imobiliza\u00e7\u00e3o",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1052,
    "slug": "tec-de-laboratorio",
    "nome": "T\u00e9c de Laborat\u00f3rio",
    "grupo": "Multiprofissional",
    "conselho": "-",
    "classificacaoSalarial": "Multiprofissional",
    "categoriaSalarialSlug": "tec-de-laboratorio",
    "categoriaSalarial": "T\u00e9c de Laborat\u00f3rio",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1053,
    "slug": "tec-de-nutricao",
    "nome": "T\u00e9c de Nutri\u00e7\u00e3o",
    "grupo": "Multiprofissional",
    "conselho": "CRN",
    "classificacaoSalarial": "Multiprofissional",
    "categoriaSalarialSlug": "tec-de-nutricao",
    "categoriaSalarial": "T\u00e9c de Nutri\u00e7\u00e3o",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1054,
    "slug": "tec-de-raio-x",
    "nome": "T\u00e9c de Raio X",
    "grupo": "Multiprofissional",
    "conselho": "CRTR",
    "classificacaoSalarial": "Multiprofissional",
    "categoriaSalarialSlug": "tec-de-raio-x",
    "categoriaSalarial": "T\u00e9c de Raio X",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1055,
    "slug": "tec-de-raio-x-responsavel-tecnico",
    "nome": "T\u00e9c de Raio X Respons\u00e1vel T\u00e9cnico",
    "grupo": "Multiprofissional",
    "conselho": "CRTR",
    "classificacaoSalarial": "Multiprofissional",
    "categoriaSalarialSlug": "tec-de-raio-x-responsavel-tecnico",
    "categoriaSalarial": "T\u00e9c de Raio X Respons\u00e1vel T\u00e9cnico",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1056,
    "slug": "tec-de-regulacao",
    "nome": "T\u00e9c de Regula\u00e7\u00e3o",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "tec-de-regulacao",
    "categoriaSalarial": "T\u00e9c de Regula\u00e7\u00e3o",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1057,
    "slug": "tec-de-saude-bucal",
    "nome": "T\u00e9c de Sa\u00fade Bucal",
    "grupo": "Multiprofissional",
    "conselho": "CRO",
    "classificacaoSalarial": "Multiprofissional",
    "categoriaSalarialSlug": "tec-de-saude-bucal",
    "categoriaSalarial": "T\u00e9c de Sa\u00fade Bucal",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1058,
    "slug": "tecnico-de-enfermagem-instrumentador",
    "nome": "T\u00e9cnico de Enfermagem/Instrumentador",
    "grupo": "Assistencial",
    "conselho": "COREN",
    "classificacaoSalarial": "Assistencial",
    "categoriaSalarialSlug": "tecnico-de-enfermagem-instrumentador",
    "categoriaSalarial": "T\u00e9cnico de Enfermagem/Instrumentador",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1059,
    "slug": "tecnico-de-gesso",
    "nome": "T\u00e9cnico de Gesso",
    "grupo": "Multiprofissional",
    "conselho": "-",
    "classificacaoSalarial": "Multiprofissional",
    "categoriaSalarialSlug": "tecnico-de-gesso",
    "categoriaSalarial": "T\u00e9cnico de Gesso",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  },
  {
    "id": 1060,
    "slug": "tecnico-de-tecnologia-da-informacao",
    "nome": "T\u00e9cnico de T\u00e9cnologia da Informa\u00e7\u00e3o",
    "grupo": "Administrativo",
    "conselho": "-",
    "classificacaoSalarial": "Administrativo",
    "categoriaSalarialSlug": "tecnico-de-tecnologia-da-informacao",
    "categoriaSalarial": "T\u00e9cnico de T\u00e9cnologia da Informa\u00e7\u00e3o",
    "temSalario": true,
    "fonte": "Base Salarial RH.xlsx",
    "fontesComplementares": [
      "Manual de Parametros Minimos da Forca de Trabalho 2025 - referencia metodologica",
      "Manual tecnico forca de trabalho area administrativa - referencia metodologica",
      "Planejamento e dimensionamento da forca de trabalho em saude - referencia metodologica"
    ],
    "status": "validado",
    "ativo": true,
    "origem": "seed"
  }
]
