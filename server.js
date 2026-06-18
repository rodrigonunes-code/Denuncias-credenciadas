const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT) || 8765;
const root = __dirname;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

const firebaseConfig = () => ({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
});

const sendJson = (response, status, data) => {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(data));
};

const readJsonBody = (request) => new Promise((resolve, reject) => {
  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
    if (body.length > 25_000) {
      reject(new Error("PAYLOAD_TOO_LARGE"));
      request.destroy();
    }
  });
  request.on("end", () => {
    try {
      resolve(JSON.parse(body || "{}"));
    } catch {
      reject(new Error("INVALID_JSON"));
    }
  });
  request.on("error", reject);
});

async function formalizeReport(request, response) {
  const apiKey = process.env.OPENAI_API_KEY;
  const authorization = request.headers.authorization || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token || !process.env.FIREBASE_API_KEY) {
    sendJson(response, 401, { error: "Sessão inválida ou expirada. Entre novamente." });
    return;
  }

  const identityResponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(process.env.FIREBASE_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token })
    }
  );
  if (!identityResponse.ok) {
    sendJson(response, 401, { error: "Sessão inválida ou expirada. Entre novamente." });
    return;
  }

  if (!apiKey) {
    sendJson(response, 503, {
      error: "A IA ainda não está configurada. Defina a variável OPENAI_API_KEY no servidor."
    });
    return;
  }

  try {
    const { report, school, severity, receivedAt } = await readJsonBody(request);
    if (typeof report !== "string" || report.trim().length < 20 || report.length > 5000) {
      sendJson(response, 400, { error: "O relato deve ter entre 20 e 5.000 caracteres." });
      return;
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.5",
        reasoning: { effort: "low" },
        text: { verbosity: "medium" },
        instructions: [
          "Você é um redator administrativo brasileiro especializado em registros escolares.",
          "Transforme o relato recebido em um registro formal, claro, impessoal e organizado em formato de ata.",
          "Preserve rigorosamente todos os fatos informados.",
          "Não invente nomes, datas, horários, locais, falas, testemunhas, providências, conclusões ou enquadramentos legais.",
          "Não atenue nem intensifique a gravidade do conteúdo.",
          "Quando uma informação não tiver sido fornecida, simplesmente a omita.",
          "Corrija ortografia, concordância e pontuação.",
          "Entregue somente o texto final em português do Brasil, sem comentários sobre a tarefa e sem blocos Markdown.",
          "Use o título REGISTRO FORMAL DA DENÚNCIA e parágrafos objetivos. Inclua escola, data do atendimento e classificação somente quando esses dados forem fornecidos."
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
      sendJson(response, 502, {
        error: "A IA não conseguiu processar o relato. Verifique a chave, o saldo e tente novamente."
      });
      return;
    }

    const text = data.output_text || (data.output || [])
      .flatMap((item) => item.content || [])
      .filter((item) => item.type === "output_text")
      .map((item) => item.text)
      .join("\n")
      .trim();

    if (!text) {
      sendJson(response, 502, { error: "A IA não retornou um texto válido." });
      return;
    }

    sendJson(response, 200, { text: text.slice(0, 5000) });
  } catch (error) {
    console.error(error);
    const status = error.message === "PAYLOAD_TOO_LARGE" ? 413 : 400;
    sendJson(response, status, { error: "Não foi possível interpretar os dados enviados." });
  }
}

http.createServer(async (request, response) => {
  const requestedPath = decodeURIComponent(request.url.split("?")[0]);

  if (request.method === "GET" && requestedPath === "/api/firebase-config") {
    const config = firebaseConfig();
    if (Object.values(config).some((value) => !value)) {
      sendJson(response, 503, { error: "Firebase ainda não foi configurado neste ambiente." });
      return;
    }
    sendJson(response, 200, config);
    return;
  }

  if (request.method === "POST" && requestedPath === "/api/formalize") {
    await formalizeReport(request, response);
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { error: "Método não permitido." });
    return;
  }

  const relativePath = requestedPath === "/" ? "index.html" : requestedPath.replace(/^\/+/, "");
  const filePath = path.resolve(root, relativePath);

  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Arquivo não encontrado.");
    return;
  }

  response.writeHead(200, {
    "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    "Cache-Control": "no-store"
  });
  fs.createReadStream(filePath).pipe(response);
}).listen(port, "127.0.0.1", () => {
  console.log(`Controle de Denúncias disponível em http://127.0.0.1:${port}`);
});
