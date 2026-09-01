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
        error: "OPENAI_API_KEY manquante dans Vercel"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({
          model: "gpt-5.6-luna",

          input: [
            {
              role: "user",

              content: [
                {
                  type: "input_text",

                  text: `Modifie réellement l'image fournie.

Demande du client :
${prompt}

IMPORTANT :
Transforme visuellement l'image originale.
Ne renvoie PAS l'image originale.
Conserve la personne et les éléments importants.
Respecte la demande artistique.
Le résultat doit être spectaculaire et de haute qualité.`
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
              size: "1024x1024",
              quality: "high"
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("OPENAI RESPONSE:", JSON.stringify(data));

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "Erreur OpenAI"
      });
    }

    let generatedImage = null;

    for (const item of data.output || []) {
      if (
        item.type === "image_generation_call" &&
        item.result
      ) {
        generatedImage = item.result;
        break;
      }
    }

    if (!generatedImage) {
      return res.status(500).json({
        error: "L'IA n'a pas retourné d'image"
      });
    }

    return res.status(200).json({
      success: true,
      image: `data:image/png;base64,${generatedImage}`
    });

  } catch (error) {

    console.error("SERVER ERROR:", error);

    return res.status(500).json({
      error: error.message || "Erreur serveur"
    });

  }
}
