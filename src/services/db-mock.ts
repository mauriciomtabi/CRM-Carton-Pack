import type { 
  Usuario, Cliente, ContatoCliente, Visita, Ligacao, 
  Orcamento, HistoricoCompra, Meta, Prospeccao, 
  CarteiraStatus
} from '../types/crm';

// Chaves para o LocalStorage
const KEYS = {
  USUARIOS: 'cp_crm_usuarios',
  CLIENTES: 'cp_crm_clientes',
  CONTATOS: 'cp_crm_contatos',
  VISITAS: 'cp_crm_visitas',
  LIGACOES: 'cp_crm_ligacoes',
  ORCAMENTOS: 'cp_crm_orcamentos',
  COMPRAS: 'cp_crm_compras',
  METAS: 'cp_crm_metas',
  PROSPECCAO: 'cp_crm_prospeccao',
  USER_LOGADO: 'cp_crm_user_logado'
};

// Auxiliar para gerar datas dinâmicas relativas a hoje
const obterDataRelativa = (diasAtras: number, horasOffset = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  d.setHours(d.getHours() + horasOffset);
  return d.toISOString();
};

const obterDataRelativaApenasData = (diasAtras: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - diasAtras);
  return d.toISOString().split('T')[0];
};

// Semente de dados de Usuários Comercial (Exatamente os do PDF + Supervisor e Interno)
const SEED_USUARIOS: Usuario[] = [
  { id: 'usr-inacio', nome: 'Inácio Siqueira', papel: 'supervisor', ativo: true },
  { id: 'usr-pamela', nome: 'Pâmela Siqueira', papel: 'supervisor', ativo: true },
  { id: 'usr-fausto', nome: 'Fausto Fleck', papel: 'supervisor', ativo: true },
  { id: 'usr-thaiane', nome: 'Thaiane Antunes', papel: 'supervisor', ativo: true },
  { id: 'usr-diessica', nome: 'Diéssica Hartmann', papel: 'vendedor_interno', ativo: true },
  { id: 'usr-josimar', nome: 'Josimar Soares', papel: 'vendedor_interno', ativo: true },
  { id: 'usr-elci', nome: 'Elci Alcantara', papel: 'vendedor_interno', ativo: true },
  { id: 'usr-anapaula', nome: 'Ana Paula Nunes', papel: 'vendedor_interno', ativo: true },
  { id: 'usr-felipe', nome: 'Felipe Ribeiro', papel: 'vendedor_interno', ativo: true },
  { id: 'usr-witalo', nome: 'Witalo Frota', papel: 'vendedor_interno', ativo: true },
  { id: 'usr-rep-versapack', nome: 'Versapack Centro de Negocios Ltda', papel: 'representante', ativo: true },
  { id: 'usr-rep-lenad', nome: 'Lenad Comercio e Representações Ltda', papel: 'representante', ativo: true },
  { id: 'usr-rep-jmwm', nome: 'J.M.W.M. Representações e Comercio Ltda', papel: 'representante', ativo: true },
  { id: 'usr-rep-luronzoni', nome: 'Lu Ronzoni Representações Comerciais Ltda', papel: 'representante', ativo: true },
  { id: 'usr-rep-ipepack', nome: 'Ipe Pack Representações e Embalagens Ltda', papel: 'representante', ativo: true },
  { id: 'usr-rep-aline', nome: 'Aline Fernande dos Reis', papel: 'representante', ativo: true },
];

