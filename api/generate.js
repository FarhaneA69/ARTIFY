export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Méthode non autorisée"
    });
  }

  try {
    const { prompt, image } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt manquant"
      });
    }

    if (!image) {
      return res.status(400).json({
        error: "Image manquante"
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY manquante"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
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

Demande de l'utilisateur :
${prompt}

Tu dois utiliser l'outil de génération d'image pour créer une NOUVELLE version de l'image.
Respecte l'image originale tout en appliquant réellement la transformation demandée.`
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
              input_fidelity: "high",
              quality: "medium",
              size: "1024x1024"
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OPENAI ERROR:", data);

      return res.status(response.status).json({
        error: data?.error?.message || "Erreur OpenAI"
      });
    }

    let generatedImage = null;

    for (const item of data.output || []) {
      for (const content of item.content || []) {

        if (
          content.type === "image_generation_call" &&
          content.result
        ) {
          generatedImage = content.result;
        }

      }
    }

    if (!generatedImage) {
      console.error("NO IMAGE:", JSON.stringify(data));

      return res.status(500).json({
        error: "Aucune image générée"
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
