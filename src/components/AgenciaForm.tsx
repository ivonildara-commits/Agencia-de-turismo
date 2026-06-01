import React, { useState, useEffect } from 'react';
import { Agencia, StatusAgencia } from '../types';
import { X, Building2, Globe, MapPin, Phone, Mail, User, ShieldCheck, HelpCircle, FileText } from 'lucide-react';

interface AgenciaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Agencia, 'id' | 'created_at'>) => Promise<void>;
  editingAgencia: Agencia | null;
}

const ESPECIALIDADES = [
  'Ecoturismo & Aventura',
  'Sol & Praia',
  'Cultural & Histórico',
  'Negócios & Eventos',
  'Gastronômico',
  'Cruzeiros & Marítimo',
  'Intercâmbio & Estudos',
  'Turismo Religioso'
];

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function AgenciaForm({ isOpen, onClose, onSubmit, editingAgencia }: AgenciaFormProps) {
  const [nome, setNome] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contatoNome, setContatoNome] = useState('');
  const [contatoEmail, setContatoEmail] = useState('');
  const [contatoTelefone, setContatoTelefone] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('SP');
  const [status, setStatus] = useState<StatusAgencia>('nao_iniciado');
  const [especialidade, setEspecialidade] = useState(ESPECIALIDADES[0]);
  const [descricao, setDescricao] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingAgencia) {
      setNome(editingAgencia.nome);
      setCnpj(editingAgencia.cnpj || '');
      setContatoNome(editingAgencia.contato_nome || '');
      setContatoEmail(editingAgencia.contato_email || '');
      setContatoTelefone(editingAgencia.contato_telefone || '');
      setCidade(editingAgencia.cidade || '');
      setEstado(editingAgencia.estado || 'SP');
      setStatus(editingAgencia.status);
      setEspecialidade(editingAgencia.especialidade || ESPECIALIDADES[0]);
      setDescricao(editingAgencia.descricao || '');
      setWebsite(editingAgencia.website || '');
    } else {
      setNome('');
      setCnpj('');
      setContatoNome('');
      setContatoEmail('');
      setContatoTelefone('');
      setCidade('');
      setEstado('SP');
      setStatus('nao_iniciado');
      setEspecialidade(ESPECIALIDADES[0]);
      setDescricao('');
      setWebsite('');
    }
    setErrors({});
  }, [editingAgencia, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!nome.trim()) newErrors.nome = 'O nome da agência é obrigatório.';
    if (!status) newErrors.status = 'O status é obrigatório.';
    if (!especialidade) newErrors.especialidade = 'Selecione uma especialidade.';
    
    if (contatoEmail && !/\S+@\S+\.\S+/.test(contatoEmail)) {
      newErrors.contatoEmail = 'Formato de e-mail inválido.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCNPJ = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 14);
    if (raw.length <= 2) return raw;
    if (raw.length <= 5) return `${raw.slice(0, 2)}.${raw.slice(2)}`;
    if (raw.length <= 8) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5)}`;
    if (raw.length <= 12) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8)}`;
    return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12)}`;
  };

  const formatTelefone = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    if (raw.length <= 2) return raw;
    if (raw.length <= 6) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    if (raw.length <= 10) return `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
    return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCNPJ(e.target.value));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContatoTelefone(formatTelefone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        nome: nome.trim(),
        cnpj: cnpj.trim(),
        contato_nome: contatoNome.trim(),
        contato_email: contatoEmail.trim(),
        contato_telefone: contatoTelefone.trim(),
        cidade: cidade.trim(),
        estado,
        status,
        especialidade,
        descricao: descricao.trim(),
        website: website.trim(),
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao processar o cadastro da agência. Verifique os dados em sua base.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF9F5] border-b border-[#D6D6CC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#EBEBE3] text-[#5A5A40] rounded-xl border border-[#D6D6CC]">
              <Building2 className="w-5 h-5 text-[#5A5A40]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#5A5A40] text-lg">
                {editingAgencia ? 'Editar Cadastro de Agência' : 'Novo Cadastro de Agência'}
              </h3>
              <p className="text-xs text-[#7A7A6A]">
                {editingAgencia ? 'Atualize as informações cadastrais da agência de turismo' : 'Preencha os dados básicos para registrar a agência'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-[#EBEBE3] text-[#7A7A6A] hover:text-[#2D2D2A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Informações Básicas Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] border-b border-[#D6D6CC] pb-1 flex items-center gap-1.5 font-serif">
              Info Geral
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#5A5A40]">Nome da Agência *</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Viagens & Rumos"
                  className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] ${
                    errors.nome ? 'border-rose-450 focus:ring-rose-500/10' : 'border-[#D6D6CC]'
                  }`}
                />
                {errors.nome && <p className="text-xs text-rose-500 font-medium">{errors.nome}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5A5A40]">CNPJ</label>
                <input
                  type="text"
                  value={cnpj}
                  onChange={handleCnpjChange}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-3.5 py-2 border border-[#D6D6CC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5A5A40]">Especialidade / Foco *</label>
                <select
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#D6D6CC] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40]"
                >
                  {ESPECIALIDADES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Status Field */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] border-b border-[#D6D6CC] pb-1 font-serif">
              Status de Implantação
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setStatus('nao_iniciado')}
                className={`py-3 px-4 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  status === 'nao_iniciado'
                    ? 'border-red-400 bg-red-50/70 text-red-800 font-semibold shadow-xs'
                    : 'border-[#D6D6CC] bg-white text-[#7A7A6A] hover:bg-[#FAF9F5]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-xs">Não Iniciado</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('em_andamento')}
                className={`py-3 px-4 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  status === 'em_andamento'
                    ? 'border-[#D6CE93] bg-[#F5F5ED] text-[#5A5A40] font-semibold shadow-xs'
                    : 'border-[#D6D6CC] bg-white text-[#7A7A6A] hover:bg-[#FAF9F5]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#A3A380] animate-pulse" />
                <span className="text-xs">Em Andamento</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('concluido')}
                className={`py-3 px-4 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  status === 'concluido'
                    ? 'border-[#5A5A40] bg-[#EBEBE3] text-[#5A5A40] font-semibold shadow-xs'
                    : 'border-[#D6D6CC] bg-white text-[#7A7A6A] hover:bg-[#FAF9F5]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#5A5A40]" />
                <span className="text-xs">Concluído</span>
              </button>
            </div>
          </div>

          {/* Localização & Website Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] border-b border-[#D6D6CC] pb-1 flex items-center gap-1.5 font-serif">
              Endereço e Contato Digital
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#5A5A40] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#A3A380]" /> Cidade
                </label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Ex: Natal"
                  className="w-full px-3.5 py-2 border border-[#D6D6CC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5A5A40]">Estado (UF)</label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-3.5 py-2 border border-[#D6D6CC] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40]"
                >
                  {ESTADOS.map((uf) => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-semibold text-[#5A5A40] flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#A3A380]" /> Website institucional
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-[#7A7A6A] font-mono">
                    https://
                  </span>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="agenciaturistica.com"
                    className="w-full pl-18 pr-3.5 py-2 border border-[#D6D6CC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contato Responsável Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] border-b border-[#D6D6CC] pb-1 flex items-center gap-1.5 font-serif">
              Representante / Contato Direto
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#5A5A40] flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#A3A380]" /> Nome do Representante
                </label>
                <input
                  type="text"
                  value={contatoNome}
                  onChange={(e) => setContatoNome(e.target.value)}
                  placeholder="Ex: Joana d'Arc"
                  className="w-full px-3.5 py-2 border border-[#D6D6CC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5A5A40] flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#A3A380]" /> E-mail de Contato
                </label>
                <input
                  type="email"
                  value={contatoEmail}
                  onChange={(e) => setContatoEmail(e.target.value)}
                  placeholder="contato@agencia.com"
                  className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] ${
                    errors.contatoEmail ? 'border-rose-450 focus:ring-rose-500/10' : 'border-[#D6D6CC]'
                  }`}
                />
                {errors.contatoEmail && <p className="text-xs text-rose-500 font-medium">{errors.contatoEmail}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#5A5A40] flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#A3A380]" /> Telefone
                </label>
                <input
                  type="text"
                  value={contatoTelefone}
                  onChange={handleTelefoneChange}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3.5 py-2 border border-[#D6D6CC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Descrição Adicional */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#5A5A40] flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#A3A380]" /> Descrição e Detalhes Operacionais
            </label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Digite notas sobre as capacidades operacionais, rotas fortes da agência, ou parcerias chave."
              className="w-full px-3.5 py-2 border border-[#D6D6CC] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] resize-none"
            />
          </div>

        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF9F5] border-t border-[#D6D6CC] flex items-center justify-between">
          <span className="text-[11px] text-[#A3A380] font-bold">
            * Campos obrigatórios
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4.5 py-2 border border-[#D6D6CC] text-[#7A7A6A] hover:bg-[#EBEBE3] hover:text-[#2D2D2A] rounded-full text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#5A5A40] hover:bg-[#4a4a34] text-white rounded-full text-sm font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>{editingAgencia ? 'Salvar Edições' : 'Cadastrar Agência'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
