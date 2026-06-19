module.exports = function handler(request, response) {
  if (request.method !== "GET") {
    response.status(405).json({ error: "Método não permitido." });
    return;
  }

  const config = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };

  if (Object.values(config).some((value) => !value)) {
    response.status(503).json({ error: "Firebase ainda não foi configurado neste ambiente." });
    return;
  }

  response.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  response.status(200).json(config);
};
