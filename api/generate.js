export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Méthode non autorisée"
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const prompt = body.prompt?.trim();
    const image = body.image;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt manquant"
      });
    }

    if (!image) {
      return res.status(400).json({
        error: "Image manquante"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "Clé OPENAI_API_KEY manquante"
      });
    }

    // Transforme l'image base64 en fichier
    const matches = image.match(
      /^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/
    );

    if (!matches) {
      return res.status(400).json({
        error: "Format de l'image invalide"
      });
    }

    const mimeType = matches[1];
    const base64Data = matches[3];

    const imageBuffer = Buffer.from(
      base64Data,
      "base64"
    );

    // Création du formulaire multipart
    const formData = new FormData();

    const blob = new Blob(
      [imageBuffer],
      {
        type: mimeType
      }
    );

    formData.append(
      "image",
      blob,
      "image.png"
    );

    formData.append(
      "model",
      "gpt-image-1"
    );

    formData.append(
      "prompt",
      `Transforme réellement cette image.

DEMANDE DU CLIENT :
${prompt}

INSTRUCTIONS IMPORTANTES :
- Modifie réellement l'image originale.
- Ne renvoie jamais simplement la même image.
- Conserve la personne et les éléments importants.
- Respecte précisément le style demandé.
- Le résultat doit être spectaculaire.
- Crée une véritable transformation artistique.
- Haute qualité et très détaillé.`
    );

    formData.append(
      "size",
      "1024x1024"
    );

    formData.append(
      "quality",
      "high"
    );

    const response = await fetch(
      "https://api.openai.com/v1/images/edits",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: formData
      }
    );

    const data = await response.json();

    console.log(
      "OPENAI RESPONSE:",
      JSON.stringify(data)
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Erreur lors de la génération"
      });
    }

    const generatedImage =
      data?.data?.[0]?.b64_json;

    if (!generatedImage) {
      return res.status(500).json({
        error:
          "Aucune image générée par l'IA"
      });
    }

    return res.status(200).json({
      success: true,

      image:
        `data:image/png;base64,${generatedImage}`
    });

  } catch (error) {

    console.error(
      "ERREUR SERVEUR:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "Erreur serveur"
    });
  }
}
