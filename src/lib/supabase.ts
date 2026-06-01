import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Agencia, StatusAgencia } from '../types';

const STORAGE_KEYS = {
  URL: 'agencias_travel_supabase_url',
  ANON_KEY: 'agencias_travel_supabase_key',
  LOCAL_DATA: 'agencias_travel_local_items',
};

// SQL to create the table in Supabase
export const SUPABASE_SQL_SCHEMA = `-- Copie e execute este script no editor SQL do seu Supabase:

create table if not exists public.agencias (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  cnpj text,
  contato_nome text,
  contato_email text,
  contato_telefone text,
  cidade text,
  estado text,
  status text not null check (status in ('nao_iniciado', 'em_andamento', 'concluido')),
  especialidade text,
  descricao text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ativa o Row Level Security (RLS)
alter table public.agencias enable row level security;

-- Cria uma política de acesso público total (para testes rápidos)
-- Em produção, você pode restringir se preferir.
create policy "Acesso público total"
on public.agencias
for all
using (true)
with check (true);
`;

// Helper to get active Supabase credentials
export function getCredentials() {
  // 1. Try env variables (React/Vite prefix)
  let url = import.meta.env.VITE_SUPABASE_URL || '';
  let anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  // 2. Try localStorage values (user configured in preview UI)
  const localUrl = localStorage.getItem(STORAGE_KEYS.URL);
  const localKey = localStorage.getItem(STORAGE_KEYS.ANON_KEY);

  let source: 'env' | 'localStorage' | 'none' = 'none';

  if (url && anonKey) {
    source = 'env';
  } else if (localUrl && localKey) {
    url = localUrl;
    anonKey = localKey;
    source = 'localStorage';
  }

  return { url, anonKey, source };
}

// Global supabase client instance
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getCredentials();
  
  if (!url || !anonKey) {
    supabaseInstance = null;
    return null;
  }

  try {
    // Only recreate client if config differs or not created yet
    if (!supabaseInstance) {
      supabaseInstance = createClient(url, anonKey);
    }
    return supabaseInstance;
  } catch (error) {
    console.error('Falha ao instanciar o cliente do Supabase:', error);
    return null;
  }
}

// Reset instance when config changes in UI
export function resetSupabaseInstance() {
  supabaseInstance = null;
}

// Local Storage Fallback Data Management
function getLocalItems(): Agencia[] {
  const data = localStorage.getItem(STORAGE_KEYS.LOCAL_DATA);
  if (!data) {
    // Seed initial data to make preview gorgeous and intuitive
    const initial: Agencia[] = [
      {
        id: '1',
        nome: 'Aventura Exótica Expedições',
        cnpj: '12.345.678/0001-90',
        contato_nome: 'Marcos Silva',
        contato_email: 'contato@aventuraexotica.com',
        contato_telefone: '(11) 98765-4321',
        cidade: 'Bonito',
        estado: 'MS',
        status: 'em_andamento',
        especialidade: 'Ecoturismo & Aventura',
        descricao: 'Agência especializada em turismo ecológico de alta vivência, com passeios de flutuação e trilhas profundas nas regiões de cerrado.',
        website: 'aventuraexotica.com',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        nome: 'Horizonte Azul Viagens',
        cnpj: '98.765.432/0001-10',
        contato_nome: 'Clara Costa',
        contato_email: 'clara@horizonteazul.com.br',
        contato_telefone: '(21) 3211-5432',
        cidade: 'Búzios',
        estado: 'RJ',
        status: 'concluido',
        especialidade: 'Praias & Resorts',
        descricao: 'Focada em viagens de luxo pelo litoral brasileiro, fretamento de lanchas e hospedagens exclusivas com vista para o mar.',
        website: 'horizonteazul.com.br',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        nome: 'Alpina Roteiros Históricos',
        cnpj: '45.192.831/0001-44',
        contato_nome: 'Henrique Alves',
        contato_email: 'atendimento@alpinatour.com',
        contato_telefone: '(31) 99881-2211',
        cidade: 'Ouro Preto',
        estado: 'MG',
        status: 'nao_iniciado',
        especialidade: 'Cultural & Histórico',
        descricao: 'Roteiros guiados por historiadores em cidades históricas de Minas Gerais, focando em culinária mineira e turismo de patrimônio.',
        website: 'alpinatour.com',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
    localStorage.setItem(STORAGE_KEYS.LOCAL_DATA, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function setLocalItems(items: Agencia[]) {
  localStorage.setItem(STORAGE_KEYS.LOCAL_DATA, JSON.stringify(items));
}

// DATABASE LAYER OPERATIONS api (wraps both Supabase and Fallback)
export async function getAgencias(): Promise<Agencia[]> {
  const client = getSupabaseClient();
  
  if (client) {
    try {
      const { data, error } = await client
        .from('agencias')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      return data as Agencia[];
    } catch (err) {
      console.warn('Erro ao ler do Supabase, usando dados locais temporários:', err);
      // Fallback but notify console
      return getLocalItems();
    }
  }

  // Pure fallback local storage
  return getLocalItems();
}

export async function addAgencia(agencia: Omit<Agencia, 'id' | 'created_at'>): Promise<Agencia> {
  const client = getSupabaseClient();
  
  if (client) {
    try {
      const { data, error } = await client
        .from('agencias')
        .insert([agencia])
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      return data as Agencia;
    } catch (err) {
      console.error('Erro ao adicionar no Supabase, adicionando localmente:', err);
    }
  }

  // Local Storage fallback
  const items = getLocalItems();
  const novaAgencia: Agencia = {
    ...agencia,
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
    created_at: new Date().toISOString(),
  };
  
  setLocalItems([novaAgencia, ...items]);
  return novaAgencia;
}

export async function editAgencia(id: string, updates: Partial<Omit<Agencia, 'id' | 'created_at'>>): Promise<Agencia> {
  const client = getSupabaseClient();
  
  if (client) {
    try {
      const { data, error } = await client
        .from('agencias')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      return data as Agencia;
    } catch (err) {
      console.error('Erro ao atualizar no Supabase, atualizando localmente:', err);
    }
  }

  // Local Storage fallback
  const items = getLocalItems();
  let updatedItem: Agencia | null = null;
  
  const updatedItems = items.map((item) => {
    if (item.id === id) {
      updatedItem = { ...item, ...updates };
      return updatedItem;
    }
    return item;
  });

  if (!updatedItem) {
    throw new Error('Agência não encontrada para edição.');
  }

  setLocalItems(updatedItems);
  return updatedItem;
}

export async function removeAgencia(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  
  if (client) {
    try {
      const { error } = await client
        .from('agencias')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      return true;
    } catch (err) {
      console.error('Erro ao excluir no Supabase, excluindo localmente:', err);
    }
  }

  // Local Storage fallback
  const items = getLocalItems();
  const filtered = items.filter((item) => item.id !== id);
  setLocalItems(filtered);
  return true;
}

// Helpers for manual connection config in UI
export function saveLocalCredentials(url: string, anonKey: string) {
  if (!url || !anonKey) {
    localStorage.removeItem(STORAGE_KEYS.URL);
    localStorage.removeItem(STORAGE_KEYS.ANON_KEY);
  } else {
    localStorage.setItem(STORAGE_KEYS.URL, url.trim());
    localStorage.setItem(STORAGE_KEYS.ANON_KEY, anonKey.trim());
  }
  resetSupabaseInstance();
}

export function clearLocalCredentials() {
  localStorage.removeItem(STORAGE_KEYS.URL);
  localStorage.removeItem(STORAGE_KEYS.ANON_KEY);
  resetSupabaseInstance();
}
