export interface CNPJaResponse {
  razaoSocial: string;
  cnpj: string;
  cidade: string;
  estado: string;
  isMocked: boolean;
  mensagem?: string;
}

export interface CNPJaSearchResult {
  razao_social: string;
  cnpj: string;
  cidade: string;
  estado: string;
  segmento: string;
  isMock?: boolean;
}

// Lista estática de empresas industriais realistas para busca por Razão Social/Nome Fantasia
const MOCK_EMPRESAS_SEARCH: CNPJaSearchResult[] = [
  { razao_social: 'Klabin S.A. Embalagens', cnpj: '89.637.490/0001-45', cidade: 'Otacílio Costa', estado: 'SC', segmento: 'Micro-ondulado', isMock: true },
  { razao_social: 'Celulose Irani S.A.', cnpj: '92.781.240/0001-89', cidade: 'Vargem Bonita', estado: 'SC', segmento: 'Micro-ondulado', isMock: true },
  { razao_social: 'WestRock Embalagens Brasil Ltda', cnpj: '33.245.980/0001-12', cidade: 'Três Barras', estado: 'SC', segmento: 'Micro-ondulado', isMock: true },
  { razao_social: 'Cartonagem Santa Maria Ltda', cnpj: '08.123.456/0001-77', cidade: 'Bento Gonçalves', estado: 'RS', segmento: 'Papel Cartão', isMock: true },
  { razao_social: 'Sul Embalagens de Papelão Ltda', cnpj: '11.222.333/0001-44', cidade: 'Caxias do Sul', estado: 'RS', segmento: 'Micro-ondulado', isMock: true },
  { razao_social: 'Cartonagem Progresso S.A.', cnpj: '14.555.666/0001-22', cidade: 'Novo Hamburgo', estado: 'RS', segmento: 'Papel Cartão', isMock: true },
  { razao_social: 'Embalagens Vale do Taquari Eireli', cnpj: '22.333.444/0001-55', cidade: 'Lajeado', estado: 'RS', segmento: 'Papel Cartão', isMock: true },
  { razao_social: 'Doces Estrela e Embalagens Ltda', cnpj: '45.678.910/0001-00', cidade: 'Estrela', estado: 'RS', segmento: 'Papel Cartão', isMock: true },
  { razao_social: 'Plásticos e Papéis Cartonados Sul', cnpj: '00.999.888/0001-77', cidade: 'Gravataí', estado: 'RS', segmento: 'Papel Cartão', isMock: true },
  { razao_social: 'Indústria Metalúrgica e Embalagens Metasul', cnpj: '33.444.555/0001-66', cidade: 'Porto Alegre', estado: 'RS', segmento: 'Micro-ondulado', isMock: true }
];

export const cnpjaService = {
  /**
   * Consulta os dados cadastrais de um CNPJ na API CNPJá com fallback determinístico.
   */
  async consultarCNPJ(cnpj: string): Promise<CNPJaResponse> {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) {
      throw new Error('CNPJ deve conter exatamente 14 dígitos.');
    }

    try {
      // Chamada HTTP para a API pública do CNPJá
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout
      
      const response = await fetch(`https://open.cnpja.com/office/${cleanCnpj}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.status === 429) {
        console.warn('CNPJá API rate limit (429) atingido. Usando fallback simulado.');
        return this._obterFallbackSimulado(cleanCnpj, 'Limite de consultas da API CNPJá excedido (5 req/min). Usando preenchimento simulado inteligente.');
      }

      if (!response.ok) {
        throw new Error(`Erro na API CNPJá: Código ${response.status}`);
      }

      const data = await response.json();
      
      // Mapeamento dos campos retornados pela API oficial
      const razaoSocial = data.company?.name || data.alias || 'Empresa Consultada';
      const cidade = data.address?.city?.name || 'Cidade não informada';
      const estado = data.address?.state || 'UF';

      return {
        razaoSocial,
        cnpj: this._formatarCNPJ(cleanCnpj),
        cidade,
        estado,
        isMocked: false
      };

    } catch (error) {
      console.warn('Erro ao consultar CNPJá real, acionando fallback determinístico:', error);
      
      // Fallback amigável
      return this._obterFallbackSimulado(
        cleanCnpj, 
        'Conexão com a API CNPJá falhou (possível CORS ou offline). Os dados abaixo foram gerados de forma simulada.'
      );
    }
  },

  /**
   * Realiza busca de opções de empresas baseado em termo textual (Razão Social).
   */
  async buscarPorRazaoSocial(termo: string): Promise<CNPJaSearchResult[]> {
    if (!termo || termo.trim().length < 2) return [];
    
    const termoLower = termo.toLowerCase();
    
    // Filtrar nossa lista estática mock
    return MOCK_EMPRESAS_SEARCH.filter(emp => 
      emp.razao_social.toLowerCase().includes(termoLower) ||
      emp.cnpj.includes(termoLower) ||
      emp.cidade.toLowerCase().includes(termoLower)
    );
  },

  /**
   * Auxiliar para formatar CNPJ em formato padrão brasileiro: 00.000.000/0000-00
   */
  _formatarCNPJ(cnpj: string): string {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  },

  /**
   * Gera dados simulados estáveis e determinísticos para um determinado CNPJ.
   */
  _obterFallbackSimulado(cnpj: string, mensagem: string): CNPJaResponse {
    // Gerar um índice determinístico simples a partir da soma dos dígitos do CNPJ
    const somaDigitos = cnpj.split('').reduce((acc, char) => acc + (parseInt(char, 10) || 0), 0);
    const index = somaDigitos % MOCK_EMPRESAS_SEARCH.length;
    const baseMock = MOCK_EMPRESAS_SEARCH[index];
    
    // Customizar a razão social com base no final do CNPJ para parecer ainda mais real
    const finalCnpj = cnpj.substring(8, 12);
    const customName = `${baseMock.razao_social.replace(/Ltda|S\.A\./g, '').trim()} (Série ${finalCnpj}) Ltda`;

    return {
      razaoSocial: customName,
      cnpj: this._formatarCNPJ(cnpj),
      cidade: baseMock.cidade,
      estado: baseMock.estado,
      isMocked: true,
      mensagem
    };
  }
};
