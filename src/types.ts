export type StatusAgencia = 'nao_iniciado' | 'em_andamento' | 'concluido';

export interface Agencia {
  id: string;
  nome: string;
  cnpj: string;
  contato_nome: string;
  contato_email: string;
  contato_telefone: string;
  cidade: string;
  estado: string;
  status: StatusAgencia;
  especialidade: string;
  descricao: string;
  website: string;
  created_at: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}
