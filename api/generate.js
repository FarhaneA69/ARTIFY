export default async function handler(req, res) {
  // Autoriser uniquement POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Méthode non autorisée"
    });
  }

  try {
    const body = req.body || {};

    const prompt = body.prompt?.trim();
    const image = body.image;

    // Vérifications
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
        error: "OPENAI_API_KEY manquante dans Vercel"
      });
    }

    // Construction de la requête
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-5.6-luna",

          input: [
            {
              role: "user",

              content: [
                {
                  type: "input_text",

                  text: `
Transforme l'image fournie selon cette demande :

${prompt}

IMPORTANT :
- Modifie réellement l'image.
- Respecte au maximum la demande.
- Conserve les éléments importants de l'image originale.
- Crée un résultat visuellement impressionnant.
                  `
                },

                {
                  type: "input_image",

                  image_url: image
                }
              ]
            }
          ],

          tools: [
            {
              type: "image_generation",
              action: "edit",
              model: "gpt-image-1",
              size: "1024x1024",
              quality: "high"
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Erreur OpenAI"
      });
    }

    // Cherche l'image générée
    let generatedImage = null;

    for (const item of data.output || []) {

      if (!item.content) continue;

      for (const content of item.content) {

        if (
          content.type === "image_generation_call" &&
          content.result
        ) {

          generatedImage = content.result;

        }

      }

    }

    if (!generatedImage) {

      console.error("Réponse OpenAI :", data);

      return res.status(500).json({
        error:
          "L'IA n'a pas retourné d'image"
      });

    }

    // Retourne l'image
    return res.status(200).json({

      success: true,

      image:
        `data:image/png;base64,${generatedImage}`

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({

      error:
        error.message ||
        "Erreur serveur"

    });

  }
}