// Gerador dinâmico de 312 clientes para bater os números exatos do PDF
const SEED_CLIENTES = (): Cliente[] => {
  const clientes: Cliente[] = [];
  
  // Cotas de clientes por representante do PDF (Pág 4):
  // Carlos: 86 | Juliana: 71 | Marcos: 94 | Fernanda: 61 => Total: 312
  const reps = [
    { id: 'usr-rep-carlos', cota: 86 },
    { id: 'usr-rep-juliana', cota: 71 },
    { id: 'usr-rep-marcos', cota: 94 },
    { id: 'usr-rep-fernanda', cota: 61 }
  ];

  const prefixos = ['Sul', 'Calçados', 'Vinícola', 'Laticínios', 'Móveis', 'Indústria', 'Chocolate', 'Papéis', 'Distribuidora', 'Frigorífico'];
  const sufixos = ['Alimentos', 'Elegance', 'Vale do Sol', 'Serra Azul', 'do Sul', 'Metalúrgica', 'Gourmet', 'Planalto', 'Estrela', 'Nacional'];
  const cidades = ['Caxias do Sul', 'Bento Gonçalves', 'Novo Hamburgo', 'Lajeado', 'Porto Alegre', 'Gramado', 'Chapecó', 'Joinville', 'Blumenau'];
  const segmentos = ['Papel Cartão', 'Micro-ondulado'];

  let globalIdCounter = 1;
  let semContatoRestante = 23; // Total de 23 sem contato no PDF

  reps.forEach(rep => {
    for (let i = 0; i < rep.cota; i++) {
      const id = `cli-${globalIdCounter}`;
      const pref = prefixos[(globalIdCounter * 3) % prefixos.length];
      const suf = sufixos[(globalIdCounter * 7) % sufixos.length];
      const razao_social = `${pref} ${suf} ${globalIdCounter} Ltda`;
      const cnpj = `${(globalIdCounter + 10).toString().padStart(2, '0')}.${(globalIdCounter + 100).toString().padStart(3, '0')}.${(globalIdCounter + 200).toString().padStart(3, '0')}/0001-${(globalIdCounter % 99).toString().padStart(2, '0')}`;
      const cidade = cidades[globalIdCounter % cidades.length];
      const segmento = segmentos[globalIdCounter % segmentos.length];
      
      // Mapear exatamente 23 clientes como "Sem Contato" (último contato antigo ou inexistente)
      let dataUltimoContato: string | null = null;
      let status_carteira: CarteiraStatus = 'ativo';
      
      if (semContatoRestante > 0 && i % 3 === 0) {
        // Alternar entre Crítico (90 dias) e Atenção (60 dias)
        const diasAtras = semContatoRestante % 2 === 0 ? 95 : 65;
        dataUltimoContato = obterDataRelativa(diasAtras);
        status_carteira = diasAtras === 95 ? 'critico' : 'atencao';
        semContatoRestante--;
      } else {
        dataUltimoContato = obterDataRelativa(globalIdCounter % 20 + 2); // 2 a 22 dias atrás
        status_carteira = 'ativo';
      }

      clientes.push({
        id,
        razao_social,
        cnpj,
        cidade,
        estado: 'RS',
        segmento,
        representante_id: rep.id,
        vendedor_interno_id: 'usr-diessica',
        data_ultima_compra: obterDataRelativa(globalIdCounter % 40 + 5),
        intervalo_medio_compras: 30 + (globalIdCounter % 60),
        data_ultimo_contato: dataUltimoContato,
        status_carteira,
        classificacao_potencial: globalIdCounter % 3 === 0 ? 'A' : globalIdCounter % 3 === 1 ? 'B' : 'C',
        volume_mensal: 5 + (globalIdCounter % 45),
        principais_produtos: segmento === 'Papel Cartão' ? ['Caixas Triplex', 'Cartuchos Offset'] : ['Maletas Micro-onduladas', 'Caixas Acopladas'],
        potencial_crescimento: 'Alto potencial mapeado no CRM',
        exigencias_qualidade: 'Gramatura rígida, resistência BCT',
        necessidade_certificacoes: 'FSC requerida',
        potencial_novos_projetos: 'Embalagem especial de fim de ano'
      });
      globalIdCounter++;
    }
  });

  return clientes;
};

// Contatos fictícios
const SEED_CONTATOS = (clientes: Cliente[]): ContatoCliente[] => {
  const contatos: ContatoCliente[] = [];
  clientes.forEach((c, idx) => {
    if (idx < 50) { // Cria contatos apenas para os primeiros 50
      contatos.push({
        id: `con-${idx + 1}`,
        cliente_id: c.id,
        nome: `Contato Comercial ${idx + 1}`,
        cargo: idx % 2 === 0 ? 'Comprador' : 'Gerente Industrial',
        telefone: `(51) 98877-${(idx + 1000).toString().padStart(4, '0')}`,
        email: `contato${idx + 1}@empresa.com.br`
      });
    }
  });
  return contatos;
};

