const readBody = (request) => {
  if (typeof request.body === "object" && request.body !== null) return request.body;
  try {
    return JSON.parse(request.body || "{}");
  } catch {
    return {};
  }
};

async function validateFirebaseToken(request) {
  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token || !process.env.FIREBASE_API_KEY) return false;

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(process.env.FIREBASE_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token })
    }
  );
  if (!response.ok) return false;
  const data = await response.json();
  return Boolean(data.users?.[0]?.localId);
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.status(405).json({ error: "Método não permitido." });
    return;
  }

  if (!await validateFirebaseToken(request)) {
    response.status(401).json({ error: "Sessão inválida ou expirada. Entre novamente." });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    response.status(503).json({ error: "A IA ainda não foi configurada neste ambiente." });
    return;
  }

  const { report, school, severity, receivedAt } = readBody(request);
  if (typeof report !== "string" || report.trim().length < 20 || report.length > 5000) {
    response.status(400).json({ error: "O relato deve ter entre 20 e 5.000 caracteres." });
    return;
  }

  try {
    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.5",
        reasoning: { effort: "low" },
        text: { verbosity: "medium" },
        instructions: [
          "Você é um redator administrativo brasileiro especializado em registros escolares.",
          "Transforme o relato em um registro formal, claro, impessoal e organizado em formato de ata.",
          "Preserve rigorosamente todos os fatos informados.",
          "Não invente nomes, datas, horários, locais, falas, testemunhas, providências, conclusões ou enquadramentos legais.",
          "Não atenue nem intensifique a gravidade do conteúdo.",
          "Quando uma informação não tiver sido fornecida, simplesmente a omita.",
          "Corrija ortografia, concordância e pontuação.",
          "Entregue somente o texto final em português do Brasil, sem comentários ou blocos Markdown.",
          "Use o título REGISTRO FORMAL DA DENÚNCIA e parágrafos objetivos."
        ].join(" "),
        input: JSON.stringify({
          escola: typeof school === "string" ? school : "",
          classificacao: typeof severity === "string" ? severity : "",
          data_hora_atendimento: typeof receivedAt === "string" ? receivedAt : "",
          relato_original: report.trim()
        })
      })
    });

    const data = await openAiResponse.json();
    if (!openAiResponse.ok) {
      console.error("OpenAI API error:", data?.error?.message || openAiResponse.status);
      response.status(502).json({ error: "A IA não conseguiu processar o relato. Tente novamente." });
      return;
    }

    const text = data.output_text || (data.output || [])
      .flatMap((item) => item.content || [])
      .filter((item) => item.type === "output_text")
      .map((item) => item.text)
      .join("\n")
      .trim();

    if (!text) {
      response.status(502).json({ error: "A IA não retornou um texto válido." });
      return;
    }

    response.status(200).json({ text: text.slice(0, 5000) });
  } catch (error) {
    console.error(error);
    response.status(502).json({ error: "Não foi possível acessar o serviço de IA." });
  }
};
