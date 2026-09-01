export default async function handler(req, res) {
  try {
    // Autorise uniquement POST
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Méthode non autorisée"
      });
    }

    // Récupère les données envoyées par le site
    const { prompt } = req.body || {};

    if (!prompt) {
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

    // Pour l'instant, on teste seulement la communication
    return res.status(200).json({
      success: true,
      message: "API ARTIFY fonctionne !",
      prompt: prompt
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Erreur serveur"
    });
  }
}
