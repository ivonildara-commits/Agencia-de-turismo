import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON payloads
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Groq Chat Integration Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, agencias } = req.body;

      const apiKey = process.env.GROQ_API_KEY;

      if (!apiKey || apiKey === "YOUR_GROQ_API_KEY") {
        return res.status(200).json({
          error: "API_KEY_MISSING",
          message:
            "A chave de API do Groq (GROQ_API_KEY) não foi configurada. Por favor, acesse o menu de Configurações / Secrets no painel do AI Studio de desenvolvimento e configure a chave `GROQ_API_KEY` para ativar o agente de inteligência artificial ou adicione ao seu arquivo .env local."
        });
      }

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Mensagens inválidas ou ausentes" });
      }

      // Context injection
      const systemMessage = {
        role: "system",
        content: `Você é o Voyage Fluxo - Assistente Inteligente, um especialista virtual dedicado a gerenciar, analisar e dar suporte ao funil de implantação de agências de turismo parceiras brasileiras (sistema Voyage Fluxo).

Atualmente, o sistema possui as seguintes agências de turismo cadastradas com seus respectivos dados e posições no funil (use estes dados para fornecer respostas ultra-precisas):

DADOS DAS AGÊNCIAS DE TURISMO PARCEIRAS:
${JSON.stringify(agencias || [], null, 2)}

DIRETRIZES DE COMPORTAMENTO:
1. Responda SEMPRE em português brasileiro com simpatia, naturalidade e um tom profissional refinado.
2. Seja preciso ao informar dados como CNPJ, estados ou e-mails de contato. Se o usuário perguntar por números ou proporções, faça os cálculos matemáticos reais com base nas agências recebidas acima.
3. Se perguntarem se há agências em um estado específico, liste-as explicando seu status atual (Concluído, Em Andamento ou Não Iniciado).
4. Forneça respostas organizadas estruturalmente com formatação Markdown (negrito, listas pontuadas, tabelas curtas) sempre que for enriquecedor para a leitura.
5. Se uma pergunta for genérica sobre turismo ou técnica que não envolva as agências diretamente, responda com cordialidade contextualizando suas respostas ao universo de fomento da implantação dessas agências.
6. Se o usuário pedir para criar, deletar ou atualizar dados, explique cortesmente que você é um agente de visualização analítica integrado aos dados, mas que as operações de CRUD devem ser feitas diretamente no painel através dos botões de "Cadastrar Agência", "Editar Cadastro" ou mudando o status diretamente no card, no menu específico de cada agência.`
      };

      // Call the Groq API
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [systemMessage, ...messages],
          temperature: 0.3,
          max_tokens: 1500
        })
      });

      if (!groqResponse.ok) {
        const errorData = await groqResponse.json().catch(() => ({}));
        console.error("Groq API error response:", errorData);
        return res.status(500).json({
          error: "GROQ_API_ERROR",
          message: "Ocorreu um erro ao consultar a inteligência artificial do Groq no servidor.",
          details: errorData
        });
      }

      const result = await groqResponse.json();
      res.json({
        success: true,
        choices: result.choices,
        model: result.model
      });
    } catch (error: any) {
      console.error("Error in /api/chat route:", error);
      res.status(500).json({
        error: "INTERNAL_SERVER_ERROR",
        message: error.message || "Erro interno no servidor de chat."
      });
    }
  });

  // Live reload / Vite Middleware in development
  if (process.env.NODE_ENV !== "production") {
    console.log("Registering Vite middleware (Development mode)");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Statics serve in Production mode
    console.log("Registering static assets handler (Production mode)");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Voyage Fluxo Server] Running on http://localhost:${PORT} with Node ${process.version}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server start error:", err);
  process.exit(1);
});