// Roteiro de Visitas (Exatamente 47 visitas distribuídas por representante do PDF)
const SEED_VISITAS = (clientes: Cliente[]): Visita[] => {
  const visitas: Visita[] = [];
  
  const reps = [
    { id: 'usr-rep-carlos', cota: 12 },
    { id: 'usr-rep-juliana', cota: 9 },
    { id: 'usr-rep-marcos', cota: 15 },
    { id: 'usr-rep-fernanda', cota: 11 }
  ];

  let visitId = 1;
  const objetivos: any[] = ['apresentacao_empresa', 'desenvolvimento_projeto', 'negociacao_comercial', 'pos_venda', 'relacionamento_vinculo', 'qualidade_reclamacao'];

  reps.forEach(rep => {
    const repClientes = clientes.filter(c => c.representante_id === rep.id);
    for (let i = 0; i < rep.cota; i++) {
      const cli = repClientes[i % repClientes.length];
      visitas.push({
        id: `vis-${visitId}`,
        cliente_id: cli.id,
        contato_id: null,
        responsavel_id: rep.id,
        data: obterDataRelativaApenasData(i % 5 + 1), // Visitas na semana atual
        horario_turno: i % 2 === 0 ? 'Tarde' : 'Manhã',
        objetivo: objetivos[visitId % objetivos.length],
        registro_descricao: `Visita realizada para acompanhamento comercial. Mapeamento de novas demandas estruturais.`,
        fornecedores_concorrentes: 'Klabin, Rigesa',
        status: i === 0 ? 'agendada' : 'realizada' // Deixa 1 agendada e as outras realizadas
      });
      visitId++;
    }
  });

  return visitas;
};

// Ligações e Leads (Exatamente 124 ligações distribuídas por representante do PDF)
const SEED_LIGACOES = (clientes: Cliente[]): Ligacao[] => {
  const ligacoes: Ligacao[] = [];
  const reps = [
    { id: 'usr-rep-carlos', cota: 34 },
    { id: 'usr-rep-juliana', cota: 28 },
    { id: 'usr-rep-marcos', cota: 40 },
    { id: 'usr-rep-fernanda', cota: 22 }
  ];

  let ligId = 1;
  const objetivos: any[] = ['negociacao_comercial', 'desenvolvimento_projeto', 'pos_venda', 'relacionamento_vinculo'];

  reps.forEach(rep => {
    const repClientes = clientes.filter(c => c.representante_id === rep.id);
    for (let i = 0; i < rep.cota; i++) {
      const cli = repClientes[i % repClientes.length];
      ligacoes.push({
        id: `lig-${ligId}`,
        cliente_id: cli.id,
        contato_id: null,
        responsavel_id: rep.id,
        data: obterDataRelativaApenasData(i % 5 + 1),
        horario_turno: i % 2 === 0 ? 'Tarde' : 'Manhã',
        objetivo: objetivos[ligId % objetivos.length],
        registro_descricao: `Ligação de follow-up realizada sobre propostas em aberto.`,
        status: 'realizada'
      });
      ligId++;
    }
  });

  return ligacoes;
};

