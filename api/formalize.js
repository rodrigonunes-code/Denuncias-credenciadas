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

  const firebaseResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(process.env.FIREBASE_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token })
    }
  );

  if (!firebaseResponse.ok) return false;
  const data = await firebaseResponse.json();
  return Boolean(data.users?.[0]?.localId);
}

function normalizeNarrative(value = "") {
  return value
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[a-z]*/gi, "").replace(/```/g, ""))
    .replace(/^#+\s*/gm, "")
    .replace(/^\s*(REGISTRO FORMAL (DA|DE) DENÚNCIA|RELATO|ATA)\s*:?\s*/gim, "")
    .replace(/\s*\n+\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function formatAttendanceDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "não informados";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date).replace(",", " às");
}

function buildFormalRecord({ narrative, school, receivedAt }) {
  return [
    "REGISTRO FORMAL DE DENÚNCIA",
    `Escola: ${String(school || "não informada").trim()}`,
    `Data e horário do atendimento: ${formatAttendanceDate(receivedAt)}`,
    narrative,
    "",
    "________________________________________",
    "Assinatura do(a) Fiscal",
    "",
    "________________________________________",
    "Assinatura do(a) Responsável"
  ].join("\n");
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

  if (!process.env.GEMINI_API_KEY) {
    response.status(503).json({ error: "A API do Gemini ainda não foi configurada neste ambiente." });
    return;
  }

  const { report, school, severity, receivedAt } = readBody(request);
  if (typeof report !== "string" || report.trim().length < 20 || report.length > 5000) {
    response.status(400).json({ error: "O relato deve ter entre 20 e 5.000 caracteres." });
    return;
  }

  try {
    const model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: [
                "Você é um redator administrativo brasileiro especializado em registros escolares.",
                "Reescreva somente o relato como um único parágrafo formal, claro, impessoal e contínuo, em estilo de ata.",
                "Não escreva título, escola, data, horário, classificação, tópicos, listas, campos de assinatura ou observações.",
                "Não use quebras de linha nem espaços entre parágrafos.",
                "Preserve rigorosamente todos os fatos informados.",
                "Não invente nomes, datas, horários, locais, falas, testemunhas, providências, conclusões ou enquadramentos legais.",
                "Não atenue nem intensifique a gravidade do conteúdo.",
                "Quando uma informação não tiver sido fornecida, simplesmente a omita.",
                "Corrija ortografia, concordância e pontuação.",
                "Entregue somente o parágrafo final em português do Brasil, sem Markdown."
              ].join(" ")
            }]
          },
          contents: [{
            role: "user",
            parts: [{
              text: JSON.stringify({
                classificacao_interna: typeof severity === "string" ? severity : "",
                relato_original: report.trim()
              })
            }]
          }],
          generationConfig: {
            maxOutputTokens: 1800,
            thinkingConfig: { thinkingLevel: "low" }
          }
        })
      }
    );

    const data = await geminiResponse.json();
    if (!geminiResponse.ok) {
      console.error("Gemini API error:", data?.error?.message || geminiResponse.status);
      const message = geminiResponse.status === 429
        ? "O limite gratuito da IA foi atingido. Aguarde e tente novamente."
        : "A IA não conseguiu processar o relato. Tente novamente.";
      response.status(502).json({ error: message });
      return;
    }

    const generatedText = (data.candidates || [])
      .flatMap((candidate) => candidate.content?.parts || [])
      .map((item) => item.text)
      .filter(Boolean)
      .join(" ");
    const narrative = normalizeNarrative(generatedText).slice(0, 4200).trim();

    if (!narrative) {
      response.status(502).json({ error: "A IA não retornou um relato válido." });
      return;
    }

    const text = buildFormalRecord({ narrative, school, receivedAt });
    response.status(200).json({ text });
  } catch (error) {
    console.error(error);
    response.status(502).json({ error: "Não foi possível acessar o serviço de IA." });
  }
};
