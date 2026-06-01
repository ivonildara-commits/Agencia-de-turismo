import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, X, Send, Sparkles, AlertCircle, RefreshCw, 
  ArrowDown, User, CheckCircle2, ChevronRight, HelpCircle
} from 'lucide-react';
import { Agencia } from '../types';

interface AiChatAssistantProps {
  agencias: Agencia[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export default function AiChatAssistant({ agencias }: AiChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Olá! Sou o **Voyage Fluxo - Assistente Inteligente**.\n\nTenho acesso em tempo real a todas as agências brasileiras cadastradas no seu painel. Posso formular relatórios detalhados, consolidar métricas de implantação, identificar contatos de representantes, resumir distribuições por estado e muito mais!\n\nComo posso apoiar você hoje?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKeyWarning, setApiKeyWarning] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to lowest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setApiKeyWarning(null);
    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Keep only user and assistant messages for the request payload
      // (excludes ID and date to keep Groq schema happy)
      const payloadMessages = [...messages, userMsg].map(({ role, content }) => ({
        role,
        content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: payloadMessages,
          agencias: agencias
        })
      });

      if (!response.ok) {
        throw new Error('Falha de comunicação com o servidor de inteligência artificial.');
      }

      const data = await response.json();

      if (data.error === 'API_KEY_MISSING') {
        const warning = data.message;
        setApiKeyWarning(warning);
        const systemWarningMsg: Message = {
          id: `sys-warning-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Aviso de Configuração:**\n\n${warning}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, systemWarningMsg]);
      } else if (data.success && data.choices?.[0]?.message?.content) {
        const assistantText = data.choices[0].message.content;
        setMessages(prev => [...prev, {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: assistantText,
          timestamp: new Date()
        }]);
      } else {
        throw new Error(data.message || 'Sem resposta do cérebro virtual do Groq.');
      }

    } catch (err: any) {
      console.error('Erro de requisição IA:', err);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `❌ **Ocorreu um erro ao processar sua pergunta:**\n\nNão foi possível obter resposta do servidor. Certifique-se de que o sistema de backend está rodando no modo full-stack e que as chaves de API estão plenamente válidas no seu arquivo .env ou no painel de Secrets.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setApiKeyWarning(null);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Chat reiniciado. Como posso ajudar com as agências de turismo agora?',
        timestamp: new Date()
      }
    ]);
  };

  // Helper to parse simple markdown to HTML strings (bold and linebreaks)
  const formatText = (text: string) => {
    // Escape simple HTML
    let formatted = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br />');

    // Bold replacement (**text** or *text*)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Bullet points conversion
    formatted = formatted.replace(/(?:^|<br \/>)\s*[-•]\s+(.*?)(?=<br \/>|$)/g, (match, p1) => {
      return `<div class="flex items-start gap-1.5 ml-2 my-0.5"><span class="text-[#5A5A40] mt-1 shrink-0">•</span><span>${p1}</span></div>`;
    });

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const suggestions = [
    {
      label: '📊 Auditoria Estatística',
      prompt: 'Faça um resumo estatístico detalhado da implantação nacional de nossas agências. Quantas estão concluídas, em andamento, e quais especialidades predominam?'
    },
    {
      label: '📍 Distribuição Regional (Estados)',
      prompt: 'Quais estados brasileiros possuem a maior concentração de agências parceiras registradas no sistema, e qual o status de implantação neles?'
    },
    {
      label: '✅ Lista de Ativas',
      prompt: 'Quais agências de turismo já concluíram o processo de implantação? Liste seus nomes, CNPJ e cidades correspondentes.'
    },
    {
      label: '📞 Contatos de Líderes',
      prompt: 'Crie uma tabela simples ou uma lista limpa mostrando os nomes das agências, seus contatos de representantes, telefones, emails e website.'
    }
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-45" id="ai-chat-assistant-trigger">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className={`relative group h-14 w-14 rounded-full flex items-center justify-center text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-300 pointer-events-auto bg-[#5A5A40]`}
          title="Falar com Voyage Assistente IA"
        >
          {/* Ambient pulsation ring */}
          <span className="absolute -inset-1 rounded-full bg-[#5A5A40]/30 animate-ping opacity-60 pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close-icon"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="chat-icon"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <MessageSquare className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-1.5 border-[#5A5A40]" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Floating Drawer chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-22 right-6 z-45 w-[90vw] sm:w-[420px] h-[600px] max-h-[80vh] bg-white rounded-3xl border border-[#D6D6CC] shadow-2xl flex flex-col overflow-hidden leading-relaxed font-sans"
            id="ai-chat-drawer"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#FAF9F5] border-b border-[#D6D6CC] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#EBEBE3] border border-[#D6D6CC] text-[#5A5A40] rounded-xl flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-[#5A5A40]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#5A5A40] text-sm leading-tight">
                    Voyage Assistente IA
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-[#7A7A6A] font-bold uppercase tracking-wider">
                      Llama-3 (Groq AI) Ativo
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg hover:bg-[#EBEBE3] text-[#7A7A6A] hover:text-[#2D2D2A] transition-colors"
                  title="Reiniciar conversa"
                  aria-label="Reiniciar conversa"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#EBEBE3] text-[#7A7A6A] hover:text-[#2D2D2A] transition-colors"
                  title="Fechar assistente"
                  aria-label="Fechar assistente"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat message space */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-[#FAF9F5]/30">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Icon indicator */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                      isUser 
                        ? 'bg-[#5A5A40] border-[#5A5A40] text-white' 
                        : 'bg-[#FAF9F5] border-[#D6D6CC] text-[#5A5A40]'
                    }`}>
                      {isUser ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                    </div>

                    {/* Chat Bubble container */}
                    <div className={`flex flex-col max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-3 text-xs leading-relaxed rounded-2xl ${
                        isUser 
                          ? 'bg-[#5A5A40] text-white font-medium rounded-tr-none shadow-xs' 
                          : 'bg-white text-[#2D2D2A] border border-[#E6E6E1] rounded-tl-none shadow-xs'
                      }`}>
                        {formatText(msg.content)}
                      </div>
                      <span className="text-[9px] text-[#A3A380] px-1 font-mono">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#FAF9F5] border border-[#D6D6CC] text-[#5A5A40] flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                  </div>
                  <div className="bg-white text-[#2D2D2A] border border-[#E6E6E1] px-4 py-3 rounded-2xl rounded-tl-none shadow-xs min-w-[80px]">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-[#5A5A40]/70 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-[#5A5A40]/70 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-[#5A5A40]/70 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions (only at top or when empty history, let's keep suggestions available at the bottom above scroll) */}
              {messages.length < 3 && !isLoading && (
                <div className="pt-2 space-y-2">
                  <span className="text-[10px] text-[#A3A380] font-bold uppercase tracking-wider block">
                    Sugestões de Análise Rápidas:
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {suggestions.map((sug) => (
                      <button
                        key={sug.label}
                        onClick={() => handleSendMessage(sug.prompt)}
                        className="w-full text-left px-3 py-2 bg-white hover:bg-[#FAF9F5] text-[#2D2D2A] border border-[#E6E6E1] hover:border-[#D6CE93] rounded-xl text-[11px] font-semibold transition-all flex items-center justify-between group"
                      >
                        <span>{sug.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#A3A380] transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Warn container for API key setup instructions */}
            {apiKeyWarning && (
              <div className="mx-4 mb-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-800 leading-normal">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-bold">Chave de API do Groq Ausente!</p>
                  <p className="mt-0.5">Vá nas configurações da sua sandbox AI Studio (guia de Secrets) e crie uma variável chamada <code>GROQ_API_KEY</code> com a sua chave do console da Groq.</p>
                </div>
              </div>
            )}

            {/* Input Form Footer */}
            <div className="p-3 bg-white border-t border-[#D6D6CC] flex gap-2 items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(inputValue);
                  }
                }}
                disabled={isLoading}
                placeholder="Pergunte sobre as agências, CNPJ, estados..."
                className="flex-1 px-3.5 py-2 hover:border-[#D6CE93] border border-[#D6D6CC] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] text-[#2D2D2A]"
              />
              <button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 rounded-xl text-white bg-[#5A5A40] hover:bg-[#4a4a34] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Enviar Mensagem"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