// Orçamentos em Aberto (Exatamente 31 abertos distribuídos por representante do PDF)
const SEED_ORCAMENTOS = (clientes: Cliente[]): Orcamento[] => {
  const orcamentos: Orcamento[] = [];
  const reps = [
    { id: 'usr-rep-carlos', cota: 9 },
    { id: 'usr-rep-juliana', cota: 6 },
    { id: 'usr-rep-marcos', cota: 11 },
    { id: 'usr-rep-fernanda', cota: 5 }
  ];

  let orcId = 1;
  const etapas: any[] = ['solicitacao_briefing', 'ficha_tecnica', 'desenvolvimento', 'pcp', 'programacao', 'enviado_representante', 'solicitacao_amostra'];

  reps.forEach(rep => {
    const repClientes = clientes.filter(c => c.representante_id === rep.id);
    for (let i = 0; i < rep.cota; i++) {
      const cli = repClientes[i % repClientes.length];
      orcamentos.push({
        id: `orc-${orcId}`,
        cliente_id: cli.id,
        responsavel_id: rep.id,
        etapa_atual: etapas[orcId % etapas.length],
        probabilidade_fechamento: 5 + (orcId % 5),
        valor_aprovado: null,
        data_fechamento: null,
        motivo_perda: null,
        justificativa_livre: 'Desenho de faca de corte e viabilidade técnica sob análise.',
        created_at: obterDataRelativa(orcId % 10 + 2)
      });
      orcId++;
    }
  });

  // Adicionar alguns orçamentos fechados (aprovados / perdidos) para históricos e taxas de conversão
  // Carlos: 34% conversão | Juliana: 41% | Marcos: 27% | Fernanda: 38%
  // Para emular isso, vamos salvar compras diretas que somem R$ 612k.

  return orcamentos;
};

// Faturamento Histórico (Exatamente R$ 612k no mês distribuídos pelos representantes)
const SEED_COMPRAS = (clientes: Cliente[]): HistoricoCompra[] => {
  const compras: HistoricoCompra[] = [];
  
  // Metas de faturamento por rep:
  // Carlos: 180k | Juliana: 150k | Marcos: 170k | Fernanda: 112k => Total: 612k
  const distribuicao = [
    { repId: 'usr-rep-carlos', valor: 180000, desc: 'Lote de Caixas Acopladas' },
    { repId: 'usr-rep-juliana', valor: 150000, desc: 'Cartuchos Duplex Verniz UV' },
    { repId: 'usr-rep-marcos', valor: 170000, desc: 'Maletas de Embarque Kraft' },
    { repId: 'usr-rep-fernanda', valor: 112000, desc: 'Estojos Triplex Premium' }
  ];

  let hcId = 1;
  distribuicao.forEach(dist => {
    const repClientes = clientes.filter(c => c.representante_id === dist.repId);
    
    // Divide o valor em duas grandes compras para ficar realista
    const valor1 = Math.round(dist.valor * 0.6);
    const valor2 = dist.valor - valor1;

    const cli1 = repClientes[0 % repClientes.length];
    const cli2 = repClientes[1 % repClientes.length];

    compras.push({
      id: `hc-${hcId}`,
      cliente_id: cli1.id,
      data_compra: obterDataRelativaApenasData(5),
      valor: valor1,
      produtos: `Lote de Embalagens Carton Pack - ${dist.desc}`
    });
    hcId++;

    compras.push({
      id: `hc-${hcId}`,
      cliente_id: cli2.id,
      data_compra: obterDataRelativaApenasData(12),
      valor: valor2,
      produtos: `Lote Complementar Carton Pack - ${dist.desc}`
    });
    hcId++;
  });

  return compras;
};

// Metas
const SEED_METAS = (): Meta[] => [
  { id: 'met-1', usuario_id: 'usr-rep-carlos', tipo: 'ligacoes', periodo: '2026-06', valor_meta: 200 },
  { id: 'met-2', usuario_id: 'usr-rep-carlos', tipo: 'visitas', periodo: '2026-06', valor_meta: 25 },
  { id: 'met-3', usuario_id: 'usr-rep-carlos', tipo: 'faturamento', periodo: '2026-06', valor_meta: 200000 },
  { id: 'met-4', usuario_id: 'usr-rep-juliana', tipo: 'ligacoes', periodo: '2026-06', valor_meta: 180 },
  { id: 'met-5', usuario_id: 'usr-rep-juliana', tipo: 'visitas', periodo: '2026-06', valor_meta: 20 }
];

