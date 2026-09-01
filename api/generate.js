export default async function handler(req, res) {
  // Autoriser uniquement POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Méthode non autorisée"
    });
  }

  try {
    // Récupération sécurisée des données
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    // Accepte plusieurs noms pour éviter les erreurs
    const prompt =
      body.prompt ||
      body.description ||
      body.text ||
      "";

    // Vérifie le prompt
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt manquant"
      });
    }

    // Vérifie la clé API
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY manquante dans Vercel"
      });
    }

    // Pour l'instant, réponse de test
    return res.status(200).json({
      success: true,
      message: "Prompt reçu avec succès",
      prompt: prompt.trim()
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Erreur serveur"
    });
  }
}