// Leads de Prospecção
const SEED_PROSPECCAO: Prospeccao[] = [
  { id: 'pr-1', empresa: 'Laticínios Ritter S.A.', contato: 'Roberto Ritter', telefone: '(51) 3452-1100', email: 'roberto@ritteralimentos.com.br', segmento: 'Papel Cartão', status: 'em_abordagem' },
  { id: 'pr-2', empresa: 'Calçados Beira Rio', contato: 'Felipe Santos', telefone: '(51) 98111-2233', email: 'felipe.santos@beirario.com.br', segmento: 'Papel Cartão', status: 'frio' },
  { id: 'pr-3', empresa: 'Cervejaria Dado Bier', contato: 'Eduardo Bier', telefone: '(51) 3388-4422', email: 'eduardo@dadobier.com.br', segmento: 'Micro-ondulado', status: 'frio' }
];

export const DBMock = {
  init() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('cp_crm_v5_official_team_reset')) {
      localStorage.removeItem('crm_users');
      localStorage.removeItem('crm_users_v4');
      localStorage.removeItem('crm_users_v5_official');
      localStorage.removeItem(KEYS.USUARIOS);
      localStorage.removeItem(KEYS.CLIENTES);
      localStorage.removeItem(KEYS.CONTATOS);
      localStorage.removeItem(KEYS.VISITAS);
      localStorage.removeItem(KEYS.LIGACOES);
      localStorage.removeItem(KEYS.ORCAMENTOS);
      localStorage.removeItem(KEYS.COMPRAS);
      localStorage.removeItem(KEYS.METAS);
      localStorage.removeItem(KEYS.PROSPECCAO);
      localStorage.removeItem(KEYS.USER_LOGADO);
      localStorage.setItem('cp_crm_v5_official_team_reset', 'true');
    }
    if (!localStorage.getItem(KEYS.USUARIOS)) {
      const listCli = SEED_CLIENTES();
      localStorage.setItem(KEYS.USUARIOS, JSON.stringify(SEED_USUARIOS));
      localStorage.setItem(KEYS.CLIENTES, JSON.stringify(listCli));
      localStorage.setItem(KEYS.CONTATOS, JSON.stringify(SEED_CONTATOS(listCli)));
      localStorage.setItem(KEYS.VISITAS, JSON.stringify(SEED_VISITAS(listCli)));
      localStorage.setItem(KEYS.LIGACOES, JSON.stringify(SEED_LIGACOES(listCli)));
      localStorage.setItem(KEYS.ORCAMENTOS, JSON.stringify(SEED_ORCAMENTOS(listCli)));
      localStorage.setItem(KEYS.COMPRAS, JSON.stringify(SEED_COMPRAS(listCli)));
      localStorage.setItem(KEYS.METAS, JSON.stringify(SEED_METAS()));
      localStorage.setItem(KEYS.PROSPECCAO, JSON.stringify(SEED_PROSPECCAO));
      localStorage.setItem(KEYS.USER_LOGADO, JSON.stringify(SEED_USUARIOS[1])); // Supervisor Costa de padrão
    }
  },

  reset() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEYS.USUARIOS);
    localStorage.removeItem(KEYS.CLIENTES);
    localStorage.removeItem(KEYS.CONTATOS);
    localStorage.removeItem(KEYS.VISITAS);
    localStorage.removeItem(KEYS.LIGACOES);
    localStorage.removeItem(KEYS.ORCAMENTOS);
    localStorage.removeItem(KEYS.COMPRAS);
    localStorage.removeItem(KEYS.METAS);
    localStorage.removeItem(KEYS.PROSPECCAO);
    localStorage.removeItem(KEYS.USER_LOGADO);
    this.init();
  },

  _getRaw<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    this.init();
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  },

  _setRaw<T>(key: string, data: T[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  },

  getUsuarios(): Usuario[] {
    return this._getRaw<Usuario>(KEYS.USUARIOS);
  },

  getUsuarioLogado(): Usuario {
    if (typeof window === 'undefined') return SEED_USUARIOS[1];
    this.init();
    return JSON.parse(localStorage.getItem(KEYS.USER_LOGADO) || JSON.stringify(SEED_USUARIOS[1])) as Usuario;
  },

  setUsuarioLogado(usuario: Usuario) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEYS.USER_LOGADO, JSON.stringify(usuario));
    window.dispatchEvent(new Event('storage-user-changed'));
  },

  getClientes(): Cliente[] {
    return this._getRaw<Cliente>(KEYS.CLIENTES);
  },

  getClienteById(id: string): Cliente | undefined {
    return this.getClientes().find(c => c.id === id);
  },

  salvarCliente(cliente: Omit<Cliente, 'id' | 'status_carteira' | 'data_ultima_compra' | 'data_ultimo_contato'>): Cliente {
    const clientes = this.getClientes();
    const novo: Cliente = {
      ...cliente,
      id: 'cli-' + Math.random().toString(36).substr(2, 9),
      status_carteira: 'ativo',
      data_ultima_compra: null,
      data_ultimo_contato: null
    };
    clientes.push(novo);
    this._setRaw(KEYS.CLIENTES, clientes);
    this.recalcularStatusCliente(novo.id);
    return this.getClienteById(novo.id)!;
  },

  atualizarCliente(id: string, updates: Partial<Cliente>): Cliente {
    const clientes = this.getClientes();
    const idx = clientes.findIndex(c => c.id === id);
    if (idx !== -1) {
      clientes[idx] = { ...clientes[idx], ...updates };
      this._setRaw(KEYS.CLIENTES, clientes);
      this.recalcularStatusCliente(id);
    }
    return this.getClienteById(id)!;
  },

  recalcularStatusCliente(clienteId: string) {
    const compras = this._getRaw<HistoricoCompra>(KEYS.COMPRAS).filter(c => c.cliente_id === clienteId);
    const visitas = this._getRaw<Visita>(KEYS.VISITAS).filter(v => v.cliente_id === clienteId && v.status === 'realizada');
    const ligacoes = this._getRaw<Ligacao>(KEYS.LIGACOES).filter(l => l.cliente_id === clienteId && l.status === 'realizada');

    let dataUltimaCompra: string | null = null;
    if (compras.length > 0) {
      const datas = compras.map(c => new Date(c.data_compra).getTime());
      dataUltimaCompra = new Date(Math.max(...datas)).toISOString();
    }

    let dataUltimoContato: string | null = null;
    const datasContato: number[] = [];
    visitas.forEach(v => datasContato.push(new Date(v.data).getTime()));
    ligacoes.forEach(l => datasContato.push(new Date(l.data).getTime()));
    if (datasContato.length > 0) {
      dataUltimoContato = new Date(Math.max(...datasContato)).toISOString();
    }

    let status: CarteiraStatus = 'ativo';
    const agora = new Date().getTime();
    
    let diasSemCompra = 9999;
    if (dataUltimaCompra) {
      diasSemCompra = Math.floor((agora - new Date(dataUltimaCompra).getTime()) / (24 * 60 * 60 * 1000));
    }

    let diasSemContato = 9999;
    if (dataUltimoContato) {
      diasSemContato = Math.floor((agora - new Date(dataUltimoContato).getTime()) / (24 * 60 * 60 * 1000));
    }

    if (diasSemCompra <= 180) {
      status = 'ativo';
    } else if (diasSemCompra > 180 && diasSemContato > 180) {
      status = 'inativo';
    } else if (diasSemContato > 90) {
      status = 'critico';
    } else if (diasSemContato > 60) {
      status = 'atencao';
    } else {
      status = 'ativo';
    }

    const clientes = this.getClientes();
    const cIdx = clientes.findIndex(c => c.id === clienteId);
    if (cIdx !== -1) {
      clientes[cIdx].data_ultima_compra = dataUltimaCompra;
      clientes[cIdx].data_ultimo_contato = dataUltimoContato;
      clientes[cIdx].status_carteira = status;
      this._setRaw(KEYS.CLIENTES, clientes);
    }
  },

  getContatos(): ContatoCliente[] {
    return this._getRaw<ContatoCliente>(KEYS.CONTATOS);
  },

  getContatosByCliente(clienteId: string): ContatoCliente[] {
    return this.getContatos().filter(c => c.cliente_id === clienteId);
  },

  salvarContato(contato: Omit<ContatoCliente, 'id'>): ContatoCliente {
    const contatos = this.getContatos();
    const novo: ContatoCliente = {
      ...contato,
      id: 'con-' + Math.random().toString(36).substr(2, 9)
    };
    contatos.push(novo);
    this._setRaw(KEYS.CONTATOS, contatos);
    return novo;
  },

  excluirContato(id: string) {
    const contatos = this.getContatos();
    this._setRaw(KEYS.CONTATOS, contatos.filter(c => c.id !== id));
  },

  getVisitas(): Visita[] {
    return this._getRaw<Visita>(KEYS.VISITAS);
  },

  salvarVisita(visita: Omit<Visita, 'id'>): Visita {
    const visitas = this.getVisitas();
    const novo: Visita = {
      ...visita,
      id: 'vis-' + Math.random().toString(36).substr(2, 9)
    };
    visitas.push(novo);
    this._setRaw(KEYS.VISITAS, visitas);
    if (novo.status === 'realizada') {
      this.recalcularStatusCliente(novo.cliente_id);
    }
    return novo;
  },

  atualizarVisita(id: string, updates: Partial<Visita>): Visita {
    const visitas = this.getVisitas();
    const idx = visitas.findIndex(v => v.id === id);
    if (idx !== -1) {
      visitas[idx] = { ...visitas[idx], ...updates };
      this._setRaw(KEYS.VISITAS, visitas);
      this.recalcularStatusCliente(visitas[idx].cliente_id);
      return visitas[idx];
    }
    throw new Error('Visita não encontrada');
  },

  getLigações(): Ligacao[] {
    return this._getRaw<Ligacao>(KEYS.LIGACOES);
  },

  salvarLigacao(ligacao: Omit<Ligacao, 'id'>): Ligacao {
    const ligacoes = this.getLigações();
    const nova: Ligacao = {
      ...ligacao,
      id: 'lig-' + Math.random().toString(36).substr(2, 9)
    };
    ligacoes.push(nova);
    this._setRaw(KEYS.LIGACOES, ligacoes);
    if (nova.status === 'realizada') {
      this.recalcularStatusCliente(nova.cliente_id);
    }
    return nova;
  },

  atualizarLigacao(id: string, updates: Partial<Ligacao>): Ligacao {
    const ligacoes = this.getLigações();
    const idx = ligacoes.findIndex(l => l.id === id);
    if (idx !== -1) {
      ligacoes[idx] = { ...ligacoes[idx], ...updates };
      this._setRaw(KEYS.LIGACOES, ligacoes);
      this.recalcularStatusCliente(ligacoes[idx].cliente_id);
      return ligacoes[idx];
    }
    throw new Error('Ligação não encontrada');
  },

  getOrcamentos(): Orcamento[] {
    return this._getRaw<Orcamento>(KEYS.ORCAMENTOS);
  },

  salvarOrcamento(orcamento: Omit<Orcamento, 'id'>): Orcamento {
    const orcamentos = this.getOrcamentos();
    const novo: Orcamento = {
      ...orcamento,
      id: 'orc-' + Math.random().toString(36).substr(2, 9)
    };
    orcamentos.push(novo);
    this._setRaw(KEYS.ORCAMENTOS, orcamentos);
    return novo;
  },

  atualizarOrcamento(id: string, updates: Partial<Orcamento>): Orcamento {
    const orcamentos = this.getOrcamentos();
    const idx = orcamentos.findIndex(o => o.id === id);
    if (idx !== -1) {
      orcamentos[idx] = { ...orcamentos[idx], ...updates };
      this._setRaw(KEYS.ORCAMENTOS, orcamentos);

      if (updates.etapa_atual === 'enviado_representante_final' && updates.valor_aprovado && updates.data_fechamento) {
        this.salvarCompra({
          cliente_id: orcamentos[idx].cliente_id,
          data_compra: updates.data_fechamento,
          valor: updates.valor_aprovado,
          produtos: `Orçamento ${id.substring(4)} fechado e aprovado`
        });
      }
      return orcamentos[idx];
    }
    throw new Error('Orçamento não encontrado');
  },

  getCompras(): HistoricoCompra[] {
    return this._getRaw<HistoricoCompra>(KEYS.COMPRAS);
  },

  getComprasByCliente(clienteId: string): HistoricoCompra[] {
    return this.getCompras().filter(c => c.cliente_id === clienteId).sort((a, b) => b.data_compra.localeCompare(a.data_compra));
  },

  salvarCompra(compra: Omit<HistoricoCompra, 'id'>): HistoricoCompra {
    const compras = this.getCompras();
    const nova: HistoricoCompra = {
      ...compra,
      id: 'hc-' + Math.random().toString(36).substr(2, 9)
    };
    compras.push(nova);
    this._setRaw(KEYS.COMPRAS, compras);
    this.recalcularStatusCliente(nova.cliente_id);
    return nova;
  },

  getMetas(): Meta[] {
    return this._getRaw<Meta>(KEYS.METAS);
  },

  getMetasUsuario(usuarioId: string, periodo: string): Meta[] {
    return this.getMetas().filter(m => m.usuario_id === usuarioId && m.periodo === periodo);
  },

  salvarMeta(meta: Omit<Meta, 'id'>): Meta {
    const metas = this.getMetas();
    const idx = metas.findIndex(m => m.usuario_id === meta.usuario_id && m.tipo === meta.tipo && m.periodo === meta.periodo);
    if (idx !== -1) {
      metas[idx].valor_meta = meta.valor_meta;
      this._setRaw(KEYS.METAS, metas);
      return metas[idx];
    } else {
      const nova: Meta = {
        ...meta,
        id: 'met-' + Math.random().toString(36).substr(2, 9)
      };
      metas.push(nova);
      this._setRaw(KEYS.METAS, metas);
      return nova;
    }
  },

  getProspeccoes(): Prospeccao[] {
    return this._getRaw<Prospeccao>(KEYS.PROSPECCAO);
  },

  salvarProspeccao(prosp: Omit<Prospeccao, 'id'>): Prospeccao {
    const prospects = this.getProspeccoes();
    const nova: Prospeccao = {
      ...prosp,
      id: 'pr-' + Math.random().toString(36).substr(2, 9)
    };
    prospects.push(nova);
    this._setRaw(KEYS.PROSPECCAO, prospects);
    return nova;
  },

  atualizarProspeccao(id: string, updates: Partial<Prospeccao>): Prospeccao {
    const prospects = this.getProspeccoes();
    const idx = prospects.findIndex(p => p.id === id);
    if (idx !== -1) {
      prospects[idx] = { ...prospects[idx], ...updates };
      this._setRaw(KEYS.PROSPECCAO, prospects);
      return prospects[idx];
    }
    throw new Error('Prospect não encontrado');
  },

  converterProspectEmCliente(id: string, responsavelId: string, vendedorInternoId: string): Cliente {
    const prospects = this.getProspeccoes();
    const idx = prospects.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Prospect não encontrado');
    
    const p = prospects[idx];
    p.status = 'convertido';
    this._setRaw(KEYS.PROSPECCAO, prospects);

    const cliente = this.salvarCliente({
      razao_social: p.empresa,
      cnpj: 'CNPJ - ' + Math.floor(Math.random()*100000),
      cidade: 'Indefinida',
      estado: 'RS',
      segmento: p.segmento,
      representante_id: responsavelId,
      vendedor_interno_id: vendedorInternoId,
      intervalo_medio_compras: null,
      classificacao_potencial: 'C',
      volume_mensal: 0,
      principais_produtos: [],
      potencial_crescimento: 'Identificado no banco de prospecção',
      exigencias_qualidade: '',
      necessidade_certificacoes: '',
      potencial_novos_projetos: ''
    });

    this.salvarContato({
      cliente_id: cliente.id,
      nome: p.contato,
      cargo: 'Contato de Prospecção',
      telefone: p.telefone,
      email: p.email
    });

    return cliente;
  }
};
